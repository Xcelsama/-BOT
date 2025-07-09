const fs = require('fs');
const path = require('path'); 
const config = require('../config.js');

let db = null;
function load() {
  const name = process.env.THEME || config.THEME;
  const file = path.join(__dirname, `${name}.json`);
  if (!fs.existsSync(file)) throw new Error(`not found: ${file}`);
  db = JSON.parse(fs.readFileSync(file, 'utf-8'));
  return db;
}
function getTheme() {
  if (!db) load();
  return db;
}
module.exports = { loadTheme: load, getTheme };
