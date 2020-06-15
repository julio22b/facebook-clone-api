const User = require('../models/User');
const bcrypt = require('bcryptjs');
const moment = require('moment');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

// GET AN USER'S INFO
exports.get_one_user = function (req, res, next) {
    User.findById(req.params.id, '-password')
        .then((user) => {
            res.status(200).json(user);
        })
        .catch((err) => {
            next(err);
        });
};

// GET NEW PEOPLE FOR A USER TO FRIEND
exports.get_new_users = function (req, res, next) {
    User.findOne({ _id: req.params.id })
        .then((user) => {
            User.find({ _id: { $nin: user.friends } }, 'first_name last_name profile_picture')
                .limit(5)
                .then((people) => {
                    res.status(200).json(people);
                });
        })
        .catch((error) => {
            next(error);
        });
};

// USER LOG IN
exports.log_in = function (req, res, next) {
    const { password, email } = req.body;
    console.log(req.body);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.errors });
    }
    User.findOne({ email })
        .then((user) => {
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
                        user_id: user._id,
                    });
                } else {
                    return res.status(400).json({ message: 'Incorrect password' });
                }
            });
        })
        .catch((err) => {
            next(err);
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

    User.findOne({ email })
        .then((document) => {
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
                    joined_on: moment().format('MM Do YYYY'),
                    admin: true,
                });
                user.save()
                    .then((document) => {
                        res.json({ message: 'Account created.' });
                    })
                    .catch((error) => next(error));
            });
        })
        .catch((err) => {
            next(err);
        });
};
