const connectDB = require('../model/connect')
const Sample = require('../model/testModel')
const Product = require('../model/product')
//const mongoose = require('mongoose')
connectDB()
const startDate = new Date("2022-10-01T00:00:00Z");
const endDate = new Date("2022-11-01T00:00:00Z");
const findArrange = async () => {
    // const data = await Product.aggregate([
    //     {
    //         $match: {
    //             index: {
    //                 $gte: 5,
    //                 $lt: 10
    //             },

    //         }
    //     }
    // ])
    //const data = await Product.find({ "index": { "$gte": 0, "$lt": 1000 } }).skip(900).limit(100)

    const data = await Product.aggregate([
        {
            $match: {
                index: {
                    $gte: 0,
                    $lt: 79000
                },
                embedding: null
            }

        }, {
            $count: "count"
        }

    ])
    //console.log(data)


    console.log(data)
    console.log("done")

}
findArrange()


