const fs = require('fs-extra');
const path = require('path');

const commands = new Map();
const loadCommands = async () => {
    const co = path.join(__dirname, '../commands');    
    if (!fs.existsSync(co)) {
        return commands;
    }
    
    const files = fs.readdirSync(co).filter(file => file.endsWith('.js'));
    for (const file of files) {
        try { delete require.cache[require.resolve(path.join(co, file))];
        require(path.join(co, file));
        } catch (error) {}
    }
    
    return commands;
};

const addCommand = (cmd) => {
    commands.set(cmd.command, cmd);
    if (cmd.aliases) {
        cmd.aliases.forEach(alias => {
            commands.set(alias, cmd);
        });
    }
};

module.exports = { loadCommands, addCommand, commands };
          
