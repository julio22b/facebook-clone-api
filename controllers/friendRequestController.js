const FriendRequest = require('../models/FriendRequest');
const User = require('../models/User');
const { validationResult } = require('express-validator');
const moment = require('moment');

// DECLINE A FRIEND REQUEST
exports.post_decline_friend_request = function (req, res, next) {
    const { fromUserID, toUserID } = req.params;
    FriendRequest.findOneAndUpdate(
        { status: 'Pending', from: fromUserID, to: toUserID },
        { status: 'Declined' },
        { new: true },
    )
        .then((declinedReq) => {
            res.status(200).json({ message: 'Friend request declined.' });
        })
        .catch((err) => {
            next(err);
        });
};

// ACCEPT A FRIEND REQUEST
exports.post_accept_friend_request = function (req, res, next) {
    const { fromUserID, toUserID } = req.params;
    FriendRequest.findOneAndUpdate(
        { status: 'Pending', from: fromUserID, to: toUserID },
        { status: 'Accepted' },
        { new: true },
    ).then((frreq) => {
        User.findByIdAndUpdate(fromUserID, { $push: { friends: toUserID } }).then((from) => {
            User.findByIdAndUpdate(toUserID, { $push: { friends: fromUserID } })
                .then((to) => {
                    res.status(200).json({ message: `Friends request accepted.` });
                })
                .catch((err) => {
                    next(err);
                });
        });
    });
};

// SEND A FRIEND REQUEST
exports.post_friend_request = function (req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.errors });
    }

    const { fromUserID, toUserID } = req.params;
    const newFR = new FriendRequest({
        status: 'Pending',
        from: fromUserID,
        to: toUserID,
        timestamp: moment().format('MM/DD/YYYY HH:mm'),
    });
    newFR
        .save()
        .then((document) => {
            res.status(200).json({ document, message: 'Friend request sent.' });
        })
        .catch((err) => {
            next(err);
        });
};
