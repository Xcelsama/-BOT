const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');

const commands = [];

async function loadCommands() {
    if (commands.length > 0) return commands;
    const commandsDir = path.join(__dirname, '../../plugins');
    if (!await fs.pathExists(commandsDir)) {
        await fs.ensureDir(commandsDir);
        console.log(chalk.yellow('Created plugins'));
        return commands;
    }
    
    const files = await fs.readdir(commandsDir);
    const jsFiles = files.filter(file => file.endsWith('.js'));
    for (const file of jsFiles) {
        try { const filePath = path.join(commandsDir, file);
            delete require.cache[require.resolve(filePath)];
            require(filePath);
            console.log(chalk.green(`✓ Loaded: ${file}`));
        } catch (error) {
            console.error(chalk.red(`✗ Failed: ${file}:`), error.message);
        }
    }
    
    console.log(chalk.blue(`loaded: ${commands.length}`));
    return commands;
}

function addCommand(cmdData, handler) {
    commands.push({
        command: cmdData.command,
        package: cmdData.package,
        description: cmdData.description,
        aliases: cmdData.aliases || [],
        handler
    });
}

function getCommands() {
    return commands.sort((a, b) => {
      if (a.package !== b.package) {
        return a.package.localeCompare(b.package);
        }
        return a.command.localeCompare(b.command);
    });
}

module.exports = { loadCommands, addCommand, getCommands };
