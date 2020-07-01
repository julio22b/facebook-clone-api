require('dotenv').config();
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const cors = require('cors');
const passport = require('passport');
const jwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
/* const facebookStrategy = require('passport-facebook').Strategy;
 */ const User = require('./models/User');
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
        console.log(data);
        if (user) {
            socket.broadcast.to(user.socket.id).emit('new_message', {
                id: data.to,
                message: data.message,
                chatIdentifier: data.chatIdentifier,
            });
            socket.broadcast.to(userfrom.socket.id).emit('new_message', {
                id: data.to,
                message: data.message,
                chatIdentifier: data.chatIdentifier,
            });
        } else if (!user) {
            socket.broadcast.to(userfrom.socket.id).emit('new_message', {
                id: data.to,
                message: 'User is not connected at the moment.',
                chatIdentifier: data.chatIdentifier,
            });
        }
    });

    socket.on('new_post', (post) => {
        socket.broadcast.emit('new_post', post);
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

/* passport.use(
    new facebookStrategy(
        {
            clientID: process.env.APP_ID,
            clientSecret: process.env.APP_SECRET,
            callbackURL: 'http://localhost:4000/users/auth/facebook',
        },
        function (accessToken, refreshToken, profile, done) {
            console.log(accessToken, refreshToken, profile);
        },
    ),
); */

app.use(cors());
app.use(passport.initialize());
app.use(logger('dev'));
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: false, limit: '5mb' }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'build')));

app.use('/api/posts', indexRouter);
app.use('/api/users', usersRouter);

app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'build', 'index.html'));
});

module.exports = app;
