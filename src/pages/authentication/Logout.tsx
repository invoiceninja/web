/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useColorScheme } from '$app/common/colors';
import { clearLocalStorage } from '$app/common/helpers/local-storage';
import { Button } from '$app/components/forms';
import { Header } from './components/Header';
import {useTitle} from "$app/common/hooks/useTitle";

export function Logout() {
  useTitle('logout');

  const colors = useColorScheme();

  const [t] = useTranslation();
  const queryClient = useQueryClient();

  // const { signOut } = useGoogleLogout({
  //   clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID,
  // });

  useEffect(() => {
    // if (isHosted() && user?.oauth_provider_id === 'microsoft' && msal) {
    //   msal.logoutPopup();
    // }

    // if (isHosted() && user?.oauth_provider_id === 'google') {
    //   // signOut();
    // }

    clearLocalStorage();
    sessionStorage.clear();

    // queryClient.invalidateQueries();
    // queryClient.removeQueries();
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center py-8">
      <Header />

      <div className="flex flex-col items-center w-full">
        <div
          className="mx-4 max-w-md w-full p-8 rounded md:shadow-lg border"
          style={{ backgroundColor: colors.$1, borderColor: colors.$5 }}
        >
          <h2 className="text-2xl" style={{ color: colors.$3 }}>
            {t('logout')}
          </h2>

          <p>{t('logout_message')}</p>

          <Button className="mt-4" variant="block" onClick={() => {
            window.location.href = '/';
          }}>
            {t('logout_go')}
          </Button>
        </div>
      </div>
    </div>
  );
}
