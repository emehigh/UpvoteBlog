const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema;

const postSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, "title is required"],
        },
        content: {
            type: String,
            required: [true, "content is required"],
        },
        postedBy: {
            type: ObjectId, // Only store ObjectId for consistency
            ref: "User",
        },
        image: {
            url: String,
            public_id: String,
        },
        upvotes: [
            {
                userIP: { type: String },
                tokenExpiration: { type: Date, default: Date.now, expires: 86400 } // expires in 24 hours
            }
        ],
        comments: [
            {
                text: String,
                created: { type: Date, default: Date.now },
                postedBy: {
                    type: ObjectId,
                    ref: "User",
                },
            },
        ],
    },
    { timestamps: true }
);

module.exports = mongoose.model('Post', postSchema);
