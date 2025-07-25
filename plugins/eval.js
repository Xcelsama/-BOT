const { mods } = require('../config');
const {Module} = require('../lib/plugins');
const util = require('util');

Module({
  on: 'text'
})(async (message) => {
  if (!message.body.startsWith('>')) return;
  if (!(message.fromMe || mods.includes(message.sender))) return;
  let code = message.body.slice(1).trim();
  try {
    let result = await eval(`(async () => { ${code} })()`);
    if (typeof result !== 'string') result = require('util').inspect(result);
    await message.send(result );
  } catch (e) {
    await message.send(e.message);
  }
});
