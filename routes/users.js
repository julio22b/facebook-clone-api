var express = require('express');
var router = express.Router();
const userController = require('../controllers/userController');
const { check } = require('express-validator');

const statusOpts = ['Accepted', 'Pending', 'Declined'];
router.post(
    '/friend-request/:fromUser/:toUser',
    [check('pending').custom((val, { req }) => statusOpts.includes(val))],
    userController.post_friend_request,
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
