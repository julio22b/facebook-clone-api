const User = require('../models/User');
const FriendRequest = require('../models/FriendRequest');
const bcrypt = require('bcryptjs');
const moment = require('moment');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

// SEND A FRIEND REQUEST
exports.post_friend_request = function (req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.errors });
    }

    const { fromUser, toUser } = req.params;
    const newFR = new FriendRequest({
        status: 'Pending',
        from: fromUser,
        to: toUser,
        timestamp: moment().format('MM/DD/YYYY HH:mm'),
    });
    newFR
        .populate('User')
        .save()
        .then((document) => {
            res.status(200).json(document);
        });
};

// USER LOG IN
exports.log_in = function (req, res, next) {
    const { password, email } = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.errors });
    }
    User.findOne({ email }).then((user) => {
        if (!user) return res.status(401).json({ message: 'User not found' });
        bcrypt.compare(password, user.password, (err, success) => {
            if (err) return next(err);
            if (success) {
                const token = jwt.sign(user.toJSON(), process.env.JWT_SECRET, {
                    expiresIn: 3600 * 24 * 7,
                });
                return res.status(200).json({
                    token,
                    message: 'User authenticated',
                });
            } else {
                return res.status(400).json({ message: 'Incorrect password' });
            }
        });
    });
};

// CREATE A NEW USER
exports.sign_up = function (req, res, next) {
    const { first_name, last_name, password, email, day, month, year, gender } = req.body;
    console.log(req.body);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.errors });
        return;
    }

    User.findOne({ email }).then((document) => {
        if (document) {
            return res.json({ message: 'Email already exists' });
        }

        bcrypt.hash(password, 10, (err, hashedPassword) => {
            if (err) return next(err);

            const user = new User({
                first_name,
                last_name,
                password: hashedPassword,
                email,
                birthday: { day, month, year },
                gender,
                joined: moment().format('MM Do YYYY'),
                admin: true,
            });
            user.save()
                .then((document) => {
                    res.json(document);
                })
                .catch((error) => next(error));
        });
    });
};
