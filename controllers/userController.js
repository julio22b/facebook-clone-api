const User = require('../models/User');
const bcrypt = require('bcryptjs');
const moment = require('moment');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const FriendRequest = require('../models/FriendRequest');

// GET AN USER'S INFO
exports.get_one_user = function (req, res, next) {
    User.findById(req.params.id, '-password')
        .populate('posts users')
        .then((user) => {
            res.status(200).json(user);
        })
        .catch((err) => {
            next(err);
        });
};

// GET NEW PEOPLE FOR A USER TO FRIEND
// THIS STILL GETS ME ALL USERS REGARDLESS IF THE CLIENT HAS ALREADY SENT REQUESTS TO THEm!!!!!!
exports.get_new_users = function (req, res, next) {
    User.findOne({ _id: req.params.id }).then((user) => {
        User.find(
            {
                _id: { $nin: user.friends, $ne: user._id },
            },
            'first_name last_name profile_picture',
        )
            .limit(5)
            .populate({ path: 'friend_requests', populate: { path: 'from', model: 'User' } })
            .then((people) => {
                res.status(200).json(people);
            })
            .catch((error) => {
                next(error);
            });
    });
};
// UPDATE USER INFO
exports.update_user_info = function (req, res, next) {
    const { first_name, last_name, cover_photo, profile_photo, bio } = req.body;
    console.log(req.body);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json(errors.errors);
    }
    const updatedUser = {
        first_name,
        last_name,
        cover_photo,
        profile_photo,
        bio,
    };
    User.findByIdAndUpdate(req.params.id, updatedUser, { new: true })
        .then((user) => {
            res.status(200).json({ message: 'Your profile has been updated' });
        })
        .catch((err) => {
            next(err);
        });
};

// USER LOG IN
exports.log_in = function (req, res, next) {
    const { password, email } = req.body;
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
