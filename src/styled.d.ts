/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import 'styled-components';

declare module 'styled-components' {
  // Themes are ad-hoc objects passed per component via theme={{ ... }}.
  export interface DefaultTheme {
    [key: string]: string | number | undefined;
  }
}
