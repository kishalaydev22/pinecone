const connectDB = require('../model/connect')
const Product = require('../model/product')
connectDB()
const getData = async () => {
    try {
        const productsToUpdate = await Product.find({ index: { $exists: false } }).select('_id');

        const bulkOps = productsToUpdate.map((product, index) => ({
            updateOne: {
                filter: { _id: product._id },
                update: { $set: { index: index } },
            },
        }));

        const result = await Product.bulkWrite(bulkOps);
        console.log('Products updated:', result.modifiedCount);
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
    }
}
getData();


