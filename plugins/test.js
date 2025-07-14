var {Module} = require('../lib/plugins');

Module({
    on: "text"
}) (async (message) => {
        if (message.body.toLowerCase() === "hey") {
            await message.reply("_Hey there_");
        }
    });
