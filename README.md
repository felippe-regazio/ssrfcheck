# SSRF Check

Check if a given `URI String Representation` contains a potential SSRF (Server-Side Request Forgery) attack. Zero dependencies!

# What does this Lib check?

This library checks for complete URLs strings focusing on the protocol and domain structure, then tells whether is a possible SSRF attack or not. The checks are made in the following order:

- must contain a hostname
- must not contain login-urls (e.g: https://user:pass@domain.com) (optionated)
- cannot contain RFC forbidden chars: "<>\\^\`\{\|\} (optionated)
- cannot be a dot domain (e.g: https://./../.com) - commonly result of some trick
- cannot be localhost or loopback domain
- cannot be a private IP of any range
- checks for tricks: oct domain, decimal domains, special chars, etc

If you wann know more about coverage, check the tests directory of this project. Test data lives in /tests/data folder.

## What the lib DOES NOT check?

This library does NOT check path traversal attacks. This library does not check the network or DNS layer to assert the URI, is your responsability to check and provide a reliable URI origin for the checker. This lib will NOT check SSRF attacks via redirection since it cant hook into any kind of Request. To know more about other protection layers against SSRF: https://owasp.org/Top10/A10_2021-Server-Side_Request_Forgery_%28SSRF%29/

## Security State

The current stable version of this package do not have opened or known vulnerabilities.
Always remember to keep this package updated in the @latest version.
You can check the vulnerabilities history here:

https://security.snyk.io/vuln/SNYK-JS-SSRFCHECK-9510756

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

## When to use it

If you have any user-input/config that receives an URL which you use to request, or any kind of dynamic data that compose a complete URL, you may be vunerable to SSRF attacks and must validate this URL. This library must be used on the backend. This library requires a valid *URL* to check, the *minimum* URL schema is: `protocol://ip|top-level-domain`. Exotic strings will be normalized and mounted as an https URL by default (You can change it on the param `autoPrependProtocol`). This means that, if you type `www.example.com` it will be normalized by default to `https://www.example.com`. If you want to test fragments or paths and not only entire URLs, you may be looking for a `path traversal` validator instead. Any exotic string that cannot be normalized to a valid domain are considered a threat and will cause this library to return a Danger alert, since it can be a "tricky" path combination trying to exploit your service.

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
  autoPrependProtocol: string,
  allowUnsafeChars: boolean,
}
```

You can pass incremental options, that means: if you dont pass a value for some options, the library will provide default values.

|Option|Description|Type|Default|
|--|--|--|---|
|quiet|When an error occurs the function will only return false and wont throw it|boolean|true|
|noIP|Tells if the validator must automatically block any IP-URIs, e.g. https://164.456.34.44. By default IP URIs are allowed but analysed to check if there is any SSRF risk|boolean|false|
|allowUsername|Tells if the validator must allow URI's that contains login notation, e.g. https://test:pass@domain.com. Address like this are blocked by default|boolean|false|
|allowedProtocols| Protocols accepted by the validator|Array|[ 'http', 'https ]|
|autoPrependProtocol|When passing a non schema-complete URL, tries to normalize using this protocol, e.g: `a.com` will be normalized to `https://a.com` by default. Pass `false` to turn off URL normalization, this will cause any non-schema-complete URL to return false|string or `false`|https|
|allowUnsafeChars|By The RFC, the following chars are forbidden as WYSIWYG in a URL and must be encoded: **"<>\\^\`\{\|\}**. This lib prohibites them by default, mark this option as true to allow it|boolean|false|

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
|--allow-unsafe-chars=|allowUnsafeChars|
|--auto-prepend-protocol=|autoPrependProtocol|

Example

```
npx ssrfcheck ftp://user:pass@localhost:8080/whatever --allowed-protocols=ftp,http,https --allow-username
```

# Contribution

Sources are in `/src`, tests in `/tests`. No build needed. To run tests: `npm run test`. No dependencies, no install, just code and test.

# LICENSE

MIT LICENSE Copyright (c) 2023 Felippe Regazio
