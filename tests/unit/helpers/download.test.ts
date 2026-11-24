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
import {
  extractFilenameFromContentDisposition,
  extractFilenameFromHeaders,
} from '../../../src/common/helpers/download';

describe('extractFilenameFromContentDisposition', () => {
  test('returns an empty string when the header is missing', () => {
    expect(extractFilenameFromContentDisposition(undefined)).toBe('');
    expect(extractFilenameFromContentDisposition(null)).toBe('');
    expect(extractFilenameFromContentDisposition('')).toBe('');
  });

  test('reads a quoted ASCII filename', () => {
    expect(
      extractFilenameFromContentDisposition(
        'attachment; filename="invoice_0354.pdf"'
      )
    ).toBe('invoice_0354.pdf');
  });

  test('reads an unquoted ASCII filename', () => {
    expect(
      extractFilenameFromContentDisposition(
        'attachment; filename=invoice_0354.pdf'
      )
    ).toBe('invoice_0354.pdf');
  });

  test('prefers the RFC 5987 filename* over the ASCII fallback', () => {
    expect(
      extractFilenameFromContentDisposition(
        "attachment; filename=_0354.pdf; filename*=utf-8''%E8%AB%8B%E6%B1%82%E6%9B%B8_0354.pdf"
      )
    ).toBe('請求書_0354.pdf');
  });

  test('decodes a filename* without an ASCII fallback', () => {
    expect(
      extractFilenameFromContentDisposition(
        "attachment; filename*=UTF-8''%E8%AB%8B%E6%B1%82%E6%9B%B8_0354.pdf"
      )
    ).toBe('請求書_0354.pdf');
  });

  test('decodes a filename* with a language tag', () => {
    expect(
      extractFilenameFromContentDisposition(
        "attachment; filename*=UTF-8'en'%E8%AB%8B%E6%B1%82%E6%9B%B8_0354.pdf"
      )
    ).toBe('請求書_0354.pdf');
  });

  test('returns an empty string for malformed percent-encoding', () => {
    expect(
      extractFilenameFromContentDisposition("attachment; filename*=utf-8''%E8")
    ).toBe('');
  });

  test('accepts an array header and uses the first value', () => {
    expect(
      extractFilenameFromHeaders({
        'content-disposition': [
          "attachment; filename*=utf-8''%E8%AB%8B%E6%B1%82%E6%9B%B8_0354.pdf",
        ],
      })
    ).toBe('請求書_0354.pdf');
  });

  test('reads the header case-insensitively', () => {
    expect(
      extractFilenameFromHeaders({
        'Content-Disposition': 'attachment; filename=invoice.pdf',
      })
    ).toBe('invoice.pdf');
  });

  test('returns an empty string for headers without a filename', () => {
    expect(extractFilenameFromContentDisposition('attachment')).toBe('');
  });
});
