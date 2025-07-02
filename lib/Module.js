const fs = require('fs-extra');
const path = require('path');

const commands = new Map();
const { addCommand } = require('./commands');
const Module = (options) => {
    return (handler) => {
        const cmd = {
            command: options.command,
            package: options.package || 'general',
            description: options.description || 'No description',
            aliases: options.aliases || [],
            execute: handler
        };

        addCommand(cmd);
        return cmd;
    };
};

const loadCommands = async () => {
    const ctx = path.join(__dirname, '../plugins');
    if (!fs.existsSync(ctx)) {
        fs.mkdirSync(ctx, { recursive: true });
       await createDefaultCommands(ctx);
    }
    
    const files = fs.readdirSync(ctx).filter(file => file.endsWith('.js')); 
    for (const file of files) {
        try { delete require.cache[require.resolve(path.join(ctx, file))];
        require(path.join(ctx, file));
        } catch (error) {}
    }
    
    return commands;
};

module.exports = { 
  Module, 
  loadCommands,
  commands 
};
