const path = require('path');
const { execSync } = require('child_process');
const { isSSRFSafeURL } = require('../src/index.js');
const shouldPassData = require('./data/should-pass.js');
const shouldNotPassData = require('./data/should-not-pass.js');
const BIN_CLI_PATH = path.resolve(__dirname, '..', 'src', 'cli.js');
const cliexec = (url, opts = '--quiet') => execSync(`${BIN_CLI_PATH} \"${url}\" ${opts}`).toString().trim();
const inform = (url, result) => console.log(`Checked: ${url} → ${result}`);

// =================================================================

const shouldNotPassErrors = shouldNotPassData.filter(url => {
  const result = isSSRFSafeURL(url);
  const cliResult = cliexec(url);

  if(result || cliResult !== 'Danger!') {
    console.error('\n❌ URL Should not pass:');
    console.error(url, '\n');
  } else {
    inform(url, result);
  }

  return result;
});

// =================================================================

const shouldPassErrors = shouldPassData.filter(url => {
  const result = isSSRFSafeURL(url);
  const cliResult = cliexec(url);

  if(!result || cliResult !== 'Safe') {
    console.error('\n❌ URL Should pass:');
    console.error(url, '\n');
  } else {
    inform(url, result);
  }

  return !result;
});

// =================================================================

const errorsCount = shouldNotPassErrors.length + shouldPassErrors.length;

if (errorsCount) {
  throw new Error(`❌ TEST ERRORS: ${errorsCount}`);
}

console.log('\n✅ All ok!');
