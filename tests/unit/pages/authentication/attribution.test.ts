/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/web source repository
 *
 * @copyright Copyright (c) 2026. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { describe, expect, test } from 'vitest';
import { buildAttribution } from '$app/pages/authentication/common/attribution';

describe('buildAttribution', () => {
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
