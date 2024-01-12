#!/usr/bin/env node

const { isSSRFSafeURL } = require('../src/index.js');
const { version } = require('../package.json');

(function() {
  const args = process.argv.slice(2);
  const url = args.filter(item => !item.startsWith('--'))[0];
  const autoProtocol = args.find(item => item.startsWith('--auto-prepend-protocol='))?.split('=')[1];

  if (!args || !args.length) {
    return false;
  }

  if (args[0] === 'version') {
    return console.log(version);
  }

  const config = {
    noIP: args.includes('--no-ip'),
    quiet: args.includes('--quiet'),
    allowUsername: args.includes('--allow-username'),
    allowUnsafeChars: args.includes('--allow-unsafe-chars'),
    allowedProtocols: args.find(item => item.startsWith('--allowed-protocols='))?.split('=')[1].split(',') || ['http', 'https'],
    autoPrependProtocol:  autoProtocol ? (autoProtocol === 'false' ? false : autoProtocol) : 'https', 
  };

  const isSafe = isSSRFSafeURL(url, config);
  console.log(isSafe ? 'Safe' : 'Danger!');
  return isSafe;
})();
