const Post = require('../models/Post');
const Reaction = require('../models/Reaction');
const Comment = require('../models/Comment');
const User = require('../models/User');
const moment = require('moment');
const { validationResult } = require('express-validator');

// GET ALL POSTS, SORTED BY DATE
exports.get_all_posts = function (req, res, next) {
    Post.find()
        .populate('users reactions comments')
        .populate({
            path: 'reactions',
            populate: { path: 'reactor', model: 'User', select: 'first_name last_name' },
        })
        .populate({
            path: 'comments',
            populate: { path: 'reactor', model: 'User', select: 'first_name last_name' },
        })
        .then((posts) => {
            res.status(200).json(posts);
        })
        .catch((err) => {
            next(err);
        });
};

// COMMENT A POST
exports.post_comment_post = function (req, res, next) {
    const { user_id, content, image } = req.body;
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
        image,
    });
    newComment
        .save()
        .then((comment) => {
            res.status(200).json(comment);
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
    newReaction.save().then((savedReaction) => {
        Post.findByIdAndUpdate(
            req.params.id,
            { $push: { reactions: savedReaction } },
            { new: true },
        )
            .then((updatedPost) => {
                res.status(200).json({ updatedPost, message: 'Reacted' });
            })
            .catch((err) => {
                next(err);
            });
    });
};

// GETS A POST BY ID
exports.get_one_post = function (req, res, next) {
    Post.findById(req.params.id)
        .populate('user reactions comments', '-password')
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
    newPost.save().then((post) => {
        res.status(200).json({ post, message: 'Post uploaded' });
    });
};
