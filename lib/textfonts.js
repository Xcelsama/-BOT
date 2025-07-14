class TextStyles {
  constructor() {
    this.smallCapsMap = {
      a: 'ᴀ',
      b: 'ʙ',
      c: 'ᴄ',
      d: 'ᴅ',
      e: 'ᴇ',
      f: 'ғ',
      g: 'ɢ',
      h: 'ʜ',
      i: 'ɪ',
      j: 'ᴊ',
      k: 'ᴋ',
      l: 'ʟ',
      m: 'ᴍ',
      n: 'ɴ',
      o: 'ᴏ',
      p: 'ᴘ',
      q: 'ǫ',
      r: 'ʀ',
      s: 'ꜱ',
      t: 'ᴛ',
      u: 'ᴜ',
      v: 'ᴠ',
      w: 'ᴡ',
      x: 'x',
      y: 'ʏ',
      z: 'ᴢ',
    };

    this.monospaceMap = {
      A: '𝙰',
      B: '𝙱',
      C: '𝙲',
      D: '𝙳',
      E: '𝙴',
      F: '𝙵',
      G: '𝙶',
      H: '𝙷',
      I: '𝙸',
      J: '𝙹',
      K: '𝙺',
      L: '𝙻',
      M: '𝙼',
      N: '𝙽',
      O: '𝙾',
      P: '𝙿',
      Q: '𝚀',
      R: '𝚁',
      S: '𝚂',
      T: '𝚃',
      U: '𝚄',
      V: '𝚅',
      W: '𝚆',
      X: '𝚇',
      Y: '𝚈',
      Z: '𝚉',
      a: '𝚊',
      b: '𝚋',
      c: '𝚌',
      d: '𝚍',
      e: '𝚎',
      f: '𝚏',
      g: '𝚐',
      h: '𝚑',
      i: '𝚒',
      j: '𝚓',
      k: '𝚔',
      l: '𝚕',
      m: '𝚖',
      n: '𝚗',
      o: '𝚘',
      p: '𝚙',
      q: '𝚚',
      r: '𝚛',
      s: '𝚜',
      t: '𝚝',
      u: '𝚞',
      v: '𝚟',
      w: '𝚠',
      x: '𝚡',
      y: '𝚢',
      z: '𝚣',
    };

    this.aestheticMap = {
      a: 'α', b: 'в', c: 'ç', d: '∂', e: 'є', f: 'ƒ', g: 'g', h: 'н',
      i: 'ι', j: 'נ', k: 'к', l: 'ℓ', m: 'м', n: 'η', o: 'σ', p: 'ρ',
      q: 'q', r: 'я', s: 'ѕ', t: 'т', u: 'υ', v: 'ν', w: 'ω', x: 'χ',
      y: 'у', z: 'z',
      A: 'A', B: 'B', C: 'C', D: 'D', E: 'Є', F: 'F', G: 'G', H: 'H',
      I: 'I', J: 'J', K: 'K', L: 'L', M: 'M', N: 'И', O: 'Θ', P: 'P',
      Q: 'Q', R: 'R', S: 'S', T: 'T', U: 'Ц', V: 'V', W: 'Ш', X: 'X',
      Y: 'Y', Z: 'Z',
      "'": "'", ",": ",", ".": ".", " ": " "
    };
  }

  toSmallCaps(text) {
    if (typeof text !== 'string') return '';
    return text
      .split('')
      .map(char => {
        const lower = char.toLowerCase();
        return this.smallCapsMap[lower] || char;
      })
      .join('');
  }

  toMonospace(text) {
    if (typeof text !== 'string') return '';
    return text
      .split('')
      .map(char => this.monospaceMap[char] || char)
      .join('');
  }

  toAesthetic(text) {
    if (typeof text !== 'string') return '';
    return text
      .split('')
      .map(char => this.aestheticMap[char] || char)
      .join('');
  }
}

module.exports = TextStyles;
