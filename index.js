const fs = require('fs');
const config = require('./config');
const {startBot,connectMongoDB,SessionCode} = require('./lib/index');

const Client = async () => {
    if (!fs.existsSync("./lib/multi_auth/creds.json")) 
    await SessionCode(config.SESSION_ID || process.env.SESSION_ID, "./lib/multi_auth");
    await connectMongoDB();
    await startBot();
}

Client();
