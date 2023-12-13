import shouldPassData from './data/should-pass.js';
import shouldNotPassData from './data/should-not-pass.js';
import { isSSRFSafeURL } from '../src/index.js';

// =================================================================

const shouldNotPassErrors = shouldNotPassData.filter(url => {
  const result = isSSRFSafeURL(url);

  if(result) {
    console.error('❌ URL Should not pass:');
    console.error(url, '\n');
  };

  return result;
});

// =================================================================

const shouldPassErrors = shouldPassData.filter(url => {
  const result = isSSRFSafeURL(url);

  if(!result) {
    console.error('❌ URL Should pass:');
    console.error(url, '\n');
  };

  return !result;
});

// =================================================================

const errorsCount = shouldNotPassErrors.length + shouldPassErrors.length;

if (errorsCount) {
  throw new Error(`❌ TEST ERRORS: ${errorsCount}`);
}

console.log('✅ All ok!');
