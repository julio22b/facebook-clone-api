const Post = require('../models/Post');
const Reaction = require('../models/Reaction');
const Comment = require('../models/Comment');
const User = require('../models/User');
const moment = require('moment');
const { validationResult } = require('express-validator');

// GET USER'S FRIENDS' POSTS, SORTED BY DATE USING THE POST _ID FIELD
exports.get_all_posts = function (req, res, next) {
    User.findOne({ _id: req.query.user }, 'friends').then((currentUser) => {
        Post.find({ $or: [{ user: currentUser._id }, { user: { $in: currentUser.friends } }] })
            .populate('user', 'first_name last_name profile_picture')
            .populate({
                path: 'reactions',
                populate: { path: 'reactor', model: 'User', select: 'first_name last_name' },
            })
            .populate({
                path: 'comments',
                populate: {
                    path: 'user',
                    model: 'User',
                    select: 'first_name last_name profile_picture',
                },
            })
            .sort({ _id: -1 })
            .then((posts) => {
                res.status(200).json(posts);
            })
            .catch((err) => {
                next(err);
            });
    });
};

// GET ALL POSTS FROM ONE USER
exports.get_user_posts = function (req, res, next) {
    Post.find({ user: { $eq: req.params.id } })
        .populate({
            path: 'comments',
            populate: {
                path: 'user',
                model: 'User',
                select: 'first_name last_name profile_picture',
            },
        })
        .populate('user', 'first_name last_name profile_picture')
        .populate({
            path: 'reactions',
            populate: { path: 'reactor', model: 'User', select: 'first_name last_name' },
        })
        .sort({ _id: -1 })
        .then((posts) => {
            res.status(200).json(posts);
        })
        .catch((err) => {
            next(err);
        });
};

// COMMENT A POST
exports.put_comment_post = function (req, res, next) {
    const { user_id, content } = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.errors });
    }
    const newComment = new Comment({
        user: user_id,
        content,
        timestamp: moment().format('MM/DD/YYYY HH:mm'),
        post: req.params.id,
        edited: false,
    });
    newComment
        .save()
        .then((comment) => {
            Post.findByIdAndUpdate(
                req.params.id,
                { $push: { comments: newComment } },
                { new: true },
            ).then((post) => {
                comment
                    .populate('user', 'first_name last_name profile_picture')
                    .execPopulate()
                    .then((comment) => {
                        res.status(200).json(comment);
                    });
            });
        })
        .catch((err) => {
            next(err);
        });
};

// LIKE A POST
exports.put_like_post = function (req, res, next) {
    const { reaction, user_id } = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ message: 'Reaction is invalid' });
    }
    const newReaction = new Reaction({
        type: reaction,
        reactor: user_id,
    });
    newReaction
        .save()
        .then((savedReaction) => {
            Post.findByIdAndUpdate(
                req.params.id,
                { $push: { reactions: savedReaction } },
                { new: true },
            ).then((updatedPost) => {
                savedReaction
                    .populate('reactor', 'first_name last_name')
                    .execPopulate()
                    .then((reaction) => {
                        res.status(200).json(reaction);
                    });
            });
        })
        .catch((err) => {
            next(err);
        });
};

// GETS A POST BY ID
exports.get_one_post = function (req, res, next) {
    Post.findById(req.params.id)
        .populate('user', '-password')
        .populate({
            path: 'reactions',
            populate: { path: 'reactor', model: 'User', select: 'first_name last_name' },
        })
        .populate({
            path: 'comments',
            populate: { path: 'user', model: 'User', select: 'first_name last_name' },
        })
        .then((document) => {
            res.status(200).json(document);
        });
};

// MAKE A NEW POST
exports.post_new_post = function (req, res, next) {
    const { user_id, content, image } = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.errors });
    }
    const newPost = new Post({
        user: user_id,
        content,
        image,
        timestamp: moment().format('HH:mm[,] MM/DD/YYYY'),
    });
    newPost
        .save()
        .then((post) => {
            newPost
                .populate('user', 'first_name last_name profile_picture')
                .execPopulate()
                .then((populatedPost) => {
                    res.status(200).json({ post, message: 'Post created' });
                });
        })
        .catch((err) => next(err));
};

// DELETE A POST
exports.delete_post = function (req, res, next) {
    Post.findByIdAndDelete(req.params.id)
        .then((deletedPost) => {
            res.status(200).json({ message: 'Post deleted' });
        })
        .catch((err) => {
            next(err);
        });
};

// UPDATE A POST
exports.update_post = function (req, res, next) {
    const { content } = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json(errors.errors);
    }
    const updatedPost = {
        content,
    };
    Post.findByIdAndUpdate(req.params.id, updatedPost, { new: true }).then((update) => {
        res.status(200).json({ message: 'Post updated', update });
    });
};
