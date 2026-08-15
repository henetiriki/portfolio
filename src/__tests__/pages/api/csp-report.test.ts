import { Readable } from 'stream';
import handler from '@pages/api/csp-report';
import { emailViolations } from '@server/csp-mail';
import { createMockApiContext } from '@utils/test/apiContext';
import type { NextApiRequest } from 'next';

jest.mock('../../../server/csp-mail', () => ({ emailViolations: jest.fn() }));

const postingBody = (raw: string) => {
  const context = createMockApiContext(undefined, { method: 'POST' });
  const stream = Readable.from([Buffer.from(raw)]);

  return {
    ...context,
    req: Object.assign(stream, { method: 'POST' }) as unknown as NextApiRequest,
  };
};

const reportFor = (blockedUri: string, sourceFile?: string) =>
  JSON.stringify({
    'csp-report': {
      'blocked-uri': blockedUri,
      'document-uri': 'https://www.ouwl.house/travel',
      'effective-directive': 'script-src-elem',
      'source-file': sourceFile,
    },
  });

describe('csp-report API handler', () => {
  it('logs a reportable violation and responds 204', async () => {
    const { end, req, res, setHeader, status } = postingBody(
      reportFor('https://evil.example/x.js')
    );

    await handler(req, res);

    expect(setHeader).toHaveBeenCalledWith(
      'Cache-Control',
      'private, no-store'
    );
    expect(console.warn).toHaveBeenCalledWith(
      'CSP violation: script-src-elem blocked https://evil.example/x.js on https://www.ouwl.house/travel'
    );
    expect(emailViolations).toHaveBeenCalledWith([
      {
        blockedUri: 'https://evil.example/x.js',
        directive: 'script-src-elem',
        documentUri: 'https://www.ouwl.house/travel',
        sourceFile: undefined,
      },
    ]);
    expect(status).toHaveBeenCalledWith(204);
    expect(end).toHaveBeenCalled();
  });

  it('responds 204 without logging an extension-injected violation', async () => {
    const { req, res, status } = postingBody(
      reportFor('chrome-extension://abc/inject.js')
    );

    await handler(req, res);

    expect(console.warn).not.toHaveBeenCalled();
    expect(emailViolations).toHaveBeenCalledWith([]);
    expect(status).toHaveBeenCalledWith(204);
  });

  it('responds 204 without logging when the body is not a report', async () => {
    const { req, res, status } = postingBody('not json at all');

    await handler(req, res);

    expect(console.warn).not.toHaveBeenCalled();
    expect(status).toHaveBeenCalledWith(204);
  });

  it('responds 413 when the body is too large', async () => {
    const { req, res, status } = postingBody('x'.repeat(16 * 1024 + 1));

    await handler(req, res);

    expect(console.warn).not.toHaveBeenCalled();
    expect(status).toHaveBeenCalledWith(413);
  });

  it('rejects non-POST methods', async () => {
    const { req, res, setHeader, status } = createMockApiContext(undefined, {
      method: 'GET',
    });

    await handler(req, res);

    expect(setHeader).toHaveBeenCalledWith('Allow', 'POST');
    expect(status).toHaveBeenCalledWith(405);
  });
});
