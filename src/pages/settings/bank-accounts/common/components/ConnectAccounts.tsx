/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MdLink } from 'react-icons/md';
import { useClickAway } from 'react-use';
import { useColorScheme } from '$app/common/colors';
import { enterprisePlan } from '$app/common/guards/guards/enterprise-plan';
import { isSelfHosted } from '$app/common/helpers';
import { useAccentColor } from '$app/common/hooks/useAccentColor';
import { Button, Link } from '$app/components/forms';
import { Icon } from '$app/components/icons/Icon';
import { Modal } from '$app/components/Modal';
import { Tooltip } from '$app/components/Tooltip';
import {
  BankProvider,
  useAvailableSelfHostedProviders,
  useConnectBankProvider,
} from '../hooks/useBankProviders';
import goCardlessLogo from '/dap-logos/goCardless.png';
import yodleeLogo from '/dap-logos/yodlee.svg';

export function ConnectAccounts() {
  const [t] = useTranslation();
  const accentColor = useAccentColor();

  const colors = useColorScheme();

  const divRef = useRef<HTMLDivElement>(null);

  const [account, setAccount] = useState<BankProvider>();
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);

  const connect = useConnectBankProvider();
  const selfHostedProviders = useAvailableSelfHostedProviders();

  const showYodlee = !isSelfHosted() && enterprisePlan();
  const showNordigen = isSelfHosted()
    ? selfHostedProviders.includes('nordigen')
    : enterprisePlan();
  const showEnableBanking =
    isSelfHosted() && selfHostedProviders.includes('enablebanking');

  const isConnectDisabled = isSelfHosted() && selfHostedProviders.length === 0;

  useClickAway(divRef, () => {
    setAccount(undefined);
  });

  const handleClose = () => {
    setIsModalVisible(false);
    setAccount(undefined);
  };

  const handleConnectAccount = () => {
    if (account) {
      connect(account).then(handleClose);
    }
  };

  const handleConnectButtonClick = () => {
    if (!isSelfHosted()) {
      setIsModalVisible(true);
      return;
    }

    if (selfHostedProviders.length === 1) {
      connect(selfHostedProviders[0]);
      return;
    }

    if (selfHostedProviders.length > 1) {
      setIsModalVisible(true);
    }
  };

  const connectButton = (
    <Button
      type="secondary"
      behavior="button"
      onClick={handleConnectButtonClick}
      disabled={isConnectDisabled}
      disableWithoutIcon
    >
      <span className="mr-2">{<Icon element={MdLink} size={20} />}</span>
      {t('connect_accounts')}
    </Button>
  );

  return (
    <>
      {isConnectDisabled ? (
        <Tooltip
          message={t('bank_provider_not_configured') as string}
          width="auto"
          placement="top"
        >
          {connectButton}
        </Tooltip>
      ) : (
        connectButton
      )}

      <Modal
        title={t('connect_accounts')}
        visible={isModalVisible}
        onClose={handleClose}
      >
        <div ref={divRef} className="flex flex-col space-y-6">
          {showYodlee && (
            <div
              className="flex flex-col cursor-pointer border-4"
              style={{
                borderColor: account === 'yodlee' ? accentColor : colors.$24,
                height: '10.25rem',
              }}
              onClick={() => setAccount('yodlee')}
            >
              <img className="h-32" src={yodleeLogo} />

              <div
                className="flex items-center justify-center space-x-2 text-xs pb-3"
                onClick={(event) => event.stopPropagation()}
              >
                <p style={{ color: colors.$22 }}>{t('yodlee_regions')}.</p>

                <Link
                  className="text-xs"
                  to="https://www.yodlee.com/open-banking/data-connections"
                  external
                >
                  {t('learn_more')}.
                </Link>
              </div>
            </div>
          )}

          {showNordigen && (
            <div
              data-cy="nordigenBox"
              className="flex flex-col items-center cursor-pointer border-4"
              style={{
                borderColor: account === 'nordigen' ? accentColor : colors.$24,
                height: '10.25rem',
              }}
              onClick={() => setAccount('nordigen')}
            >
              <div className="flex flex-1 items-center justify-center">
                <img src={goCardlessLogo} style={{ width: '15rem' }} />
              </div>

              <div
                className="flex items-center justify-center space-x-2 text-xs pb-3"
                onClick={(event) => event.stopPropagation()}
              >
                <p style={{ color: colors.$22 }}>{t('nordigen_regions')}.</p>

                <Link
                  className="text-xs"
                  to="https://gocardless.com/bank-account-data/coverage/"
                  external
                >
                  {t('learn_more')}.
                </Link>
              </div>
            </div>
          )}

          {showEnableBanking && (
            <div
              data-cy="enableBankingBox"
              className="flex flex-col items-center cursor-pointer border-4"
              style={{
                borderColor:
                  account === 'enablebanking' ? accentColor : colors.$24,
                height: '10.25rem',
              }}
              onClick={() => setAccount('enablebanking')}
            >
              <div className="flex flex-1 items-center justify-center">
                <span
                  className="text-3xl font-semibold"
                  style={{ color: colors.$3 }}
                >
                  {t('enablebanking')}
                </span>
              </div>

              <div
                className="flex items-center justify-center space-x-2 text-xs pb-3"
                onClick={(event) => event.stopPropagation()}
              >
                <p style={{ color: colors.$22 }}>
                  {t('enablebanking_regions')}.
                </p>

                <Link
                  className="text-xs"
                  to="https://enablebanking.com/open-banking-apis"
                  external
                >
                  {t('learn_more')}.
                </Link>
              </div>
            </div>
          )}

          <Button
            behavior="button"
            onClick={handleConnectAccount}
            disableWithoutIcon
            disabled={!account}
          >
            {t('connect')}
          </Button>
        </div>
      </Modal>
    </>
  );
}
