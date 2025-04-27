const fs = require('fs');
const http = require('http');
const config = require('./config');
const { startBot, connectMongoDB, SessionCode } = require('./lib/index');

const server = http.createServer((req, res) => {
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end('Server Running\n');
});
var PORT = config.PORT || process.env.PORT;
const Client = async () => {
    try {
        await SessionCode(config.SESSION_ID || process.env.SESSION_ID, "./lib/multi_auth");
        await connectMongoDB();
        await startBot();
        server.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error(error.stack);
        process.exit(1); 
    }
}

Client();
