/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useTranslation } from 'react-i18next';
import { MdWarning } from 'react-icons/md';
import { route } from '$app/common/helpers/route';
import { useFormatMoney } from '$app/common/hooks/money/useFormatMoney';
import { useCurrentCompany } from '$app/common/hooks/useCurrentCompany';
import { useResolveCurrency } from '$app/common/hooks/useResolveCurrency';
import { BankAccount } from '$app/common/interfaces/bank-accounts';
import { DataTableColumns } from '$app/components/DataTable';
import { Link } from '$app/components/forms';
import { Tooltip } from '$app/components/Tooltip';
import { IntegrationType, useConnectBankProvider } from './useBankProviders';

const RECONNECTABLE_INTEGRATION_TYPES: string[] = [
  IntegrationType.Yodlee,
  IntegrationType.Nordigen,
  IntegrationType.EnableBanking,
];

export const useBankAccountColumns = () => {
  const { t } = useTranslation();
  const company = useCurrentCompany();

  const formatMoney = useFormatMoney();
  const resolveCurrency = useResolveCurrency({ resolveBy: 'code' });

  const connect = useConnectBankProvider();

  const handleReconnect = (bankAccount: BankAccount) => {
    switch (bankAccount.integration_type) {
      case IntegrationType.Nordigen:
        connect('nordigen', {
          institution_id: bankAccount.nordigen_institution_id,
        });
        break;

      case IntegrationType.EnableBanking:
        // The bank (ASPSP) is selected again server-side.
        connect('enablebanking');
        break;

      case IntegrationType.Yodlee:
        connect('yodlee');
        break;
    }
  };

  const columns: DataTableColumns<BankAccount> = [
    {
      id: 'bank_account_name',
      label: t('name'),
      format: (field, bankAccount) => (
        <div className="flex items-center space-x-3">
          <Link
            to={route('/settings/bank_accounts/:id/details', {
              id: bankAccount?.id,
            })}
          >
            {bankAccount?.bank_account_name}
          </Link>

          {RECONNECTABLE_INTEGRATION_TYPES.includes(
            bankAccount.integration_type
          ) &&
            bankAccount.disabled_upstream && (
              <Tooltip
                message={t('reconnect') as string}
                width="auto"
                placement="top"
              >
                <div
                  className="cursor-pointer"
                  onClick={(event) => {
                    event.stopPropagation();

                    handleReconnect(bankAccount);
                  }}
                >
                  <MdWarning color="red" size={22} />
                </div>
              </Tooltip>
            )}
        </div>
      ),
    },
    { id: 'bank_account_type', label: t('type') },
    {
      id: 'balance',
      label: t('balance'),
      format: (value, bankAccount) =>
        formatMoney(
          value,
          company?.settings?.country_id,
          resolveCurrency(bankAccount.currency)?.id
        ),
    },
  ];

  return columns;
};
