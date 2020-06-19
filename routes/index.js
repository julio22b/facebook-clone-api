var express = require('express');
var router = express.Router();
const postController = require('../controllers/postController');
const { check } = require('express-validator');
const passport = require('passport');

// GET ALL POSTS FOR TIMELINE
router.get('/', passport.authenticate('jwt', { session: false }), postController.get_all_posts);

// GET A SINGLE POST
router.get('/:id', passport.authenticate('jwt', { session: false }), postController.get_one_post);

// CREATE A POST
router.post(
    '/create',
    passport.authenticate('jwt', { session: false }),
    [
        check('user_id').trim().escape(),
        check('content', `Your post can't be empty`).not().isEmpty().trim().escape(),
    ],
    postController.post_new_post,
);

const reactionOpt = ['Like', 'Love', 'Haha', 'Wow', 'Sad', 'Angry'];
// REACT TO A POST
router.put(
    '/:id/react',
    passport.authenticate('jwt', { session: false }),
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
    passport.authenticate('jwt', { session: false }),
    [
        check('content', 'Your comment must have something in it')
            .isLength({ min: 1 })
            .trim()
            .escape(),
    ],
    postController.put_comment_post,
);

// DELETE POST
router.delete('/:id', passport.authenticate('jwt', { session: false }), postController.delete_post);

// UPDATE POST
router.put(
    '/:id',
    passport.authenticate('jwt', { session: false }),
    [check('content', `Your post can't be empty`).not().isEmpty().trim().escape()],
    postController.update_post,
);

module.exports = router;
