const { Module } = require('../lib/plugins');
const axios = require('axios');

Module({
  command: 'git',
  package: 'downloader',
  description: 'Download GitHub repo zip',
})(async (message, match) => {
  const regex = /(?:https?:\/\/|git@)github\.com[\/:]([^\/\s]+)\/([^\/\s]+)(?:\.git)?/;
  const ctx = regex.exec(match);
  if (!ctx) return message.send('_Please provide a valid GitHub repo url_');

  const [_, username, repoRaw] = match;
  const repo = repoRaw.replace(/\.git$/, '');

  const api = `https://api.github.com/repos/${username}/${repo}`;
  const res = await axios.get(api).catch(() => null);
  if (!res || res.status !== 200) return message.send('_not found_');

  const branch = res.data.default_branch || 'main';
  const zip_url = `https://github.com/${username}/${repo}/archive/refs/heads/${branch}.zip`;
  await message.send({document: { url: zip_url }, mimetype: 'application/zip', fileName: `${repo}-${branch}.zip`
  });
});
