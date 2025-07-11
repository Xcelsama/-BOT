const fs = require('fs');
var path = require('path');
const axios = require('axios');
const config = require('../config');

async function SessionCode(session, fd) {
    try {
        if (!session || !session.startsWith("xastral")) 
        throw new Error("Invalid SESSION_ID format");
        var tk = config.HASTEBIN || process.env.HASTEBIN;
        const x = session.split("~")[1];
        const ctx = `https://hastebin.com/raw/${x}`;
        const con = {
            method: 'get',
            url: ctx,
            headers: { 'Authorization': `Bearer ${tk}` }
        };

        const res = await axios(con);
        if (!res.data || !res.data.content) throw new Error("Session data missing");
        if (!fs.existsSync(fd)) fs.mkdirSync(fd, { recursive: true });
        const n = path.join(fd, "creds.json");
        const ss = typeof res.data.content === "string"
            ? res.data.content
            : JSON.stringify(res.data.content);

        fs.writeFileSync(n, ss);
        console.log("✅ connected");
    } catch (error) {
        console.error(error.message);
    }
}

module.exports = { SessionCode };
            
