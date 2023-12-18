#!/usr/bin/env node

const { isSSRFSafeURL } = require('../src/index.js');

(function() {
  const args = process.argv.slice(2);
  const url = args[0];

  const config = {
    noIP: args.includes('--no-ip'),
    quiet: args.includes('--quiet'),
    allowUsername: args.includes('--allow-username'),
    allowedProtocols: args.find(item => item.startsWith('--protocols='))?.split('=')[1].split(',') || ['http', 'https']
  };

  const isSafe = isSSRFSafeURL(url, config);
  console.log(isSafe ? 'Safe' : 'Danger!');
  return isSafe;
})();
