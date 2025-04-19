const fs = require('fs');
var path = require('path');
const axios = require('axios');

async function MakeSession(session, fm) {
    try {
        var tk = "";
        const x = session.split("~")[1];
        const ctx = `https://hastebin.com/raw/${x}`;
        const con = { method: 'get', url: ctx, headers: { 'Authorization': `Bearer ${tk}`
            }
        };

        var res = await axios(con); 
        if (!res.data || !res.data.content) { throw new Error("oops"); }   
        if (!fs.existsSync(fd)) {
        fs.mkdirSync(fd, { recursive: true }); }
        const n = path.join(fd, "creds.json");        
        const ss = typeof res.data.content === "string"
         ? res.data.content : JSON.stringify(res.data.content);
        fs.writeFileSync(n,ss);
        console.log("connected");
    } catch (error) {
        console.error(error.message);
    }
}

module.exports = { MakeSession };
