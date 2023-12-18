import { isSSRFSafeURL } from '../src/index.js';

if (!isSSRFSafeURL || typeof isSSRFSafeURL !== 'function') {
  throw new Error('ESM Import Failed!');
}
