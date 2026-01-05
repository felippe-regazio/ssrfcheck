declare module 'ssrfcheck' {
  export type Options = {
    /**
     * When an error occurs the function will only return false and wont throw it
     * @default true
     */
    readonly quiet?: boolean;

    /**
     * Tells if the validator must automatically block any IP-URIs, e.g. https://164.456.34.44.
     * By default IP URIs are allowed but analysed to check if there is any SSRF risk
     * @default false
     */
    readonly noIP?: boolean;

    /**
     * Tells if the validator must allow URI's that contains login notation, e.g.
     * https://test:pass@domain.com. Address like this are blocked by default
     * @default false
     */
    readonly allowUsername?: boolean;

    /**
     * Protocols accepted by the validator
     * @default ['http', 'https']
     */
    readonly allowedProtocols?: readonly string[];

    /**
     * When passing a non schema-complete URL, tries to normalize using this protocol,
     * e.g: `a.com` will be normalized to `https://a.com` by default. Pass `false` to turn
     * off URL normalization, this will cause any non-schema-complete URL to return false
     * @default 'https'
     */
    readonly autoPrependProtocol?: string | false;

    /**
     * By The RFC, the following chars are forbidden as WYSIWYG in a URL and must be encoded:
     * "<>\^`{|}. This lib prohibites them by default, mark this option as true to allow it
     * @default false
     */
    readonly allowUnsafeChars?: boolean;
  };

  /**
   * Check if a given URL string contains a possible SSRF (Server-Side Request Forgery) attack
   *
   * @param url - The URL string to validate
   * @param options - Configuration options for the validator
   * @returns `true` if the URL is safe, `false` if it's potentially unsafe or invalid
   */
  export function isSSRFSafeURL(url: string, options?: Options): boolean;
}
