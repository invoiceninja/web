/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2026. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

// The file name in a Content-Disposition header (RFC 6266). The server is
// Laravel on Symfony, which writes `filename*` with a lower-case `utf-8''` and
// quotes a name holding a space or a `;`, so the quoted form is read as a
// quoted string rather than up to the first `;`.
export function extractFilenameFromContentDisposition(
  contentDisposition?: string | string[] | null
) {
  const header = Array.isArray(contentDisposition)
    ? contentDisposition[0]
    : contentDisposition;

  if (!header) {
    return '';
  }

  const encodedFilename = header.match(
    /filename\*\s*=\s*"?[^'";]*'[^']*'([^";\s]+)/i
  );

  if (encodedFilename?.[1]) {
    try {
      const decoded = decodeURIComponent(encodedFilename[1]).trim();

      if (decoded) {
        return decoded;
      }
    } catch {
      // A malformed escape falls back to the plain name.
    }
  }

  const quotedFilename = header.match(
    /(?:^|;)\s*filename\s*=\s*"((?:[^"\\]|\\.)*)"/i
  );

  if (quotedFilename) {
    return quotedFilename[1].replace(/\\(.)/g, '$1').trim();
  }

  const filename = header.match(/(?:^|;)\s*filename\s*=\s*([^;]*)/i);

  return filename?.[1]?.trim() || '';
}

export function extractFilenameFromHeaders(
  headers?: Record<string, unknown> | null
) {
  const contentDisposition =
    headers?.['content-disposition'] || headers?.['Content-Disposition'];

  if (
    typeof contentDisposition === 'string' ||
    Array.isArray(contentDisposition)
  ) {
    return extractFilenameFromContentDisposition(contentDisposition);
  }

  return '';
}

export function downloadBlob(
  data: BlobPart,
  filename: string,
  contentType = 'application/octet-stream'
) {
  const blob = new Blob([data], { type: contentType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.download = filename;
  link.href = url;
  link.target = '_blank';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

export function downloadUrl(url: string) {
  const link = document.createElement('a');

  link.href = url;
  link.target = '_blank';
  link.rel = 'noreferrer';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
