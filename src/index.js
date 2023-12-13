import { isIP } from 'net';
import is_ip_private from 'private-ip';
import { isLoopbackAddr } from 'is-loopback-addr';

function isIPSafe(ip) {
  if (is_ip_private(ip)) {
    return false;
  }

  if (isLoopbackAddr(ip)) {
    return false;
  }

  return true;
}

function trimBrackets(hostname) {
  if (hostname.startsWith('[') && hostname.endsWith(']')) {
    return hostname.substring(1, hostname.length -1);
  }

  return hostname;
}

function isLocalhost(hostname) {
  return [
    '::',
    '::1',
    'localhost',
  ].includes(hostname);
}

export function isSSRFSafeURL(input, config) {
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
    /**
      when try to create a URL from the arg we take advantage of runtime 
      native checkings. the normalize NFKD will clear the charset, which 
      will allow us to deal with exotic-chars as http://ⓔⓧⓐⓜⓟⓛⓔ.ⓒⓞⓜ
      which results in http://example.com.
    */
    const { hostname, username, protocol } = new URL(input.normalize('NFKD'));

    if (!hostname) {
      return false;
    }

    if (username && !options.allowUsername) {
      return false;
    }

    if (isIP(trimBrackets(hostname)) && (options.noIP || !isIPSafe(trimBrackets(hostname)))) {
      return false;
    }
    
    if (['.', '..'].includes(hostname)) {
      return false;
    }

    if (isLocalhost(hostname)) {
      return false;
    }
    
    if (options.allowedProtocols && !options.allowedProtocols.includes(protocol.replace(':', ''))) {
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
