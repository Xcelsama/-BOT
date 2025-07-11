const http = require('http');
const axios = require('axios');
const PORT = process.env.PORT || 3000;
const UPTIME_API = 'https://naxor-garfield.hf.space/api/add';
const config = require('../config'); 

async function detectHostingPlatform() {
    if (process.env.KOYEB_APP_NAME) return 'koyeb';
    if (process.env.RENDER) return 'render';
    if (process.env.PT_HOSTNAME || config.PT_PANEL) return 'pterodactyl';
    return 'unknown';
}

async function pingPlatformAPI(platform) {
    try {
        if (platform === 'koyeb') {
            await axios.post(config.KOYEB_API, { status: 'up', port: PORT });
            console.log('Koyeb API pinged.');
        } else if (platform === 'render') {
            await axios.post(config.RENDER_API, { status: 'up', port: PORT });
            console.log('_Render pinged_');
        } else if (platform === 'pterodactyl') {
            console.log('_on Pterodactyl_');
        } else {}
    } catch (err) {
        console.error(`${platform}`, err.message);
    }
}

function reUptime_Bot() {
    const id = `http://localhost:${PORT}`;
    axios.post(UPTIME_API, { url: id })
        .then(() => console.log('Registered with uptime bot'))
        .catch((err) => console.error('Uptime Error:', err.message));
}

async function startServer() {
    const server = http.createServer((req, res) => {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
        res.setHeader('Content-Type', 'application/json');

        if (req.method === 'GET' && req.url === '/') {
            res.end(JSON.stringify({ status: 'success', message: 'Garfield is running', timestamp: new Date().toISOString() }));
        } else if (req.method === 'GET' && req.url === '/health') {
            res.end(JSON.stringify({ status: 'healthy', uptime: process.uptime(), timestamp: new Date().toISOString() }));
        } else if (req.method === 'GET' && req.url === '/bot/status') {
            res.end(JSON.stringify({ status: 'active', message: 'connected and running', timestamp: new Date().toISOString() }));
        } else {
            res.statusCode = 404;
            res.end(JSON.stringify({ error: 'Not Found', message: 'The requested resource was not found' }));
        }
    });

    server.listen(PORT, async () => {
        console.log(`HTTP Server: ${PORT}`);
        reUptime_Bot();

        const platform = await detectHostingPlatform();
        console.log(`Hosting platform: ${platform}`);
        await pingPlatformAPI(platform);
    });

    return server;
}

module.exports = { startServer };
