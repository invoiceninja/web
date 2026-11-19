/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { atom, useAtomValue } from 'jotai';
import { useReactSettingsField } from './hooks/useReactSettings';

// export const $1 = {
//   name: 'invoiceninja.dark',
//   $0: 'dark',
//   $1: '#182433',
//   $2: '#151f2c',
//   $3: '#ffffff',
//   $4: '#1f2e41',
//   $5: '#1f2e41',
//   $6: '#151f2c',
//   $7: '#151f2c',
//   $8: '#1f2e41',
//   $9: '#ffffff',
// };

export const darkColorScheme = {
  name: 'invoiceninja.dark',
  $0: 'dark',
  $1: '#131316', // Primary surface (cards, inputs, modals, navbar)
  $2: '#202024', // Secondary surface (nested panels)
  $3: 'rgba(255, 255, 255, 0.87)',
  $4: '#34343C', // Primary border / hover
  $5: '#3A3A42', // Secondary border
  $6: '#202024', // Secondary background
  $7: '#26262C', // Primary hover
  $8: '#2F2F36', // Secondary hover / active
  $9: '#ffffff',
  $10: 0.87, // High emphasis text
  $11: 0.6, // Medium emphasis text
  $12: 0.38, // Disabled text
  $13: '#E5E7EB', // Navbar right icon hover
  $14: '#131316', // Navigation bar background color
  $15: '#222226', // Light gray background
  $16: '#A1A1AA', // Dark gray icon
  $17: '#9D9DA8', // Placeholder text, table header text color
  $18: '#E4E4E7', // Button background color
  $19: '#3F3F46', // Light border color
  $20: '#26262C', // Dropdown element hover background color
  $21: '#2E2E34', // Divider color
  $22: '#A1A1AA', // Label color
  $23: '#0B0B0D', // Content background color
  $24: '#2E2E34', // Border color
  $25: '#26262C', // Hover element background color
  $26: '#3F3F46', // Border on dark surfaces (sidebar)
};

export const lightColorScheme = {
  name: 'invoiceninja.light',
  $0: 'light',
  $1: '#ffffff', // Primary background
  $2: '#f7f7f7', // Secondary background
  $3: '#2a303d', // Primary text
  $4: '#f7f7f7', // Primary border
  $5: '#d1d5db', // Secondary border (sidebar)
  $6: '#242930', // Secondary background
  $7: '#f7f7f7', // Primary hover
  $8: '#363D47', // Secondary hover
  $9: '#ffffff', // Accent color text
  $10: 1, // High emphasis text
  $11: 0.8, // Secondary text opacity
  $12: 0.5, // Disabled text opacity
  $13: '#E5E7EB', // Navbar right icon hover
  $14: '#27272A', // Navigation bar background color
  $15: '#E4E4E7', // Light gray background
  $16: '#717179', // Dark gray icon
  $17: '#A1A1AA', // Placeholder text, table header text color
  $18: '#27272A', // Button background color
  $19: '#09090B12', // Light border color
  $20: '#09090B13', // Dropdown element hover background color
  $21: '#09090B1A', // Divider color
  $22: '#717179', // Label color
  $23: '#F4F4F5', // Content background color
  $24: '#09090B26', // Border color
  $25: '#09090B0D', // Hover element background color
  $26: '#3F3F46', // Border on dark surfaces (sidebar)
};

export const systemPrefersDarkAtom = atom(false);

export function useColorScheme() {
  const darkMode = useReactSettingsField('dark_mode');
  const followDeviceTheme = useReactSettingsField('follow_device_theme');
  const systemPrefersDark = useAtomValue(systemPrefersDarkAtom);

  return (followDeviceTheme ? systemPrefersDark : darkMode)
    ? darkColorScheme
    : lightColorScheme;
}
