/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { toast } from '$app/common/helpers/toast/toast';
import { $refetch } from '$app/common/hooks/useRefetch';

const CONNECT_ACTIONS: Record<string, string> = {
  nordigen_connect: 'nordigen',
  enablebanking_connect: 'enablebanking',
};

const RESULT_PARAMS = ['action', 'status', 'reason', 'bank_integrations'];

export interface BankConnectResult {
  provider: string;
  status: string | null;
  reason: string | null;
}

/**
 * Extracts the bank connect result that the backend appends to the
 * redirect URL. With the hash router the query lives inside the hash
 * (`/#/settings/bank_accounts?action=…`); otherwise it is the regular
 * query string. Both are checked.
 */
export function parseBankConnectResult(
  ...sources: URLSearchParams[]
): BankConnectResult | null {
  for (const params of sources) {
    const provider = CONNECT_ACTIONS[params.get('action') ?? ''];

    if (provider) {
      return {
        provider,
        status: params.get('status'),
        reason: params.get('reason'),
      };
    }
  }

  return null;
}

export function useBankConnectResult() {
  const [t, i18n] = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    const windowParams = new URLSearchParams(window.location.search);

    const result = parseBankConnectResult(searchParams, windowParams);

    if (!result) {
      return;
    }

    if (result.status === 'success') {
      toast.success('bank_accounts_connected');
      $refetch(['bank_integrations']);
    } else if (result.status === 'user-aborted') {
      toast.error('bank_connect_aborted');
    } else {
      const reasonKey = `${result.provider}_handler_error_heading_${(
        result.reason ?? ''
      ).replace(/-/g, '_')}`;

      toast.error(
        result.reason && i18n.exists(reasonKey)
          ? `${t('bank_connect_failed')}: ${t(reasonKey)}`
          : 'bank_connect_failed'
      );
    }

    // Clean up the URL so a refresh does not show the result again.
    if (RESULT_PARAMS.some((param) => searchParams.has(param))) {
      const cleaned = new URLSearchParams(searchParams);
      RESULT_PARAMS.forEach((param) => cleaned.delete(param));
      setSearchParams(cleaned, { replace: true });
    }

    if (RESULT_PARAMS.some((param) => windowParams.has(param))) {
      RESULT_PARAMS.forEach((param) => windowParams.delete(param));

      const query = windowParams.toString();

      window.history.replaceState(
        window.history.state,
        '',
        `${window.location.pathname}${query ? `?${query}` : ''}${
          window.location.hash
        }`
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);
}
