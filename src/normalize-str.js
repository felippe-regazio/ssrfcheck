/**
  when try to create a URL from the arg we take advantage of runtime 
  native checkings. the normalize NFKD will clear the charset, which 
  will allow us to deal with exotic-chars as http://ⓔⓧⓐⓜⓟⓛⓔ.ⓒⓞⓜ
  which results in http://example.com.
*/
function normalizeStr(str) {
  if (typeof str !== 'string') {
    return '';
  };

  return str.normalize('NFKD');
}

module.exports = {
  normalizeStr
}
