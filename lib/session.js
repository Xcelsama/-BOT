const fs = require('fs');
var path = require('path');
const axios = require('axios');

async function SessionCode(session, fd) {
    try {
        if (!session || !session.startsWith("xastral")) 
        throw new Error("Invalid SESSION_ID format");
        var tk = "70f80eb3dc8101d1f44be24b28aef7f5fc4d5c9781e4f4866405b9895044773c5b365ea985d28b325ac9403789999ed12a99c4666b9ff21d13122949d1f6fc15";
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
        console.log("connected");
    } catch (error) {
        console.error(error.message);
    }
}

module.exports = { SessionCode };
            
