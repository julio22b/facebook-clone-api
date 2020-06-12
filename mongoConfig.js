const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'mongo connection error'));
