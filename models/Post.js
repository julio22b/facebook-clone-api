const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PostSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    content: { type: String, required: true },
    image: String,
    timestamp: { type: String, required: true },
    reactions: [{ type: String, enum: ['Like', 'Love', 'Care', 'Haha', 'Wow', 'Sad', 'Angry'] }],
    comments: [{ type: Schema.Types.ObjectId, ref: 'Comment' }],
});

module.exports = mongoose.model('Post', PostSchema);
