require('dotenv').config();
require('./mongoConfig');

const Post = require('./models/Post');
const User = require('./models/User');
const faker = require('faker');
const moment = require('moment');

/* let users = [];
for (let i = 0; i < 100; i++) {
    let newuser = {
        first_name: faker.name.firstName(),
        last_name: faker.name.lastName(),
        password: faker.internet.password(8),
        email: faker.internet.email(),
        birthday: { day: '06', month: '26th', year: '2000' },
        gender: 'Male',
        cover_photo: faker.image.nature(),
        profile_picture: faker.image.avatar(),
        bio: faker.hacker.phrase(),
    };
    users.push(newuser);
}

User.insertMany(users); */

let posts = [];

for (let i = 0; i < 7; i++) {
    const post = {
        user: '5ef636e849b4e60e7ac7377f',
        content: faker.hacker.adjective(),
        image: faker.image.nightlife(),
        timestamp: moment().format('HH:mm[,] MM/DD/YYYY'),
    };
    posts.push(post);
}

Post.insertMany(posts);
