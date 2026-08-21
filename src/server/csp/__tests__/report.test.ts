import { Readable } from 'stream';
import {
  isReportable,
  logViolation,
  parseViolations,
  readReportBody,
} from '@server/csp';
import type { NextApiRequest } from 'next';

const asRequest = (chunks: string[]) =>
  Readable.from(
    chunks.map(chunk => Buffer.from(chunk))
  ) as unknown as NextApiRequest;

const reportUriBody = (report: Record<string, unknown>) =>
  JSON.stringify({ 'csp-report': report });

describe('readReportBody', () => {
  it('concatenates the streamed chunks into a single string', async () => {
    expect(await readReportBody(asRequest(['{"a":', '1}']))).toBe('{"a":1}');
  });

  it('rejects a body larger than the accepted size', async () => {
    const oversized = 'x'.repeat(16 * 1024 + 1);

    await expect(readReportBody(asRequest([oversized]))).rejects.toThrow(
      'CSP report body exceeds the accepted size'
    );
  });
});

describe('parseViolations', () => {
  it('reads a report-uri payload', () => {
    const raw = reportUriBody({
      'blocked-uri': 'https://evil.example/x.js',
      'document-uri': 'https://www.ouwl.house/travel',
      'effective-directive': 'script-src',
      'source-file': 'https://www.ouwl.house/travel',
      'violated-directive': 'script-src-elem',
    });

    expect(parseViolations(raw)).toEqual([
      {
        blockedUri: 'https://evil.example/x.js',
        directive: 'script-src',
        documentUri: 'https://www.ouwl.house/travel',
        sourceFile: 'https://www.ouwl.house/travel',
      },
    ]);
  });

  it('falls back to violated-directive when effective-directive is absent', () => {
    const raw = reportUriBody({
      'blocked-uri': 'inline',
      'document-uri': 'https://www.ouwl.house/',
      'violated-directive': 'style-src-attr',
    });

    expect(parseViolations(raw)).toEqual([
      {
        blockedUri: 'inline',
        directive: 'style-src-attr',
        documentUri: 'https://www.ouwl.house/',
        sourceFile: undefined,
      },
    ]);
  });

  it('marks missing report-uri fields as unknown', () => {
    expect(parseViolations(reportUriBody({}))).toEqual([
      {
        blockedUri: 'unknown',
        directive: 'unknown',
        documentUri: 'unknown',
        sourceFile: undefined,
      },
    ]);
  });

  it('strips control characters a forged report could use to inject log lines', () => {
    const raw = reportUriBody({
      'blocked-uri': 'https://evil.example/x.js\n[FAKE] admin session opened',
      'document-uri': 'https://www.ouwl.house/travel',
      'effective-directive': 'script-src',
    });

    expect(parseViolations(raw)).toEqual([
      {
        blockedUri: 'https://evil.example/x.js[FAKE] admin session opened',
        directive: 'script-src',
        documentUri: 'https://www.ouwl.house/travel',
        sourceFile: undefined,
      },
    ]);
  });

  it('caps a field at the accepted length', () => {
    const raw = reportUriBody({
      'blocked-uri': 'x'.repeat(300),
      'document-uri': 'https://www.ouwl.house/travel',
      'effective-directive': 'script-src',
    });

    expect(parseViolations(raw)[0]?.blockedUri).toHaveLength(256);
  });

  it('marks a field as unknown when sanitizing leaves it empty', () => {
    const raw = reportUriBody({
      'blocked-uri': '\n\r\t',
      'document-uri': 'https://www.ouwl.house/travel',
      'effective-directive': 'script-src',
    });

    expect(parseViolations(raw)[0]?.blockedUri).toBe('unknown');
  });

  it.each([
    ['malformed JSON', 'not json at all'],
    ['a payload without a csp-report key', '{"other":true}'],
    ['a non-object payload', '"a string"'],
    ['a report-to batch, which is not the shape we ask for', '[{"type":"x"}]'],
  ])('returns nothing for %s', (_label, raw) => {
    expect(parseViolations(raw)).toEqual([]);
  });
});

describe('isReportable', () => {
  const violation = {
    blockedUri: 'https://evil.example/x.js',
    directive: 'script-src',
    documentUri: 'https://www.ouwl.house/',
  };

  it('keeps a violation the site could actually act on', () => {
    expect(isReportable(violation)).toBe(true);
  });

  it.each([
    'chrome-extension://abc/inject.js',
    'moz-extension://abc/inject.js',
    'safari-extension://abc/inject.js',
    'safari-web-extension://abc/inject.js',
  ])('drops a violation blocked on %s', blockedUri => {
    expect(isReportable({ ...violation, blockedUri })).toBe(false);
  });

  it('drops a violation whose source file is an extension', () => {
    expect(
      isReportable({
        ...violation,
        blockedUri: 'inline',
        sourceFile: 'chrome-extension://abc/inject.js',
      })
    ).toBe(false);
  });
});

describe('logViolation', () => {
  it('logs the violation as a single structured line', () => {
    logViolation({
      blockedUri: 'https://evil.example/x.js',
      directive: 'script-src',
      documentUri: 'https://www.ouwl.house/travel',
    });

    expect(console.warn).toHaveBeenCalledWith(
      'CSP violation: ' +
        JSON.stringify({
          blockedUri: 'https://evil.example/x.js',
          directive: 'script-src',
          documentUri: 'https://www.ouwl.house/travel',
        })
    );
  });

  it('includes the source file when the browser reports one', () => {
    logViolation({
      blockedUri: 'inline',
      directive: 'style-src-attr',
      documentUri: 'https://www.ouwl.house/',
      sourceFile: 'https://www.ouwl.house/_next/static/chunk.js',
    });

    expect(console.warn).toHaveBeenCalledWith(
      'CSP violation: ' +
        JSON.stringify({
          blockedUri: 'inline',
          directive: 'style-src-attr',
          documentUri: 'https://www.ouwl.house/',
          sourceFile: 'https://www.ouwl.house/_next/static/chunk.js',
        })
    );
  });
});
