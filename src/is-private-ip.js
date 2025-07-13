const { BlockList } = require('net');

/*
  Iana reserved IP list:
  https://www.iana.org/assignments/iana-ipv4-special-registry/iana-ipv4-special-registry-1.csv
*/

const PRIVATE_CIDRS = [
  '0.0.0.0/8',
  '10.0.0.0/8',
  '100.64.0.0/10',
  '127.0.0.0/8',
  '169.254.0.0/16',
  '172.16.0.0/12',
  '192.0.0.0/24',
  '192.0.0.0/29',
  '192.0.0.8/32',
  '192.0.0.9/32',
  '192.0.0.10/32',
  '192.0.0.170/32',
  '192.0.0.171/32',
  '192.0.2.0/24',
  '192.31.196.0/24',
  '192.52.193.0/24',
  '192.88.99.0/24',
  '192.168.0.0/16',
  '192.175.48.0/24',
  '198.18.0.0/15',
  '198.51.100.0/24',
  '203.0.113.0/24',
  '224.0.0.0/4',
  '240.0.0.0/4',
  '255.255.255.255/32'
];

function rangeCIDR(CIDR) {
	// beginning IP address
	var beg = CIDR.substr(CIDR,CIDR.indexOf('/'));
	var end = beg;
	var off = (1<<(32-parseInt(CIDR.substr(CIDR.indexOf('/')+1))))-1; 
	var sub = beg.split('.').map(function(a){return parseInt(a)});
	// an IPv4 address is just an UInt32...
	var buf = new ArrayBuffer(4); //4 octets 
	var i32 = new Uint32Array(buf);
	// get the UInt32, and add the bit difference
	i32[0]  = (sub[0]<<24) + (sub[1]<<16) + (sub[2]<<8) + (sub[3]) + off;
	// recombine into an IPv4 string:
	var end = Array.apply([],new Uint8Array(buf)).reverse().join('.');
	return [beg,end];
}

function privIp4(ip) {
  for (let cidr of PRIVATE_CIDRS) {
    const range = rangeCIDR(cidr);
    const blockList = new BlockList()
    blockList.addRange(range[0], range[1]);
    
    if (blockList.check(ip)) {
      return true;
    };
  }

  return false;
}

function privIp6 (ip) {
  return /^::$/.test(ip) ||
    /^::1$/.test(ip) ||
    /^::f{4}:([0-9]{1,3})\.([0-9]{1,3})\.([0-9]{1,3})\.([0-9]{1,3})$/.test(ip) ||
    /^::f{4}:0.([0-9]{1,3})\.([0-9]{1,3})\.([0-9]{1,3})\.([0-9]{1,3})$/.test(ip) ||
    /^64:ff9b::([0-9]{1,3})\.([0-9]{1,3})\.([0-9]{1,3})\.([0-9]{1,3})$/.test(ip) ||
    /^100::([0-9a-fA-F]{0,4}):?([0-9a-fA-F]{0,4}):?([0-9a-fA-F]{0,4}):?([0-9a-fA-F]{0,4})$/.test(ip) ||
    /^2001::([0-9a-fA-F]{0,4}):?([0-9a-fA-F]{0,4}):?([0-9a-fA-F]{0,4}):?([0-9a-fA-F]{0,4}):?([0-9a-fA-F]{0,4}):?([0-9a-fA-F]{0,4})$/.test(ip) ||
    /^2001:2[0-9a-fA-F]:([0-9a-fA-F]{0,4}):?([0-9a-fA-F]{0,4}):?([0-9a-fA-F]{0,4}):?([0-9a-fA-F]{0,4}):?([0-9a-fA-F]{0,4}):?([0-9a-fA-F]{0,4})$/.test(ip) ||
    /^2001:db8:([0-9a-fA-F]{0,4}):?([0-9a-fA-F]{0,4}):?([0-9a-fA-F]{0,4}):?([0-9a-fA-F]{0,4}):?([0-9a-fA-F]{0,4}):?([0-9a-fA-F]{0,4})$/.test(ip) ||
    /^2002:([0-9a-fA-F]{0,4}):?([0-9a-fA-F]{0,4}):?([0-9a-fA-F]{0,4}):?([0-9a-fA-F]{0,4}):?([0-9a-fA-F]{0,4}):?([0-9a-fA-F]{0,4}):?([0-9a-fA-F]{0,4})$/.test(ip) ||
    /^f[c-d]([0-9a-fA-F]{2,2}):/i.test(ip) ||
    /^fe[8-9a-bA-B][0-9a-fA-F]:/i.test(ip) ||
    /^ff([0-9a-fA-F]{2,2}):/i.test(ip)
}

function isPrivateIP(ip, version) {
  return (version === 4 ? privIp4 : privIp6)(ip);
}

module.exports = {
  isPrivateIP
}
