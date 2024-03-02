const mongoose = require("mongoose");

const likeSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    blog: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Blog",
        required: true
    }
}, {
    timestamps: true
})

const Likes = mongoose.model("Likes", likeSchema);
module.exports = Likes