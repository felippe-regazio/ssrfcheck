const { BlockList, isIP } = require('net');

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

const DIRECT_PRIVATE_IPV6_BLOCKLIST = new BlockList();
DIRECT_PRIVATE_IPV6_BLOCKLIST.addAddress('::', 'ipv6');
DIRECT_PRIVATE_IPV6_BLOCKLIST.addAddress('::1', 'ipv6');
DIRECT_PRIVATE_IPV6_BLOCKLIST.addSubnet('fc00::', 7, 'ipv6');
DIRECT_PRIVATE_IPV6_BLOCKLIST.addSubnet('fe80::', 10, 'ipv6');
DIRECT_PRIVATE_IPV6_BLOCKLIST.addSubnet('ff00::', 8, 'ipv6');
DIRECT_PRIVATE_IPV6_BLOCKLIST.addSubnet('100::', 64, 'ipv6');
DIRECT_PRIVATE_IPV6_BLOCKLIST.addSubnet('2001::', 32, 'ipv6');
DIRECT_PRIVATE_IPV6_BLOCKLIST.addSubnet('2001:20::', 28, 'ipv6');
DIRECT_PRIVATE_IPV6_BLOCKLIST.addSubnet('2001:db8::', 32, 'ipv6');
DIRECT_PRIVATE_IPV6_BLOCKLIST.addSubnet('2002::', 16, 'ipv6');

const IPV4_BEARING_IPV6_BLOCKLIST = new BlockList();
IPV4_BEARING_IPV6_BLOCKLIST.addSubnet('::ffff:0:0', 96, 'ipv6');
IPV4_BEARING_IPV6_BLOCKLIST.addSubnet('::ffff:0:0:0', 96, 'ipv6');
IPV4_BEARING_IPV6_BLOCKLIST.addSubnet('64:ff9b::', 96, 'ipv6');
IPV4_BEARING_IPV6_BLOCKLIST.addSubnet('64:ff9b:1::', 48, 'ipv6');
IPV4_BEARING_IPV6_BLOCKLIST.addSubnet('::', 96, 'ipv6');

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

function dottedIPv4ToHextets(ipv4) {
  const octets = ipv4.split('.').map(Number);

  if (octets.length !== 4 || octets.some((item) => item < 0 || item > 255 || Number.isNaN(item))) {
    return null;
  }

  const high = ((octets[0] << 8) | octets[1]).toString(16);
  const low = ((octets[2] << 8) | octets[3]).toString(16);

  return `${high}:${low}`;
}

function normalizeIPv6ForBlockList(ip) {
  const normalized = String(ip || '').toLowerCase();
  const dottedTail = normalized.match(/^(.*:)(\d{1,3}(?:\.\d{1,3}){3})$/);

  if (!dottedTail) {
    return normalized;
  }

  const hextets = dottedIPv4ToHextets(dottedTail[2]);

  if (!hextets) {
    return normalized;
  }

  return `${dottedTail[1]}${hextets}`;
}

function expandIPv6ToHextets(ip) {
  const value = normalizeIPv6ForBlockList(ip).toLowerCase();

  if (isIP(value) !== 6) {
    return null;
  }

  if ((value.match(/::/g) || []).length > 1) {
    return null;
  }

  let left = [];
  let right = [];

  if (value.includes('::')) {
    const parts = value.split('::');
    left = parts[0] ? parts[0].split(':').filter(Boolean) : [];
    right = parts[1] ? parts[1].split(':').filter(Boolean) : [];
  } else {
    left = value.split(':').filter(Boolean);
  }

  const validHex = /^[0-9a-f]{1,4}$/;
  if (![...left, ...right].every((item) => validHex.test(item))) {
    return null;
  }

  const missing = 8 - (left.length + right.length);
  if (missing < 0 || (!value.includes('::') && missing !== 0)) {
    return null;
  }

  const full = value.includes('::')
    ? [...left, ...Array(missing).fill('0'), ...right]
    : left;

  if (full.length !== 8) {
    return null;
  }

  return full.map((item) => parseInt(item, 16));
}

function ipv4FromIPv4BearingIPv6(ip) {
  const normalized = normalizeIPv6ForBlockList(ip);

  if (!IPV4_BEARING_IPV6_BLOCKLIST.check(normalized, 'ipv6')) {
    return null;
  }

  const hextets = expandIPv6ToHextets(normalized);

  if (!hextets) {
    return null;
  }

  return [
    hextets[6] >> 8,
    hextets[6] & 255,
    hextets[7] >> 8,
    hextets[7] & 255,
  ].join('.');
}

function privIp6 (ip) {
  const normalized = normalizeIPv6ForBlockList(ip);

  if (isIP(normalized) !== 6) {
    return false;
  }

  const embeddedIPv4 = ipv4FromIPv4BearingIPv6(normalized);

  return Boolean(
    (embeddedIPv4 && privIp4(embeddedIPv4)) ||
    DIRECT_PRIVATE_IPV6_BLOCKLIST.check(normalized, 'ipv6')
  );
}

function isPrivateIP(ip, version) {
  return (version === 4 ? privIp4 : privIp6)(ip);
}

module.exports = {
  isPrivateIP
}
