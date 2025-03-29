const v = new Map();

async function _ID_NUM(sender, options) {
    const CreatePlug = {
        callback: options.callback,
        Call: options.Call,
        valid: options.valid || []
    };
    
    v.set(sender, CreatePlug);
}

async function get_flag(msg) {
    if (!v.has(msg.sender)) return false;
    const CreatePlug = v.get(msg.sender);
    const number = parseInt(msg.body);
    if (isNaN(number)) return false;
    if (CreatePlug.valid.length && !CreatePlug.valid.includes(number)) return false;
    CreatePlug.callback(number, msg);
    return true;
}

module.exports = { _ID_NUM, get_flag };
