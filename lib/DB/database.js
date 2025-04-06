const path = require('path');
const sqlite3 = require('sqlite3').verbose();
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

const connectSQLite = () => {
    const ctx = path.join(__dirname, 'bot.db');
    const db = new sqlite3.Database(ctx, (err) => {
        if (err) {
            console.error(err.message);
            process.exit(1);
        } else {
            console.log('Database Connected ✅');
            db.run(`CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                name TEXT,
                isAdmin BOOLEAN
            )`);
        }
    });
    return db;
};

module.exports = {connectMongoDB,connectSQLite};
