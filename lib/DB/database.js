const path = require('path');
const mongoose = require('mongoose');
const config = require('../../config');

const connectMongoDB = async () => {
    try {
        const conn = await mongoose.connect(config.MONGODB_URI);
        console.log('MongoDB Connected ✅');
        return conn;
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
};


module.exports = {connectMongoDB};
