require('dotenv').config();
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const cors = require('cors');
const passport = require('passport');
const jwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const User = require('./models/User');
const socket = require('socket.io');

require('./mongoConfig');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

const io = socket();
app.io = io;

let users = [];

io.on('connection', (socket) => {
    socket.on('connection', (currentUserID) => {
        users = users.filter((user) => user.currentUserID !== null);
        const isConnected = users.find((user) => user.currentUserID === currentUserID);
        if (!isConnected) {
            users.push({ socket, currentUserID });
        }
    });

    socket.on('send_message', (data) => {
        const user = users.find((user) => user.currentUserID === data.to);
        const userfrom = users.find((user) => user.currentUserID === data.from);
        if (user) {
            socket.broadcast
                .to(user.socket.id)
                .emit('new_message', { id: data.to, message: data.message });
            socket.broadcast
                .to(userfrom.socket.id)
                .emit('new_message', { id: data.to, message: data.message });
        }
    });

    socket.on('disconnect', () => {
        const user = users.find((user) => user.socket.id === socket.id);
        if (user) {
            users.splice(users.indexOf(user), 1);
        }
    });
});

passport.use(
    new jwtStrategy(
        {
            secretOrKey: process.env.JWT_SECRET,
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        },
        function (payload, done) {
            User.findOne({ email: payload.email }, (err, user) => {
                if (err) return done(err);
                if (!user) {
                    return done(null, false);
                } else {
                    return done(null, user);
                }
            });
        },
    ),
);

app.use(cors());
app.use(passport.initialize());
app.use(logger('dev'));
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: false, limit: '5mb' }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/posts', indexRouter);
app.use('/users', usersRouter);

module.exports = app;
