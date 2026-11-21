/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2026. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { createElement } from 'react';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

const refreshState = vi.hoisted(() => ({
  companyUsers: [] as unknown[],
  searchParams: new URLSearchParams(),
  user: { authenticated: false } as object,
  pending: null as Promise<unknown> | null,
}));

vi.mock('$app/common/helpers', () => ({
  endpoint: (url: string) => url,
}));

vi.mock('$app/common/helpers/request', () => ({
  request: () => Promise.resolve({ data: { data: refreshState.companyUsers } }),
}));

vi.mock('$app/common/stores/slices/company-users', () => ({
  changeCurrentIndex: (payload: number) => ({
    type: 'changeCurrentIndex',
    payload,
  }),
  resetChanges: (payload: string) => ({ type: 'resetChanges', payload }),
  updateCompanyUsers: (payload: unknown) => ({
    type: 'updateCompanyUsers',
    payload,
  }),
}));

vi.mock('$app/common/stores/store', () => ({}));

vi.mock('react-redux', async () => {
  const { userSlice } = await import('$app/common/stores/slices/user');

  return {
    useSelector: () => refreshState.user,
    // Runs the real `authenticate` reducer, which is what stores the token.
    useDispatch: () => (action: { type: string }) => {
      refreshState.user = userSlice.reducer(refreshState.user as never, action);
    },
  };
});

vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
  useSearchParams: () => [refreshState.searchParams, vi.fn()],
}));

vi.mock('@tanstack/react-query', () => ({
  useQueryClient: () => ({
    fetchQuery: ({ queryFn }: { queryFn: () => Promise<unknown> }) => {
      refreshState.pending = queryFn();

      return refreshState.pending;
    },
    invalidateQueries: vi.fn(),
  }),
}));

import { useAuthenticated } from '$app/common/hooks/useAuthenticated';

class MemoryStorage {
  private items = new Map<string, string>();

  getItem(key: string) {
    return this.items.has(key) ? (this.items.get(key) as string) : null;
  }

  removeItem(key: string) {
    this.items.delete(key);
  }

  setItem(key: string, value: string) {
    this.items.set(key, String(value));
  }
}

// Stands in for the company every tab shares.
let shared: MemoryStorage;
// Stands in for this one tab.
let tab: MemoryStorage;
let renderer: ReactTestRenderer | undefined;

function companyUser(id: string, token: string) {
  return { user: { id: 'user' }, company: { id }, token: { token } };
}

function AuthenticatedHarness() {
  useAuthenticated();

  return null;
}

async function refresh() {
  act(() => {
    renderer = create(createElement(AuthenticatedHarness));
  });

  await refreshState.pending;
}

describe('useAuthenticated', () => {
  beforeEach(() => {
    shared = new MemoryStorage();
    tab = new MemoryStorage();

    vi.stubGlobal('localStorage', shared);
    vi.stubGlobal('sessionStorage', tab);

    shared.setItem('X-NINJA-TOKEN', 'token-a');
    shared.setItem('X-CURRENT-INDEX', '0');

    refreshState.companyUsers = [];
    refreshState.searchParams = new URLSearchParams();
    refreshState.user = { authenticated: false };
    refreshState.pending = null;
  });

  afterEach(() => {
    act(() => renderer?.unmount());
    renderer = undefined;

    vi.unstubAllGlobals();
  });

  test('a token the server rotated replaces the stored one', async () => {
    refreshState.companyUsers = [
      companyUser('a', 'token-a2'),
      companyUser('b', 'token-b'),
    ];

    await refresh();

    expect(shared.getItem('X-NINJA-TOKEN')).toBe('token-a2');
  });

  test('the stored token is kept when the response has none', async () => {
    refreshState.companyUsers = [
      companyUser('a', ''),
      companyUser('b', 'token-b'),
    ];

    await refresh();

    expect(shared.getItem('X-NINJA-TOKEN')).toBe('token-a');
  });

  test('a stored token the server still lists is kept, whatever its index', async () => {
    // The stored index and token disagree, e.g. a removed company shifted the
    // order. The token still works, so the session stays in its company.
    shared.setItem('X-NINJA-TOKEN', 'token-b');

    refreshState.companyUsers = [
      companyUser('a', 'token-a'),
      companyUser('b', 'token-b'),
    ];

    await refresh();

    expect(shared.getItem('X-NINJA-TOKEN')).toBe('token-b');
  });

  test("a pinned tab takes its company's rotated token, alone", async () => {
    tab.setItem('X-NINJA-TOKEN', 'token-b');
    tab.setItem('X-CURRENT-INDEX', '1');

    refreshState.companyUsers = [
      companyUser('a', 'token-a'),
      companyUser('b', 'token-b2'),
    ];

    await refresh();

    expect(tab.getItem('X-NINJA-TOKEN')).toBe('token-b2');
    expect(shared.getItem('X-NINJA-TOKEN')).toBe('token-a');
  });

  test('a ?company= link pins the tab with the current token', async () => {
    // The shared token was rotated too; the other tabs pick that up on their
    // own next load.
    refreshState.searchParams = new URLSearchParams('company=b');
    refreshState.companyUsers = [
      companyUser('a', 'token-a2'),
      companyUser('b', 'token-b2'),
    ];

    await refresh();

    expect(tab.getItem('X-NINJA-TOKEN')).toBe('token-b2');
    expect(tab.getItem('X-CURRENT-INDEX')).toBe('1');
    expect(shared.getItem('X-NINJA-TOKEN')).toBe('token-a');
  });

  test('a stored index past the listed companies keeps its token', async () => {
    // /refresh pages at 20 companies, so the token may belong to one it left
    // out rather than one it rotated.
    shared.setItem('X-CURRENT-INDEX', '5');

    refreshState.companyUsers = [
      companyUser('a', 'token-a2'),
      companyUser('b', 'token-b'),
    ];

    await refresh();

    expect(shared.getItem('X-NINJA-TOKEN')).toBe('token-a');
  });

  test('without a stored index, a rotated token is still replaced', async () => {
    // Signing in clears the index, leaving the default company.
    shared.removeItem('X-CURRENT-INDEX');

    refreshState.companyUsers = [
      companyUser('a', 'token-a2'),
      companyUser('b', 'token-b'),
    ];

    await refresh();

    expect(shared.getItem('X-NINJA-TOKEN')).toBe('token-a2');
  });
});
