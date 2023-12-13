# SSRF Check

Check if a given URI-String contains a possible SSRF attack.

### Installation

```
npm install ssrfcheck
```

### Usage

```js
import { isSSRFSafeURL } from 'ssrfcheck';

const url = 'https://localhost:8080/whatever';
const result = isSSRFSafeURL(url); // false
```

The function returns true for a safe URL, and false for an unsafe one.

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

Option|Description|Type|Default|
quiet|When an error occurs the function will only return false and wont throw it|boolean|true|
noIP|Tells if the validator must automatically block any IP-URIs, e.g. https://164.456.34.44. By default IP URIs are allowed but analysed to check if there is any SSRF risk|boolean|false|
allowUsername|Tells if the validator must allow URI's that contains login notation, e.g. https://test:pass@domain.com. Address like this are blocked by default|boolean|false|
allowedProtocols| Protocols accepted by the validator|Array|[ 'http', 'https ]|

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

## CLI

You can use the CLI interface to check if a string contains a possible SSRF attack. The CLI will return `Safe` for safe URIs and `Danger!` for possible vulnerable URIs:

```
npx ssrfcheck <uri> <options>
```

Example

```
npx ssrfcheck https://localhost:8080/whatever
```

The command above will output `Danger!`

### Options

You can pass any options using CLI notation

Option|Equivalent
--quiet|quiet
--no-ip|noIP
--allow-username|allowUsername
--allowed-protocols=|allowedProtocols|

Example

```
npx ssrfcheck ftp://user:pass@localhost:8080/whatever --allowed-protocols=ftp,http,https --allow-username
```

### CLI Help

To get help, just call `npx ssrfcheck` with no parameters