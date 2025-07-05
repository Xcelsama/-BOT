const http = require('http');
const PORT = process.env.PORT || 8000;

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
                message: 'Gafield is running',
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

    server.listen(PORT,() => {
        console.log(`HTTP Server: ${PORT}`);
    });

    return server;
}

module.exports = { startServer };
