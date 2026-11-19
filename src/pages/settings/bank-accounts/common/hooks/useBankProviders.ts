/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { endpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { route } from '$app/common/helpers/route';
import { useCurrentAccount } from '$app/common/hooks/useCurrentAccount';

export type BankProvider = 'yodlee' | 'nordigen' | 'enablebanking';

export enum IntegrationType {
  Yodlee = 'YODLEE',
  Nordigen = 'NORDIGEN',
  EnableBanking = 'ENABLEBANKING',
}

/**
 * Bank providers that are configured on this self-hosted instance,
 * based on the account flags exposed by the API.
 */
export function useAvailableSelfHostedProviders(): BankProvider[] {
  const account = useCurrentAccount();

  const providers: BankProvider[] = [];

  if (account?.nordigen_enabled) {
    providers.push('nordigen');
  }

  if (account?.enablebanking_enabled) {
    providers.push('enablebanking');
  }

  return providers;
}

/**
 * Requests a one-time token for the given provider and opens the
 * provider's server-side connect flow in a new window.
 */
export function useConnectBankProvider() {
  return (provider: BankProvider, extraContext: Record<string, string> = {}) =>
    request('POST', endpoint('/api/v1/one_time_token'), {
      context: provider,
      platform: 'react',
      ...extraContext,
    }).then((tokenResponse) => {
      const hash = tokenResponse?.data?.hash;

      if (provider === 'yodlee') {
        window.open(
          route('https://invoicing.co/yodlee/onboard/:hash', { hash })
        );
        return;
      }

      window.open(
        endpoint('/:provider/connect/:hash', {
          provider,
          hash,
        })
      );
    });
}
