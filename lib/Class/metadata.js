const axios = require('axios');
const ID3 = require('node-id3');

module.exports = async (a, t, n = 'Garfield', id = '') => {
  const d = await axios.get(a, { responseType: 'arraybuffer' });
  const ab = Buffer.from(d.data);
  const img = `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
  const i = await axios.get(img, { responseType: 'arraybuffer' });
  const tag = {
    title: t,
    artist: n,
    album: 'Audio',
    APIC: {
      mime: 'image/jpeg',
      type: { id: 3, name: 'front cover' },
      description: 'thumb',
      imageBuffer: Buffer.from(i.data)
    }
  };

  return {
    buffer: ID3.write(tag, ab),
    thumbUrl: img
  };
};
