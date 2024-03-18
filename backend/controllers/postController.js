const cloudinary = require('../utils/cloudinary');
const Post = require('../models/postModel');
const ErrorResponse = require('../utils/errorResponse');
const main = require('../app');
const { v4: uuidv4 } = require('uuid');

//create post
exports.createPost = async (req, res, next) => {
    const { title, content, postedBy, image, likes, comments } = req.body;

    try {
        //upload image in cloudinary
        const result = await cloudinary.uploader.upload(image, {
            folder: "posts",
            width: 1200,
            crop: "scale"
        })
        const post = await Post.create({
            title,
            content,
            postedBy: req.user._id,
            image: {
                public_id: result.public_id,
                url: result.secure_url
            },

        });
        res.status(201).json({
            success: true,
            post
        })


    } catch (error) {
        console.log(error);
        console.log(req.user._id);
    }

}


//show posts
exports.showPost = async (req, res, next) => {
    try {
        const posts = await Post.find().sort({ createdAt: -1 }).populate('postedBy', 'name');
        res.status(201).json({
            success: true,
            posts
        })
    } catch (error) {
        next(error);
    }

}


//show single post
exports.showSinglePost = async (req, res, next) => {
    try {
        const post = await Post.findById(req.params.id).populate('comments.postedBy', 'name');
        res.status(200).json({
            success: true,
            post
        })
    } catch (error) {
        next(error);
    }

}


//delete post
exports.deletePost = async (req, res, next) => {
    const currentPost = await Post.findById(req.params.id);

    //delete post image in cloudinary       
    const ImgId = currentPost.image.public_id;
    if (ImgId) {
        await cloudinary.uploader.destroy(ImgId);
    }

    try {
        const post = await Post.findByIdAndRemove(req.params.id);
        res.status(200).json({
            success: true,
            message: "post deleted"
        })

    } catch (error) {
        next(error);
    }

}


//update post
exports.updatePost = async (req, res, next) => {
    try {
        const { title, content, image } = req.body;
        const currentPost = await Post.findById(req.params.id);

        //build the object data
        const data = {
            title: title || currentPost.title,
            content: content || currentPost.content,
            image: image || currentPost.image,
        }

        //modify post image conditionally
        if (req.body.image !== '') {

            const ImgId = currentPost.image.public_id;
            if (ImgId) {
                await cloudinary.uploader.destroy(ImgId);
            }

            const newImage = await cloudinary.uploader.upload(req.body.image, {
                folder: 'posts',
                width: 1200,
                crop: "scale"
            });

            data.image = {
                public_id: newImage.public_id,
                url: newImage.secure_url
            }

        }

        const postUpdate = await Post.findByIdAndUpdate(req.params.id, data, { new: true });

        res.status(200).json({
            success: true,
            postUpdate
        })

    } catch (error) {
        next(error);
    }

}

//add comment
exports.addComment = async (req, res, next) => {
    const { comment } = req.body;
    try {
        const postComment = await Post.findByIdAndUpdate(req.params.id, {
            $push: { comments: { text: comment, postedBy: req.user._id } }
        },
            { new: true }
        );
        const post = await Post.findById(postComment._id).populate('comments.postedBy', 'name email');
        res.status(200).json({
            success: true,
            post
        })

    } catch (error) {
        next(error);
    }

}
exports.addUpvote = async (req, res, next) => {
    try {
        const expirationTime = new Date();
        expirationTime.setDate(expirationTime.getDate() + 1); // Set expiration time to one day from now
        const userIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

        // Check if there's already an upvote from this IP address within the last 24 hours
        const existingUpvote = await Post.findOne({
            _id: req.params.id,
            'upvotes.userIP': userIP, // Search for userIP within the upvotes array
            'upvotes.tokenExpiration': { $gte: new Date(new Date().getTime() - 24 * 60 * 60 * 1000) } // Ensure tokenExpiration is within the last 24 hours
        });
        
        
        if (existingUpvote) {
            throw new Error("You've already upvoted this post within the last 24 hours.");
        }

        const post = await Post.findByIdAndUpdate(req.params.id, {
            $addToSet: {
                upvotes: {
                    userIP,
                    expirationTime
                }
            }
        }, { new: true });

        // Emit socket event (if you're using socket.io)
        const posts = await Post.find().sort({ createdAt: -1 }).populate('postedBy', 'name');
        // Assuming you have socket.io initialized as 'main.io'
        main.io.emit('add-upvote', posts);

        res.status(200).json({
            success: true,
            post,
            posts
        });
    } catch (error) {
        next(error);
    }
};





//remove like
exports.removeLike = async (req, res, next) => {

    try {
        const post = await Post.findByIdAndUpdate(req.params.id, {
            $pull: { likes: req.user._id }
        },
            { new: true }
        );

        const posts = await Post.find().sort({ createdAt: -1 }).populate('postedBy', 'name');
        main.io.emit('remove-like', posts);

        res.status(200).json({
            success: true,
            post
        })

    } catch (error) {
        next(error);
    }

}