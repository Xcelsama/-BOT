const sharp = require('sharp');
const  fileTypeFromBuffer  = require('file-type');
const fs = require('fs');

async function makeSticker(buffer, stickerMetadata) {
    try {
        const { mime } = await fileTypeFromBuffer(buffer);
        const tempPath = `./temp/${Date.now()}`;
        const outputPath = `${tempPath}.webp`;
        if (mime.startsWith('image/gif')) {
            const ffmpeg = require('fluent-ffmpeg');
            fs.writeFileSync(tempPath, buffer);
            return new Promise((resolve, reject) => {
                ffmpeg(tempPath)
                    .outputOptions(["-vf", "scale=512:512:force_original_aspect_ratio=decrease,format=rgba,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=#00000000,setsar=1"])
                    .toFormat('webp')
                    .on('end', () => {
                        fs.unlinkSync(tempPath);
                        resolve(outputPath);
                    })
                    .on('error', (err) => {
                        fs.unlinkSync(tempPath);
                        reject(err);
                    })
                    .save(outputPath);
            });
        } else {
            await sharp(buffer)
                .resize(512, 512, {
                    fit: 'contain',
                    background: { r: 0, g: 0, b: 0, alpha: 0 }
                })
                .webp()
                .toFile(outputPath);
            return outputPath;
        }
    } catch (error) {
        throw error;
    }
}

module.exports = {makeSticker};
