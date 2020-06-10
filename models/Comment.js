const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CommentSchema = new Schema({
    user: [{ type: Schema.Types.ObjectId, ref: 'User', required }],
    content: { type: String, required },
    timestamp: { type: String, required },
    post: { type: Schema.Types.ObjectId, ref: 'Post', required },
    edited: Boolean,
    image: String,
});

module.exports = mongoose.model('Comment', CommentSchema);
