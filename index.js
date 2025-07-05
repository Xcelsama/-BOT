const config = require('./config');
const { SessionCode } = require('./lib/session');
const { connect } = require('./lib/bot');
const { startServer } = require('./lib/server');

const Client = async () => {
    try {
        await SessionCode(config.session_id || process.env.SESSION_ID, './lib/Session');
        await startServer();
        await connect();
    } catch (error) {
        console.error(error.stack || error);
        process.exit(1);
    }
};

Client();
