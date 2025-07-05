const config = require('./config');
const { SessionCode } = require('./lib/session');
const { connect } = require('./lib/bot');
const { startServer } = require('./lib/server');



startServer();

connect();
