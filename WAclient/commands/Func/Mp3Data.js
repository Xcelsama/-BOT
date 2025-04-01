const axios = require('axios');
const ID3 = require('node-id3');

async function streamer(stream) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    stream.on('data', (chunk) => chunks.push(chunk));
    stream.on('end', () => resolve(Buffer.concat(chunks)));
    stream.on('error', reject);
  });
}

async function AddMp3Metadata(audioUrl, thumbnailUrl, { title, artist = 'Diegoson', album = 'X Astal' }) {
  const [audioStream, thumbnailBuffer] = await Promise.all([
  axios({ url: audioUrl, method: 'GET', responseType: 'stream' }).then(res => streamer(res.data)), 
  axios({ url: thumbnailUrl, method: 'GET', responseType: 'arraybuffer' }).then(res => res.data),
  ]);

  const metadata = {
    title,
    artist,
    album,
    APIC: {
      mime: 'image/jpeg',
      type: 3,
      description: 'Cover',
      imageBuffer: thumbnailBuffer,
    },
  };

  const meme = ID3.write(metadata, audioStream); 
  return meme;
}

module.exports = {AddMp3Metadata};
