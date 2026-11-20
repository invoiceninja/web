/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/web source repository
 *
 * @copyright Copyright (c) 2026. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

/**
 * Every query param is forwarded; the API decides what is useful and drops
 * the rest so a new tracking key never needs a web deploy.
 */
export function buildAttribution(
  searchParams: URLSearchParams,
  cookie: string = document.cookie
): Record<string, string> {
  const attribution = Object.fromEntries(searchParams);

  [
    ['fbc', '_fbc'],
    ['fbp', '_fbp'],
  ].forEach(([key, name]) => {
    const value = cookie
      .split('; ')
      .find((item) => item.startsWith(`${name}=`))
      ?.slice(name.length + 1);

    if (value) {
      attribution[key] = value;
    }
  });

  return attribution;
}
