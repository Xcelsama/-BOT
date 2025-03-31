const commands = new Map();

function Command(options) {
    return function(callback) {
        const cm = {
            cmd_name: options.cmd_name || '',
            aliases: options.aliases || [],
            category: options.category || 'misc',
            desc: options.desc || 'naxor',
            callback
        };

        commands.set(cm.cmd_name, cm);
        if (cm.aliases.length > 0) {
            cm.aliases.forEach(alias => {
                commands.set(alias, cm);
            });
        }
        return cm;
    };
}

function getCommand(name) { return commands.get(name); }
function getAllCommands() { 
    const ui = new Map();
    for (const cmd of commands.values()) {
        if (!ui.has(cmd.cmd_name)) {
            ui.set(cmd.cmd_name, cmd);
        }
    }
    return Array.from(ui.values());
}

module.exports = { Command, getCommand, getAllCommands };
