
const { Configuration, OpenAIApi } = require("openai");
const connectDB = require('../model/connect')
const Product = require('../model/product')
connectDB()


const configuration = new Configuration({
    apiKey: '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',
});
const openai = new OpenAIApi(configuration);

const batchSize = 20; // Adjust the batch size based on your specific requirements and token usage

async function processBatch(batch) {
    const descriptions = batch.map((document) => document.description);

    try {
        const embeddingResponses = [];
        for (const description of descriptions) {
            const embeddingResponse = await openai.createEmbedding({
                model: 'text-embedding-ada-002',
                input: description
            });
            const [{ embedding }] = embeddingResponse.data.data
            embeddingResponses.push(embedding);
        }

        //console.log(embeddingResponses)
        // const embeddings = embeddingResponses.map((embedding) => response.embedding);
        // console.log(embeddings)

        // Update the documents with the embeddings and save them to the database
        const updatePromises = batch.map(async (document, index) => {
            return Product.updateOne({ _id: document._id }, { $set: { embedding: embeddingResponses[index] } });;
        });

        await Promise.all(updatePromises);

    } catch (error) {
        console.error('Error obtaining embeddings:', error);
    }
}

async function processAllDocuments() {
    const documents = await Product.aggregate([
        {
            $match: {
                index: {
                    $gte: 77000,
                    $lt: 79000
                },
                embedding: null
            }
        }
    ])
    const totalDocuments = documents.length;
    const totalBatches = Math.ceil(totalDocuments / batchSize);

    for (let batch = 0; batch < totalBatches; batch++) {
        const startIndex = batch * batchSize;
        const endIndex = Math.min(startIndex + batchSize, totalDocuments);
        const batchDocuments = documents.slice(startIndex, endIndex);

        await processBatch(batchDocuments);

        // Pause between batches to respect the rate limit
        if (batch < totalBatches - 1) {
            console.log(`${batch} no batch`)
            const delay = 60000 / 3; // Throttle requests to stay within the RPM limit
            await new Promise((resolve) => setTimeout(resolve, delay));
        }
    }

    console.log('Processing completed.');

}

processAllDocuments().catch((error) => {
    console.error('Error processing documents:', error);

});


