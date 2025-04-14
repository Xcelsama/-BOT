
const fs = require('fs');
const path = require('path');

function plugins() {
    const com = path.join(__dirname, 'commands');
    const co = fs.readdirSync(com).filter(file => file.endsWith('.js'));
    
    console.log('\n=== Loading Commands ===');
    for (const file of co) {
        const subPath = path.join(com, file);
        if (fs.statSync(subPath).isDirectory()) {
            const subFiles = fs.readdirSync(subPath).filter(f => f.endsWith('.js'));
            console.log(`📁 ${file}`);
            for (const subFile of subFiles) {
                require(path.join(subPath, subFile));
                console.log(`  ├─ ${subFile}`);
            }
        } else {
            require(path.join(com, file));
            console.log(`📄 ${file}`);
        }
    }
    console.log('\nCommands loaded successfully ✅');
}

module.exports = { plugins };
