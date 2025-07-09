const fs = require('fs').promises;
const path = require('path');

const commands = [];

function Module(data) {
    return (execFunction) => {
        commands.push({ ...data, exec: execFunction });
    };
}

async function loadPlugins(dir = path.join(__dirname, '..', 'plugins')) {
    const files = await fs.readdir(dir);
    files.forEach(file => {
        if (file.endsWith('.js')) require(path.join(dir, file));
    });
    return commands;
}

module.exports = { Module, loadPlugins };
