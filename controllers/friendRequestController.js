const FriendRequest = require('../models/FriendRequest');
const { validationResult } = require('express-validator');
const moment = require('moment');

// ACCEPT A FRIEND REQUEST
exports.post_accept_friend_request = function (req, res, next) {
    const { fromUser, toUser } = req.params;
    FriendRequest.findOne({ status: 'Pending', from: fromUser, to: toUser }).then();
};

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
        .save()
        .then((document) => {
            res.status(200).json(document);
        })
        .catch((err) => {
            next(err);
        });
};
