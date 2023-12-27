const connectDB = require('../model/connect')
const Product = require('../model/product')
const { PineconeClient } = require("@pinecone-database/pinecone");
connectDB()
const pinecone = new PineconeClient()
const run = async () => {
    try {
        // Initialize Pinecone client
        await pinecone.init({
            environment: 'asia-southeast1-gcp-free',
            apiKey: '27b8704c-5b6f-421d-817d-b53bc0a60443'
        });

        const pineconeIndex = pinecone.Index('producthunt');

        // Connect to MongoDB

        // Set batch size and delay
        const batchSize = 100; // Number of documents to process in each batch
        const delay = 2000; // Delay in milliseconds between each batch

        // Get total number of documents in the collection
        const data = await Product.find({ "index": { "$gte": 75000, "$lt": 80000 } })
        const totalDocuments = data.length

        // Calculate number of batches
        const numBatches = Math.ceil(totalDocuments / batchSize);

        for (let i = 0; i < numBatches; i++) {
            const startIdx = i * batchSize;
            const endIdx = Math.min((i + 1) * batchSize, totalDocuments);

            // Fetch documents in the current batch
            const documents = await Product.find({ "index": { "$gte": 75000, "$lt": 80000 } }).skip(startIdx).limit(batchSize)

            // Prepare vectors for upsert request
            const vectors = documents.map((document, index) => ({
                id: document.phId, // Assuming 'phId' is the unique identifier
                metadata: {
                    index: document.index,
                    phId: document.phId,
                    name: document.name,
                    website: document.website,
                    createdAt: document.createdAt,
                    tagline: document.tagline
                },
                values: document.embedding// Assuming 'embeddings' is the field containing the embedding vector
            }));

            // Construct upsert request
            const upsertRequest = {
                vectors: vectors,
                namespace: 'producthunt'
            };

            // Upsert the documents to the Pinecone index
            await pineconeIndex.upsert({ upsertRequest });

            if (i < numBatches - 1) {
                console.log(`${i} no batch inserted`)
                await new Promise((resolve) => setTimeout(resolve, delay));
            }
        }
        console.log(`process completed`)
        // Close the MongoDB connection

    } catch (e) {
        console.error(e);
    }
};

run();
