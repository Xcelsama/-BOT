const { Command } = require('../../lib/command');
const { Sticker } = require('wa-sticker-formatter');
var config = require('../../config');



Command({
    cmd_name: 'take',
    category: 'tools',
    desc: 'Convert',
})(async (msg) => {
        if (!msg.quoted || !msg.quoted.message) return await msg.reply('_Reply to a sticker_');
        var match = msg.text;
        let pack = config.PACKNAME;
        let author = 'NᴀxᴏʀDᴇᴠɪ';
        if (match) { if (!match.includes('|')) return await msg.reply('_use the correct format: `packname|author`_');
        let [ux, us] = match.split('|').map((v) => v.trim());
        if (!ux || !us) return await msg.reply('_Both packname and author must be provided in the format: `packname|author`_');
        pack = ux;
        author = us; }
        const buffer = await msg.quoted.download();
        if (!buffer) return;
        const sticker = new Sticker(buffer, {
        pack,author,type: 'full',quality: 80,id: 'sticker_cmd',background: 'transparent'
        });
        const voidi = await sticker.toBuffer();
        await msg.send({ sticker: voidi });
});

    

Command({
    cmd_name: 'crop',
    category: 'converter',
    desc: 'Convert media to cropped sticker'
})(async (msg, conn) => {
    if (!msg.quoted) return msg.reply('_Reply to an sticker_');
    const media = await msg.quoted.download();
    const sticker = new Sticker(media, {
    pack: 'Created By', author: 'Xastral',
    type: 'crop',quality: 70,
    background: 'transparent'
    });
    await msg.send({ sticker: await sticker.toBuffer() });
});

Command({
    cmd_name: 'circle',
    category: 'converter',
    desc: 'Convert media to circular sticker'
})(async (msg, conn) => {
    if (!msg.quoted) return msg.reply('_Reply to an sticker_');
    const media = await msg.quoted.download();
    const sticker = new Sticker(media, {
    pack: `${config.PACKNAME}`, author: `${msg.pushName}`,
    type: 'circle', quality: 70,
    background: 'transparent'
    });
    await msg.send({ sticker: await sticker.toBuffer() });
});


async function removebg(buffer) {
    return new Promise(async (resolve, reject) => {
        const image = buffer.toString("base64");
        let res = await axios.post(
        "https://us-central1-ai-apps-prod.cloudfunctions.net/restorePhoto", {
        image: `data:image/png;base64,${image}`,
        model: "fb8af171cfa1616ddcf1242c093f9c46bcada5ad4cf6f2fbe8b81b330ec5c003",},);
        const data = res.data?.replace(`"`, "");
        if (!data) return reject("err");
        resolve(data);
    });
}

Command({
    cmd_name: 'removebg',
    category: 'tools',
    desc: 'Removes the background from an image',
})(async (msg) => {
        if (!msg.quoted || !msg.quoted.message.imageMessage) return await msg.reply('_Reply to an image_');
        const buffer = await msg.quoted.download();
        const voidi = await removebg(buffer).catch(err => null);
        if (!voidi || typeof voidi !== "string") return;
        const o = await axios.get(voidi, { responseType: 'arraybuffer' });
        const x = Buffer.from(o.data);
        await msg.send({ image: x, caption: '_Made with❤️_' });
    
});

async function Upscale(img) {
    const res = await fetch("https://lexica.qewertyy.dev/upscale", {
        body: JSON.stringify({
        image_data: Buffer.from(img, "base64"),
        format: "binary",
        }),
        headers: {"Content-Type": "application/json",},
        method: "POST",
    });
    if (!res.ok) return null;
    return Buffer.from(await res.arrayBuffer());
}

Command ({
    cmd_name: 'upscale',
    aliases: ['hd'],
    category: 'tools',
    desc: 'Upscales an image to higher resolution',
    })(async (msg) => {
    if (!msg.quoted || !msg.quoted.message.imageMessage) return await msg.reply('_Reply to an image_');
    const buffer = await msg.quoted.download();
    const ups = await Upscale(buffer).catch(() => null);
    if (!ups) return;
    await smg.send({ image: ups, caption: '_upscaled_' });
});
    
