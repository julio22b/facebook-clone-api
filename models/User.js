const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    first_name: { type: String, required: true },
    last_name: { type: String, required: true },
    password: { type: String, required: true },
    email: { type: String, required: true },
    birthday: { day: String, month: String, year: Number },
    gender: { type: String, enum: ['Male', 'Female', 'Other'] },
    cover_photo: String,
    profile_picture: String,
    bio: String,
    posts: [{ type: Schema.Types.ObjectId, ref: 'Post' }],
    friends: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    friend_requests: [{ type: Schema.Types.ObjectId, ref: 'FriendRequest' }],
    joined_on: String,
});

module.exports = mongoose.model('User', UserSchema);
