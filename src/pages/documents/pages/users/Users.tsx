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
import { useCurrentCompany } from '$app/common/hooks/useCurrentCompany';
import { useDocuNinjaActions } from '$app/common/hooks/useDocuNinjaActions';
import { $refetch } from '$app/common/hooks/useRefetch';
import { useTitle } from '$app/common/hooks/useTitle';
import { User } from '$app/common/interfaces/docuninja/api';
import { useSocketEvent } from '$app/common/queries/sockets';
import { DataTable } from '$app/components/DataTable';
import { Default } from '$app/components/layouts/Default';
import { NumberOfUsersAlert } from './common/components/NumberOfUsersAlert';
import { useUserColumns } from './common/hooks/useUserColumns';

export default function Users() {
  useTitle('users');

  const [t] = useTranslation();

  const columns = useUserColumns();
  const company = useCurrentCompany();
  const { getToken } = useDocuNinjaActions();

  const pages = [
    {
      name: t('docuninja'),
      href: '/docuninja',
    },
    {
      name: t('users'),
      href: '/docuninja/users',
    },
  ];

  useSocketEvent({
    on: ['App\\Events\\User\\UserWasVerified'],
    callback: () => $refetch(['docuninja_users']),
  });

  return (
    <Default title={t('users')} breadcrumbs={pages}>
      <NumberOfUsersAlert />

      <DataTable<User>
        queryIdentificator="/api/users"
        resource="user"
        endpoint={`/api/users?ninjaCompanyKey=${company.company_key}`}
        columns={columns}
        withResourcefulActions
        useRestoreForDeletedResources
        bulkRoute="/api/users/bulk"
        linkToCreate="/docuninja/users/selection"
        linkToEdit="/docuninja/users/:id/edit"
        useDocuNinjaApi
        endpointHeaders={{
          Authorization: `Bearer ${getToken()}`,
        }}
        totalPagesPropPath="data.meta.last_page"
        totalRecordsPropPath="data.meta.total"
        filterParameterKey="search"
      />
    </Default>
  );
}
