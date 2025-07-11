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

Module({
  command: 'github',
  package: 'stalk',
  description: 'GitHub profile info'
})(async (message, match) => {
  const username = match?.trim();
  if (!username) return await message.send('_github <username>_');
  const res = await axios.get(`https://toxicdevilapi.vercel.app/stalk/github_user?username=${username}`);
  const data = res.data?.result;
  if (!data) return await message.send('_not found_');
  const avatar = (await axios.get(data.pp, { responseType: 'arraybuffer' })).data;
  const text =`Name: ${data.name}\n` +
    `User: ${data.username.github}\n` +
    `Bio: ${data.bio || '-'}\n` +
    `Location: ${data.location || '-'}\n` +
    `Repos: ${data.ropos_count} | Gists: ${data.gists_count}\n` +
    `Followers: ${data.followers_count} | Following: ${data.following_count}\n` +
    `Hireable: ${data.hireable ? 'Yes' : 'No'}\n` +
    `Created: ${data.created}\n` +
    `Updated: ${data.last_profile_updated}\n` +
    `Link: ${data.profileUrl}`;
  await message.send({ image: avatar, caption: text });
});
