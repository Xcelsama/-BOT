const { addCommand } = require('./commands');

function Module(cmd_x) {
    return function(handler) {
        addCommand(cmd_x, handler);
    };
}

module.exports = { Module };
