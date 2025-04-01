const axios = require('axios');
const ID3 = require('node-id3');

async function toBuffer(stream) {
  let chunks = [];
  for await (let chunk of stream) chunks.push(chunk);
  return Buffer.concat(chunks);
}

async function AddMetadata(audio_url, img_url, { title, artist = 'Diegoson', album = 'X Astral' }) {
  const [audio, cover] = await Promise.all([
    axios({ url: audio_url, responseType: 'stream' }).then(res => toBuffer(res.data)),
    axios({ url: img_url, responseType: 'arraybuffer' }).then(res => res.data),
  ]);

  const tags = {
    title,
    artist,
    album,
    APIC: { mime: 'image/jpeg', type: 3, description: 'Cover', imageBuffer: cover },
  };

  return ID3.write(tags, audio); 
}

module.exports =  { AddMetadata };
