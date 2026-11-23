/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/web source repository
 *
 * @copyright Copyright (c) 2026. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

const STORAGE_KEY = 'in_attribution';

/**
 * OAuth sign-ups can leave the page (redirect or popup), so the params the
 * visitor arrived with are kept for the rest of the session.
 */
export function rememberAttribution(searchParams: URLSearchParams): void {
  const params = Object.fromEntries(searchParams);

  if (Object.keys(params).length === 0) {
    return;
  }

  try {
    sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ ...storedAttribution(), ...params })
    );
  } catch {
    // storage unavailable (private mode), the URL still carries the params
  }
}

export function storedAttribution(): Record<string, string> {
  try {
    return JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? '{}') ?? {};
  } catch {
    return {};
  }
}

export function clearAttribution(): void {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // nothing to clear
  }
}

/**
 * Every query param is forwarded; the API decides what is useful and drops
 * the rest so a new tracking key never needs a web deploy.
 */
export function buildAttribution(
  searchParams: URLSearchParams,
  cookie: string = document.cookie
): Record<string, string> {
  const attribution = {
    ...storedAttribution(),
    ...Object.fromEntries(searchParams),
  };

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
