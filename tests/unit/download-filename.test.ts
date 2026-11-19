import { describe, expect, it } from 'vitest';
import {
  extractFilenameFromContentDisposition,
  extractFilenameFromHeaders,
} from '../../src/common/helpers/download';

// The header shapes Symfony's HeaderUtils::makeDisposition writes for the
// server's streamDownload responses.
describe('extractFilenameFromContentDisposition', () => {
  it('reads an unquoted name', () => {
    expect(
      extractFilenameFromContentDisposition(
        'attachment; filename=Invoice_0042.pdf'
      )
    ).toBe('Invoice_0042.pdf');
  });

  it('reads a quoted name with spaces without keeping the quotes', () => {
    expect(
      extractFilenameFromContentDisposition(
        'attachment; filename="Acme Ltd - Invoice - 0042.pdf"'
      )
    ).toBe('Acme Ltd - Invoice - 0042.pdf');
  });

  it('keeps a semicolon and an apostrophe inside a quoted name', () => {
    expect(
      extractFilenameFromContentDisposition(
        `attachment; filename="O'Neil; Invoice_1.pdf"`
      )
    ).toBe(`O'Neil; Invoice_1.pdf`);
  });

  it('unescapes a quote inside a quoted name', () => {
    expect(
      extractFilenameFromContentDisposition(
        'attachment; filename="A \\"B\\" C.pdf"'
      )
    ).toBe('A "B" C.pdf');
  });

  it('prefers filename*, whatever the case of its charset', () => {
    expect(
      extractFilenameFromContentDisposition(
        "attachment; filename=Rechnung_M_ller.pdf; filename*=utf-8''Rechnung_M%C3%BCller.pdf"
      )
    ).toBe('Rechnung_Müller.pdf');

    expect(
      extractFilenameFromContentDisposition(
        "attachment; filename*=UTF-8'de'Rechnung_M%C3%BCller.pdf"
      )
    ).toBe('Rechnung_Müller.pdf');
  });

  it('falls back to filename when filename* has a malformed escape', () => {
    expect(
      extractFilenameFromContentDisposition(
        "attachment; filename=fallback.pdf; filename*=utf-8''a%FF.pdf"
      )
    ).toBe('fallback.pdf');
  });

  it('returns an empty string when there is no name', () => {
    expect(extractFilenameFromContentDisposition(null)).toBe('');
    expect(extractFilenameFromContentDisposition('inline')).toBe('');
  });
});

describe('extractFilenameFromHeaders', () => {
  it('reads the lower-case header axios gives', () => {
    expect(
      extractFilenameFromHeaders({
        'content-disposition': 'attachment; filename="Invoice 0042.pdf"',
      })
    ).toBe('Invoice 0042.pdf');
  });
});
