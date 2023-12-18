function isLoopbackAddr(ip) {
  return /^127\.([0-9]{1,3})\.([0-9]{1,3})\.([0-9]{1,3})$/i.test(ip) || /^::1$/.test(ip);
}

module.exports = {
  isLoopbackAddr
}
