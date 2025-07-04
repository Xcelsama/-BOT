const http = require('http');
const { connect } = require('./lib/main');
const { SessionCode } = require('./lib/session');
const config = require('./config');

const server = http.createServer((req, res) => {
res.writeHead(200, {'Content-Type': 'text/plain'});
res.end('[_Running_]\n');
});
const Client = async () => {
    try {   
    await SessionCode(config.SESSION_ID || process.env.SESSION_ID,'./lib/Session');
    console.log('Starting...');
    await connect();
    server.listen(config.PORT, () => {
    console.log(`Server running on port ${config.PORT}`);
    });
   } catch (error) {
    console.error(error);
    process.exit(1); 
    }
};

Client();
