const http = require('http');
const axios = require('axios');
const PORT = process.env.PORT || 3000;
const UPTIME_API = 'https://naxor-garfield.hf.space/api/add';
function reUptime_Bot() {
    const id = `http://localhost:${PORT}`; 
    axios.post(UPTIME_API, { url: id })
        .then(() => {
            console.log(' Registered with uptime bot');
        })
        .catch((err) => {
            console.error(err.message);
        });
}

function startServer() {
    const server = http.createServer((req, res) => {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
        res.setHeader('Content-Type', 'application/json');

        const url = req.url;
        const method = req.method;

        if (method === 'GET' && url === '/') {
            res.statusCode = 200;
            res.end(JSON.stringify({
                status: 'success',
                message: 'Garfield is running',
                timestamp: new Date().toISOString()
            }));
        } else if (method === 'GET' && url === '/health') {
            res.statusCode = 200;
            res.end(JSON.stringify({
                status: 'healthy',
                uptime: process.uptime(),
                timestamp: new Date().toISOString()
            }));
        } else if (method === 'GET' && url === '/bot/status') {
            res.statusCode = 200;
            res.end(JSON.stringify({
                status: 'active',
                message: 'connected and running',
                timestamp: new Date().toISOString()
            }));
        } else {
            res.statusCode = 404;
            res.end(JSON.stringify({
                error: 'Not Found',
                message: 'The requested resource was not found'
            }));
        }
    });

    server.listen(PORT, () => {
        console.log(`HTTP Server: ${PORT}`);
        reUptime_Bot();
    });

    return server;
}

module.exports = { startServer };
