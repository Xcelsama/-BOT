const http = require('http');
const { bot } = require('./lib/main');
const { SessionCode } = require('./lib/session');
const { connectDB } = require('./lib/database');
const config = require('./config');

const startServer = () => {
    const server = http.createServer((req, res) => {
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('running');
    });

    server.listen(config.PORT, () => {
        console.log(`server: ${config.PORT}`);
    });
};

const Client = async () => {
    try {
        await SessionCode(config.SESSION_ID || process.env.SESSION_ID, "./lib/Session");
        await connectDB();
        
        startServer();
        console.log('Starting...');
        await bot.start();
    } catch (error) {
        console.error(error);
    }
};

Client();
