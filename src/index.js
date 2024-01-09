const { parseURL } = require('./parse-url');
const { isPrivateIP } = require('./is-private-ip');
const { isLoopbackAddr } = require('./is-loopback-addr');

function isSSRFSafeURL(input, config) {
  if (typeof input !== 'string') {
    return false;
  }

  const options = Object.assign({
    quiet: true,
    noIP: false,
    allowUsername: false,
    allowUnsafeChars: false,
    autoPrependProtocol: 'https',
    allowedProtocols: [ 'http', 'https' ],
  }, config);

  try {
    const {
      ip,
      hostIsIp,
      ipVersion,
      hostname,
      username,
      protocol,
      validSchema,
      hasUnsafeChars,
    } = parseURL(input, options.autoPrependProtocol);

    if (!validSchema || !hostname) {
      return false;
    }

    if (!options.allowUnsafeChars && hasUnsafeChars) {
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

    if (hostIsIp && (options.noIP || isLoopbackAddr(ip) || isPrivateIP(ip, ipVersion))) {
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
