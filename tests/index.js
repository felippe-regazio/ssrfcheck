const path = require('path');
const { execSync } = require('child_process');
const { isSSRFSafeURL } = require('../src/index.js');
const shouldPassData = require('./data/should-pass.js');
const shouldNotPassData = require('./data/should-not-pass.js');
const validIPsListData = require('./data/valid-ips-list');
const BIN_CLI_PATH = path.resolve(__dirname, '..', 'src', 'cli.js');
const cliexec = (url, opts = '--quiet') => execSync(`${BIN_CLI_PATH} \"${url}\" ${opts}`).toString().trim();
const inform = (url, result) => console.log(`Checked: ${url} → ${result}`);

// =================================================================

const shouldNotPassErrors = shouldNotPassData.filter(url => {
  const result = isSSRFSafeURL(url);
  const cliResult = cliexec(url);
  const hasError = result || cliResult !== 'Danger!';

  if(hasError) {
    console.error('\n❌ URL Should not pass:');
    console.error(url);
    console.log(`Fn: ${result}, CLI: ${cliResult}\n`);
  } else {
    inform(url, result);
  }

  return hasError;
});

// =================================================================

const shouldPassErrors = [...shouldPassData, ...validIPsListData].filter(url => {
  const result = isSSRFSafeURL(url);
  const cliResult = cliexec(url);
  const hasError = !result || cliResult !== 'Safe'; 

  if(hasError) {
    console.error('\n❌ URL Should pass:');
    console.error(url);
    console.log(`Fn: ${result}, CLI: ${cliResult}\n`);
  } else {
    inform(url, result);
  }

  return hasError;
});

// =================================================================

const noIPErrors = validIPsListData.filter(url => {
  const result = isSSRFSafeURL(url, { noIP: true });
  const cliResult = cliexec(url, '--quiet --no-ip');
  const hasError = result || cliResult !== 'Danger!';

  if(hasError) {
    console.error('\n❌ URL Should not pass under noIP option:');
    console.error(url);
    console.log(`Fn: ${result}, CLI: ${cliResult}\n`);
  } else {
    inform(url, result);
  }

  return hasError;
});

// =================================================================

const noAutoPrependProtocolErrors = ['a.com', '192.168.0.1', 'example.com', 'www.google.com'].filter(url => {
  const result = isSSRFSafeURL(url, { autoPrependProtocol: false });
  const cliResult = cliexec(url, '--quiet --auto-prepend-protocol=false');
  const hasError = result || cliResult !== 'Danger!';

  if(hasError) {
    console.error('\n❌ URL Should not pass under autoPrependProtocol=false option:');
    console.error(url);
    console.log(`Fn: ${result}, CLI: ${cliResult}\n`);
  } else {
    inform(url, result);
  }

  return hasError;
});

// =================================================================

const allowUsernameErrors = ['https://user:pass@example.com'].filter(url => {
  const result = isSSRFSafeURL(url, { allowUsername: true });
  const cliResult = cliexec(url, '--quiet --allow-username');
  const hasError = !result || cliResult !== 'Safe'; 

  if(hasError) {
    console.error('\n❌ URL with username must pass when allowUsername=true:');
    console.error(url);
    console.log(`Fn: ${result}, CLI: ${cliResult}\n`);
  } else {
    inform(url, result);
  }

  return hasError;
});


// =================================================================

const notAllowedProtocolsErrors = validIPsListData.filter(url => {
  const result = isSSRFSafeURL(url, { autoPrependProtocol: 'http', allowedProtocols: ['https'] });
  const cliResult = cliexec(url, '--quiet --auto-prepend-protocol=http --allowed-protocols=https');
  const hasError = result || cliResult !== 'Danger!';

  if(hasError) {
    console.error('\n❌ URL Should not pass under a not allowed protocol:');
    console.error(url);
    console.log(`Fn: ${result}, CLI: ${cliResult}\n`);
  } else {
    inform(url, result);
  }

  return hasError;
});

// =================================================================

console.log('-'.repeat(process.stdout.columns / 2));

const errorsCount = [
  shouldNotPassErrors,
  shouldPassErrors,
  noIPErrors,
  noAutoPrependProtocolErrors,
  notAllowedProtocolsErrors,
  allowUsernameErrors
].reduce((n, item) => n+item.length, 0);

if (errorsCount) {
  throw new Error(`❌ TEST ERRORS: ${errorsCount}`);
}

console.log('✅ All ok!');
