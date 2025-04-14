const fs = require('fs');
const path = require('path');

function plugins() {
    const com = path.join(__dirname, 'commands');
    const co = fs.readdirSync(com).filter(file => file.endsWith('.js'));
    
    console.log('\n=== Loading Commands ===');
    for (const file of co) {
        const ctxx = path.join(com, file);
        if (fs.statSync(ctxx).isDirectory()) {
            const ctx = fs.readdirSync(ctxx).filter(f => f.endsWith('.js'));
            console.log(`${file}`);
            for (const ctxx of ctx) {
                require(path.join(ctxx, ctx));
                console.log(`├─ ${ctx}`);
            }
        } else {
            require(path.join(com, file));
            console.log(`${file}`);
        }
    }
    console.log('\nCommands loaded successfully ✅');
}

module.exports = { plugins };
