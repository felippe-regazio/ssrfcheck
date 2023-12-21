# SSRF Check

Check if a given URI-String contains a possible SSRF (Server-Side Request Forgery) attack. Zero dependencies!

## Installation

```
npm install ssrfcheck
```

## Usage

```js
import { isSSRFSafeURL } from 'ssrfcheck';

const url = 'https://localhost:8080/whatever';
const result = isSSRFSafeURL(url); // false
```

The function returns true for a safe URL, and false for an unsafe one.

### CommonJS

You can use this library as a CJS module as well

```js
const { isSSRFSafeURL } = require('ssrfcheck');

const url = 'https://localhost:8080/whatever';
const result = isSSRFSafeURL(url); // false
```

### CLI

```
npx ssrfcheck <uri> <options>
```

Or if you prefer, just intall the lib globaly and supress the npx:

```
npm install -g ssrfcheck
```

Usage Example:

```
npx ssrfcheck https://localhost:8080/whatever
```

The command above will output `Safe` for safe URLs and `Danger!` for the possibly vulnerable ones.

## When to Use

If you have any user-input/config that receives an URL, you are vunerable to SSRF attacks and must validate your URL. This library must be used on the backend. You can know more about it here:

https://github.com/swisskyrepo/PayloadsAllTheThings/blob/master/Server%20Side%20Request%20Forgery/README.md

## Options

Function signature

```ts
function isSSRFSafeURL(url: string, options: Options): boolean
```

Options must be an object with the following structure:

```ts
{
  quiet: boolean,
  noIP: boolean,
  allowUsername: boolean,
  allowedProtocols: string[],
}
```

You can pass incremental options, that means: if you dont pass a value for some options, the library will provide default values.

|Option|Description|Type|Default|
|--|--|--|---|
|quiet|When an error occurs the function will only return false and wont throw it|boolean|true|
|noIP|Tells if the validator must automatically block any IP-URIs, e.g. https://164.456.34.44. By default IP URIs are allowed but analysed to check if there is any SSRF risk|boolean|false|
|allowUsername|Tells if the validator must allow URI's that contains login notation, e.g. https://test:pass@domain.com. Address like this are blocked by default|boolean|false|
|allowedProtocols| Protocols accepted by the validator|Array|[ 'http', 'https ]|

### Example

For this example, we will validate a URL but allowing login-URIs and ftp: protocol:

```js
import { isSSRFSafeURL } from 'ssrfcheck';

const url = 'https://localhost:8080/whatever';

const result = isSSRFSafeURL(url, {
  allowUsername: true,
  allowedProtocols: [ 'http', 'https', 'ftp' ],
});
```

### CLI Options

You can pass any options using CLI notation

|Option|Equivalent|
|--|--|
|--quiet|quiet|
|--no-ip|noIP|
|--allow-username|allowUsername|
|--allowed-protocols=|allowedProtocols|

Example

```
npx ssrfcheck ftp://user:pass@localhost:8080/whatever --allowed-protocols=ftp,http,https --allow-username
```

# What does this Lib check?

The library checks for complete URLs focusing on the protocol and domain structure and tells whether is a possible SSRF attack or not. This library does NOT checks for path traversal attacks. The checks are made in the following order:

- must contain a hostname
- must not contain login-urls (e.g: https://user:pass@domain.com) - optionated
- cannot be a dot domain (e.g: https://./../.com) - commonly result of some trick
- cannot be localhost or loopback domain
- cannot be a private IP of any range
- checks for tricks: oct domain, decimal domains, special chars, etc

If you wann know more about coverage, check the tests directory of this project. Test data lives in /tests/data folder.

# Contribution

Sources are in `/src`, tests in `/tests`. No build needed. To run tests: `npm run test`. No dependencies, no install, just code and test.

# LICENSE

MIT LICENSE Copyright (c) 2023 Felippe Regazio
