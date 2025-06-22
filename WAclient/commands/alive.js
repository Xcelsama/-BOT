var { Command} = require('../../lib/');
var { monospace } = require('../../lib/Functions'); 
var os = require('os');
var config = require('../../config');

Command({
    cmd_name: 'alive',
    category: 'core',
    desc: 'Check if bot is running',
})(async(msg) => {
        const uptime = process.uptime();
        const days = Math.floor(uptime / 86400);
        const hours = Math.floor((uptime % 86400) / 3600);
        const minutes = Math.floor((uptime % 3600) / 60);
        const seconds = Math.floor(uptime % 60);
        
        const totalMem = (os.totalmem() / 1024 / 1024 / 1024).toFixed(1);
        const freeMem = (os.freemem() / 1024 / 1024 / 1024).toFixed(1);
        const usedMem = (totalMem - freeMem).toFixed(1);
        const cpuCount = os.cpus().length;
        const cpuModel = os.cpus()[0].model.split(' ')[0];
        const startTime = new Date(Date.now() - uptime * 1000);
        
        var c = `
┌─【*BOT STATUS*
│ *Started:* ${startTime.toLocaleString()}
│ *Uptime:* ${days}d ${hours}h ${minutes}m ${seconds}s
└─

┌─【*SYSTEM INFO*
│ *Platform:* ${process.platform.toUpperCase()}
│ *Node.js:* ${process.version}
│ *CPU:* ${cpuModel} (${cpuCount} cores)
│ *RAM:* ${usedMem}GB/${totalMem}GB used
│ *Memory Usage:* ${((usedMem/totalMem)*100).toFixed(1)}%
└─

┌─【*PERFORMANCE*
│ *CPU Load:* ${(os.loadavg()[0]).toFixed(2)}%
│ *Free Memory:* ${freeMem}GB
│ *Home Dir:* ${os.homedir().split('/').pop()}
│ *Hostname:* ${os.hostname()}
└─

┌─【*CONFIG*
│ *Prefix:* ${config.PREFIX}
│ *Language:* ${config.LANG || 'EN'}
│ *WorkType:* ${config.WORKTYPE || 'Public'}
│ *Owner:* ${config.OWNER_NUM ? 'Configured' : 'Not Set'}
└─`;

        await msg.reply(c);
        
});
    
