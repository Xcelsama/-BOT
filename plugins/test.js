var {Module} = require('../lib/plugins');

Module({
    on: "text"
}) (async (message) => {
        if (message.body.toLowerCase() === "hey") {
            await message.send("_Hey there_");
        }
    });
