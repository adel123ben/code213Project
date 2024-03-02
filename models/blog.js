const mongoose = require("mongoose");


const blogSchema = new mongoose.Schema({
    title: {
        type: String,
        unique: true,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    image: {
        type: String,

    },
    author: {
        type: String,
        required: true
    },
    likes: {
        type: Number,
        default: 0
    }
},{
    timestamps: true
})

const Blog = mongoose.model("Blog", blogSchema);
module.exports = Blog
