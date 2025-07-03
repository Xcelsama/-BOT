const http = require('http');
const { connect } = require('./lib/main');
const { SessionCode } = require('./lib/session');
const config = require('./config');

const startServer = () => {
    const server = http.createServer((req, res) => {
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('[_running_]');
    });

    server.listen(config.PORT, () => {
        console.log(`Server running on port: ${config.PORT}`);
    });
};

const Client = async () => {
    try {
        if (config.SESSION_ID) {
            await SessionCode(config.SESSION_ID, './lib/Session');
        }
        startServer();
        console.log('Starting...');
        await connect();
    } catch (error) {
        console.error(error);
    }
};

Client();
