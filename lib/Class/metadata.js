const fs = require("fs");
const path = require("path");
const ID3Writer = require("browser-id3-writer");

async function Mp3Metadata(i, c, o = {}, out = "./output.mp3") {
   var {
      title = "garfield",
      artist = ["Vevo"],
      album = "naxor",
      year,
      genre,
      trackNumber,
   } = o;

   var a = await getBuffer(i);
   var b = await getBuffer(c);
   var w = new ID3Writer(a);
   w.setFrame("TIT2", title)
    .setFrame("TPE1", artist)
    .setFrame("TALB", album)
    .setFrame("APIC", { type: 3, data: b, description: "Song cover" });
   if (year) w.setFrame("TYER", year);
   if (genre) w.setFrame("TCON", Array.isArray(genre) ? genre : [genre]);
   if (trackNumber) w.setFrame("TRCK", `${trackNumber}`);
   w.addTag();
   var r = Buffer.from(w.arrayBuffer);
   var d = path.dirname(out);
   await fs.promises.mkdir(d, { recursive: true });
   await fs.promises.writeFile(out, r);
   return r;
}

module.exports = {
   Mp3Metadata
};
