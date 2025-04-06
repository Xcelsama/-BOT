
const config = require('../../config');
const mongoose = require('mongoose');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');


const ctx = path.join(__dirname, 'bot.db');
const db = new sqlite3.Database(ctx, (err) => {
    if (err) {} else {
        console.log('Database Connected ✅');
        db.run(`CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            name TEXT,
            isAdmin BOOLEAN
        )`);
        
        db.run(`CREATE TABLE IF NOT EXISTS group_settings (
            group_id TEXT PRIMARY KEY,
            welcome_enabled BOOLEAN DEFAULT true,
            goodbye_enabled BOOLEAN DEFAULT true,
            welcome_message TEXT DEFAULT 'Welcome @user\nTo @group',
            goodbye_message TEXT DEFAULT 'Goodbye @user\nFrom @group'
        )`);
        
        db.run(`CREATE TABLE IF NOT EXISTS groups (
            id TEXT PRIMARY KEY,
            name TEXT,
            member_count INTEGER,
            created_at INTEGER
        )`);
    }
});

const connectDB = async () => {
    try {const conn = await mongoose.connect(config.MONGODB_URI);
        console.log('MongoDB Connected ✅');
        return conn;
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

const yt_user= async (id, name, isAdmin) => {
    return new Promise((resolve, reject) => {
        db.run('INSERT OR REPLACE INTO users (id, name, isAdmin) VALUES (?, ?, ?)',
            [id, name, isAdmin],
            (err) => err ? reject(err) : resolve()
        );
    });
};

const get_yt = async (id) => {
    return new Promise((resolve, reject) => {
        db.get('SELECT * FROM users WHERE id = ?', [id],
            (err, row) => err ? reject(err) : resolve(row)
        );
    });
};

const getGroupSettings = async (group_iid) => {
    return new Promise((resolve, reject) => {
        db.get('SELECT * FROM group_settings WHERE group_id = ?', [group_iid],
            (err, row) => {
                if (err) reject(err);
                if (!row) {
                    db.run('INSERT INTO group_settings (group_id) VALUES (?)', [group_iid]);
                    resolve({
                        group_id: group_iid,
                        welcome_enabled: true,
                        goodbye_enabled: true,
                        welcome_message: 'Welcome @user\nTo @group',
                        goodbye_message: 'Goodbye @user\nFrom @group'
                    });
                } else {
                    resolve(row);
                }
            }
        );
    });
};

const updateGroupSettings = async (groupId, settings) => {
    const keys = Object.keys(settings);
    const values = Object.values(settings);
    const query = `UPDATE group_settings SET ${keys.map(k => `${k} = ?`).join(', ')} WHERE group_id = ?`;
    return new Promise((resolve, reject) => {
        db.run(query, [...values, groupId], (err) => err ? reject(err) : resolve());
    });
};

module.exports = { 
    connectDB,
    db,
    yt_user,
    get_yt,
    getGroupSettings,
    updateGroupSettings
};
    
