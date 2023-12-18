function trimBrackets(hostname) {
  if (hostname.startsWith('[') && hostname.endsWith(']')) {
    return hostname.substring(1, hostname.length -1);
  }
  
  return hostname;
}

module.exports = {
  trimBrackets
}
