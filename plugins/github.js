const { Module } = require('../lib/plugins');
const axios = require('axios');

Module({
  command: 'git',
  package: 'downloader',
  description: 'Download GitHub repo zip',
})(async (message, match) => {
    const ctx = /(?:https?:\/\/|git@)github\.com[\/:]([^\/\s]+)\/([^\/\s]+)(?:\.git)?/;
    const eg = ctx.exec(match);
    if (!eg) return message.send('_Provide git repo_');
    const [_, username, repo] = eg;
    const zip_url = `https://api.github.com/repos/${username}/${repo.replace(/\.git$/, "")}`;
    const res = await axios.get(zip_url).catch(() => null);
    if (!res || res.status !== 200) return;
    const { name, stargazers_count, forks_count } = res.data;
    await message.send({document: { url: `${zip_url}/zipball` }, fileName: `${repo}.zip`, mimetype: "application/zip"});
}); 
