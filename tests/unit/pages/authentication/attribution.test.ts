/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/web source repository
 *
 * @copyright Copyright (c) 2026. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { beforeEach, describe, expect, test, vi } from 'vitest';
import {
  buildAttribution,
  clearAttribution,
  rememberAttribution,
} from '$app/pages/authentication/common/attribution';

describe('buildAttribution', () => {
  const memory = new Map<string, string>();

  beforeEach(() => {
    memory.clear();

    vi.stubGlobal('sessionStorage', {
      getItem: (key: string) => memory.get(key) ?? null,
      setItem: (key: string, value: string) => void memory.set(key, value),
      removeItem: (key: string) => void memory.delete(key),
    });
  });

  test('remembers the params so an oauth redirect keeps them', () => {
    rememberAttribution(new URLSearchParams('utm_source=google&gclid=abc'));

    expect(buildAttribution(new URLSearchParams(''), '')).toEqual({
      utm_source: 'google',
      gclid: 'abc',
    });
  });

  test('prefers the params currently in the url', () => {
    rememberAttribution(new URLSearchParams('utm_source=google'));

    expect(
      buildAttribution(new URLSearchParams('utm_source=facebook'), '')
    ).toEqual({ utm_source: 'facebook' });
  });

  test('clears once the signup is done', () => {
    rememberAttribution(new URLSearchParams('utm_source=google'));
    clearAttribution();

    expect(buildAttribution(new URLSearchParams(''), '')).toEqual({});
  });

  test('forwards every query param so the API can filter them', () => {
    const attribution = buildAttribution(
      new URLSearchParams(
        'utm_source=facebook&fbclid=abc123&rc=friend&signup=true'
      ),
      ''
    );

    expect(attribution).toEqual({
      utm_source: 'facebook',
      fbclid: 'abc123',
      rc: 'friend',
      signup: 'true',
    });
  });

  test('adds the meta click cookies', () => {
    const attribution = buildAttribution(
      new URLSearchParams('utm_source=facebook'),
      '_fbp=fb.1.123.456; _fbc=fb.1.123.abc; session=xyz'
    );

    expect(attribution).toEqual({
      utm_source: 'facebook',
      fbp: 'fb.1.123.456',
      fbc: 'fb.1.123.abc',
    });
  });

  test('handles a missing cookie', () => {
    expect(
      buildAttribution(new URLSearchParams('utm_source=google'), '')
    ).toEqual({ utm_source: 'google' });
  });
});
