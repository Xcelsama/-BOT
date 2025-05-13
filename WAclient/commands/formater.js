const { Command } = require('../../lib/');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

async function upscale(filePath) {
    const buffer = fs.readFileSync(filePath);
    const ext = path.extname(filePath).slice(1) || 'bin';
    const mime = ext === 'png' ? 'image/png' : ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' : 'application/octet-stream';
    const fn = Math.random().toString(36).slice(2, 8) + '.' + ext;
    const { data } = await axios.post("https://pxpic.com/getSignedUrl", {
        folder: "uploads",
        fileName
    }, {
        headers: {
            "Content-Type": "application/json"
        }
    });

    await axios.put(data.presignedUrl, buffer, {
        headers: {
            "Content-Type": mime
        }
    });
    const url = "https://files.fotoenhancer.com/uploads/" + fn;
    const api = await (await axios.post("https://pxpic.com/callAiFunction", new URLSearchParams({
        imageUrl: url,
        targetFormat: 'png',
        needCompress: 'no',
        imageQuality: '100',
        compressLevel: '6',
        fileOriginalExtension: 'png',
        aiFunction: 'upscale',
        upscalingLevel: ''
    }).toString(), {
        headers: {
        'User-Agent': 'Mozilla/5.0 (Android 10; Mobile; rv:131.0) Gecko/131.0 Firefox/131.0',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/png,image/svg+xml,*/*;q=0.8',
        'Content-Type': 'application/x-www-form-urlencoded',
        'accept-language': 'id-ID'
        }
    }).catch(e => e.response)).data;
    const buffersize = await (await axios.get(api.resultImageUrl, {
    responseType: 'arraybuffer'
    }).catch(e => e.response)).data;
    return {
        status: 200,
        success: true,
        result: {
        size: formatSize(buffer.length),
        imageUrl: api.resultImageUrl
        }
    };
}

function formatSize(size) {
    function round(value, precision) {
        var multiplier = Math.pow(10, precision || 0);
        return Math.round(value * multiplier) / multiplier;
    }
    var kiloByte = 1024;
    var megaByte = kiloByte * kiloByte;
    var gigaByte = kiloByte * megaByte;
    var teraByte = kiloByte * gigaByte;
    if (size < kiloByte) {
        return size + "B";
    } else if (size < megaByte) {
        return round(size / kiloByte, 1) + "KB";
    } else if (size < gigaByte) {
        return round(size / megaByte, 1) + "MB";
    } else if (size < teraByte) {
        return round(size / gigaByte, 1) + "GB";
    } else {
        return round(size / teraByte, 1) + "TB";
    }
}

Command({
    cmd_name: 'upscale',
    aliases: ['hd'],
    category: 'tools',
    desc: 'Upscale an image using AI'
})(async (msg) => {
    if (!msg.quoted || !msg.quoted.message || !msg.quoted.message.imageMessage) {
    return msg.reply('_Reply to an image_');
    }   const buffer = await msg.quoted.download();
    const tm = path.join(__dirname, `../remove/${Math.random().toString(36).slice(2)}.png`);
    fs.writeFileSync(tm, buffer);
    const result = await upscale(tm);
    fs.unlinkSync(tm);
    if (result.success) {
    await msg.send({image: { url: result.result.imageUrl }, caption: `*4KHD*\n*Size:* ${result.result.size}`
    });
 } 
});
