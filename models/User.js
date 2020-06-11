const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    first_name: { type: String, required: true },
    last_name: { type: String, required: true },
    password: { type: String, required: true },
    email: { type: String, required: true },
    birthday: { day: String, month: String, year: Number },
    gender: { type: String, enum: ['Male', 'Female', 'Other'] },
    profile_picture: String,
    bio: String,
    posts: [{ type: Schema.Types.ObjectId, ref: 'Post' }],
    friends: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    friend_requests: [{ type: Schema.Types.ObjectId, ref: 'FriendRequest' }],
    logged_in: Boolean,
    joined_on: String,
    admin: Boolean,
});

UserSchema.virtual('full_name').get(function () {
    return `${this.first_name} ${this.last_name}`;
});

module.exports = mongoose.model('User', UserSchema);
