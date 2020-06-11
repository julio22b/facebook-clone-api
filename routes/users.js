var express = require('express');
var router = express.Router();
const userController = require('../controllers/userController');
const friendRequestController = require('../controllers/friendRequestController');
const { check } = require('express-validator');

// GET A USER'S INFO
router.get('/:id', userController.get_one_user);

// SEND FRIEND REQUEST
const statusOpts = ['Accepted', 'Pending', 'Declined'];
router.post(
    '/friend-request/send/:fromUserID/:toUserID',
    [
        check('status')
            .custom((val, { req }) => statusOpts.includes(val))
            .trim()
            .escape(),
    ],
    friendRequestController.post_friend_request,
);

// ACCEPT FRIEND REQUEST
router.put(
    '/friend-request/accept/:fromUserID/:toUserID',
    [
        check('status')
            .custom((val, { req }) => statusOpts.includes(val))
            .trim()
            .escape(),
    ],
    friendRequestController.put_accept_friend_request,
);

// DECLINE FRIEND REQUEST
router.put(
    '/friend-request/decline/:fromUserID/:toUserID',
    [
        check('status')
            .custom((val, { req }) => statusOpts.includes(val))
            .trim()
            .escape(),
    ],
    friendRequestController.put_decline_friend_request,
);

router.post(
    '/log-in',
    [
        check('email', 'Email must be valid').isEmail().trim().escape(),
        check('password', 'Password must be at least 8 characters long')
            .isLength({ min: 8 })
            .trim()
            .escape(),
    ],
    userController.log_in,
);

router.post(
    '/sign-up',
    [
        check('first_name', 'First name is required').isLength({ min: 1, max: 50 }).trim().escape(),
        check('last_name', 'Last name is required').isLength({ min: 1, max: 50 }).trim().escape(),
        check('password', 'Password must be at least 8 characters long')
            .isLength({ min: 8 })
            .trim()
            .escape(),
        check('password_confirmation', 'Passwords must match')
            .custom((value, { req }) => value === req.body.password)
            .trim()
            .escape(),
        check('email', 'Email must be valid').isEmail().trim().escape(),
        check(['day', 'month', 'year'], 'Birthday is required').not().isEmpty().trim().escape(),
        check('gender', 'Choose a gender').not().isEmpty().trim().escape(),
    ],
    userController.sign_up,
);

module.exports = router;
