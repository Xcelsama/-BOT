var {Command} = require('../../lib/');
const { search, download } = require('aptoide-api');

Command({
  cmd_name: 'apk',
  aliases: ['aptoide'],
  category: 'downloader',
  desc: 'Search and download apps'
})(async (msg) => {
  const query = msg.text.trim();
  if (!isNaN(query) && query !== '') {
    const sel = parseInt(query) - 1;
    const u = global.apkSearchResults?.[msg.sender];
    if (!u || !u[sel]) {
    return msg.reply('Invalid selection. Please search for apps first using .apk cmd');
    }try {
      const app = u[sel];
      await msg.reply(`*Downloading ${app.name}...*\n_This may take a few minutes depending on file size_`);
      const ap = await download(app.downloadUrl);
      if (!ap) return;
      await msg.send({document: ap, fileName: `${app.name.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.apk`, mimetype: 'application/vnd.android.package-archive', caption: `*${app.name}*\n\n* Package:* ${app.package}\n* Size:* ${app.size}\n* Version:* ${app.version}` });
      delete global.apkSearchResults[msg.sender];
    } catch (error) {
      console.error(error);
      }
    return;
  } if (!query) return msg.reply('_Please provide an app name to search_\n\nExample: .apk minecraft');
  try { const apps = await search(query, 10);
   if (!apps || apps.length === 0) return;
    let txt = `*Search Results for "${query}":*\n\n`;
    apps.forEach((app, index) => {
      txt += `*${index + 1}.* ${app.name}\n`;
      txt += ` Package: ${app.package}\n`;
      txt += ` Size: ${app.size}\n`;
      txt += ` Version: ${app.version}\n`;
      txt += ` Rating: ${app.rating}/5\n`;
      txt += ` Downloads: ${app.downloads.toLocaleString()}\n\n`;
    });

    txt += `*Reply with the number (1-${apps.length}) to download*`;
    await msg.reply(txt);
    global.apkSearchResults = global.apkSearchResults || {};
    global.apkSearchResults[msg.sender] = apps;

  } catch (error) {
    console.error(error);
    await msg.reply('_soery_');
  }
});
