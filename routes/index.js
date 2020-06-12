var express = require('express');
var router = express.Router();
const postController = require('../controllers/postController');
const { check } = require('express-validator');

// GET ALL POSTS FOR TIMELINE
router.get('/', postController.get_all_posts);

// GET A SINGLE POST
router.get('/:id', postController.get_one_post);

// CREATE A POST
router.post('/create', postController.post_new_post);

const reactionOpt = ['Like', 'Love', 'Care', 'Haha', 'Wow', 'Sad', 'Angry'];
// REACT TO A POST
router.put(
    '/:id/react',
    [
        check('reaction', 'Invalid reaction')
            .isLength({ min: 1 })
            .custom((val, { req }) => reactionOpt.includes(val))
            .trim()
            .escape(),
    ],
    postController.put_like_post,
);

// COMMENT A POST
router.put(
    '/:id/comment',
    [
        check('content', 'Your comment must have something in it')
            .isLength({ min: 1 })
            .trim()
            .escape(),
    ],
    postController.post_comment_post,
);

module.exports = router;
