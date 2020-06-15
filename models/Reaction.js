const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ReactionSchema = new Schema({
    type: { type: String, enum: ['Like', 'Love', 'Haha', 'Wow', 'Sad', 'Angry'] },
    reactor: { type: Schema.Types.ObjectId, ref: 'User' },
});

module.exports = mongoose.model('Reaction', ReactionSchema);
