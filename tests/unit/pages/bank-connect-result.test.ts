/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2026. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { describe, expect, test } from 'vitest';
import { parseBankConnectResult } from '$app/pages/settings/bank-accounts/common/hooks/useBankConnectResult';

const params = (query: string) => new URLSearchParams(query);

describe('parseBankConnectResult', () => {
  test('parses an EnableBanking success result', () => {
    expect(
      parseBankConnectResult(
        params(
          'action=enablebanking_connect&status=success&bank_integrations=1,2'
        )
      )
    ).toEqual({ provider: 'enablebanking', status: 'success', reason: null });
  });

  test('parses a Nordigen failed result with reason', () => {
    expect(
      parseBankConnectResult(
        params('action=nordigen_connect&status=failed&reason=token-invalid')
      )
    ).toEqual({
      provider: 'nordigen',
      status: 'failed',
      reason: 'token-invalid',
    });
  });

  test('falls back to the next source (regular query string)', () => {
    expect(
      parseBankConnectResult(
        params(''),
        params('action=enablebanking_connect&status=user-aborted')
      )
    ).toEqual({
      provider: 'enablebanking',
      status: 'user-aborted',
      reason: null,
    });
  });

  test('ignores unrelated actions', () => {
    expect(parseBankConnectResult(params('action=other&status=success'))).toBe(
      null
    );
    expect(parseBankConnectResult(params(''))).toBe(null);
  });
});
