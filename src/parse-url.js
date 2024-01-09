const { isIP } = require('net');

function trimBrackets(hostname) {
  if (hostname.startsWith('[') && hostname.endsWith(']')) {
    return hostname.substring(1, hostname.length -1);
  }
  
  return hostname;
}

/**
  when try to create a URL from the arg we take advantage of runtime 
  native checkings. the normalize NFKD will clear the charset, which 
  will allow us to deal with exotic-chars as http://ⓔⓧⓐⓜⓟⓛⓔ.ⓒⓞⓜ
  which results in http://example.com.
*/
function normalizeURLStr(str) {
  if (typeof str !== 'string') {
    return '';
  };

  return str
    .trim() // removed start and end spaces
    .normalize('NFKD'); // removed accents and diacrictics, normalize fancy chars
}

function startsWithProtocol(input) {
  const match = (input || '')
    .trim()
    .toLowerCase()
    .match(/(?:[a-z,0-9]+?):\/\//);

  return !!(match && match.index === 0);
}

function urlHasUnsafeChars(input) {
  // https://stackoverflow.com/questions/1547899/which-characters-make-a-url-invalid/1547940#1547940
  return /\"|<|>|\\|\^|`|{|\||\}/.test(input || '');
}

function parseURL(input, autoPrependProtocol) {
  const RESULT_INVALID_URL = { validSchema: false };

  try {
    const url = new URL(normalizeURLStr(input));
    const ipcheck = trimBrackets(url.hostname);
    const ipVersion = isIP(ipcheck);
    const hostIsIp = !!ipVersion;
    const hasUnsafeChars = urlHasUnsafeChars(input);

    return Object.assign(url, {
      ip: hostIsIp ? ipcheck : null,
      validSchema: true,
      hasUnsafeChars,
      ipVersion,
      hostIsIp,
    });
  } catch {
    if (!startsWithProtocol(input) && autoPrependProtocol) {
      return parseURL(`${autoPrependProtocol}://${input}`, false);
    }

    return RESULT_INVALID_URL;
  }
}

module.exports = {
  parseURL
}
