const fs = require('fs-extra');
const path = require('path');

function loadTheme() {
    const x = process.env.BOT_THEME || 'garfield';
    const nepu = path.join(__dirname, '../Themes', `${x.toLowerCase()}.json`); 
    if (fs.existsSync(nepu)) {
        return JSON.parse(fs.readFileSync(nepu, 'utf8'));
    } else {
        console.warn(`Theme ${x} not found`);
        return JSON.parse(fs.readFileSync(path.join(__dirname, '../Themes', 'garfield.json'), 'utf8'));
    }
}

module.exports = { loadTheme };
