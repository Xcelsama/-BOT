const axios = require('axios');
const ID3 = require('node-id3');

class MetadataEditor {
  constructor(artist = 'naxordeve', album = 'garfield.com') {
    this.artist = artist;
    this.album = album;
  }

  async toBuffer(stream) {
    const chunks = [];
    for await (const chunk of stream) chunks.push(chunk);
    return Buffer.concat(chunks);
  }

  async write(audioUrl, coverUrl, { title }) {
    const [audio, cover] = await Promise.all([
      axios({ url: audioUrl, responseType: 'stream' }).then(res => this.toBuffer(res.data)),
      axios({ url: coverUrl, responseType: 'arraybuffer' }).then(res => res.data),
    ]);

    const tags = {
      title,
      artist: this.artist,
      album: this.album,
      APIC: {
        mime: 'image/jpeg',
        type: 3,
        description: 'Cover',
        imageBuffer: cover
      },
    };

    return ID3.write(tags, audio);
  }
}

module.exports = MetadataEditor;
