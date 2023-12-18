const { isIP } = require('net');
const { normalizeStr } = require('./normalize-str');
const { isPrivateIP } = require('./is-private-ip');
const { trimBrackets } = require('./trim-brackets');
const { isLoopbackAddr } = require('./is-loopback-addr');

function isSSRFSafeURL(input, config) {
  if (typeof input !== 'string') {
    return false;
  }

  const options = Object.assign({
    quiet: true,
    noIP: false,
    allowUsername: false,
    allowedProtocols: [ 'http', 'https' ],
  }, config);

  try {
    const { hostname, username, protocol } = new URL(normalizeStr(input));
    const ip = (address => ({ address, version: isIP(address) }))(trimBrackets(hostname));

    if (!hostname) {
      return false;
    }

    if (username && !options.allowUsername) {
      return false;
    }

    if (['.', '..'].includes(hostname)) {
      return false;
    }

    if (['localhost', '::'].includes(hostname)) {
      return false;
    }

    if (options.allowedProtocols && !options.allowedProtocols.includes(protocol.replace(':', ''))) {
      return false;
    }

    if (ip.version && (options.noIP || isLoopbackAddr(ip.address) || isPrivateIP(ip.address, ip.version))) {
      return false;
    }

    return true;
  } catch(error) {
    if (!options.quiet) {
      throw error;
    }
    
    return false;
  }
};

module.exports = {
  isSSRFSafeURL
}
