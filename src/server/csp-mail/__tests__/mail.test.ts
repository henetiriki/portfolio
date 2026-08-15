import type { CspViolation } from '@server/csp';
import type Mail from 'nodemailer/lib/mailer';

const mockCreateContactTransporter = jest.fn();
const mockSend = jest.fn();

// Relative, because the alias is resolved by the SWC transform rather than by
// Jest's resolver, so `jest.mock` never sees it — as in the contact tests. The
// wrappers keep one stable pair of mocks across the `jest.resetModules()` each
// test needs, which would otherwise re-run this factory.
jest.mock('../../contact/send', () => ({
  createContactTransporter: (...args: unknown[]) =>
    mockCreateContactTransporter(...args),
  send: (...args: unknown[]) => mockSend(...args),
}));

const transporter = { sendMail: jest.fn() };

const violation: CspViolation = {
  blockedUri: 'https://evil.example/x.js',
  directive: 'script-src-elem',
  documentUri: 'https://www.ouwl.house/travel',
};

// The module keeps its dedup set and its per-instance counter at module scope,
// so every test needs a fresh copy — and the environment is read at import
// time, which is why it is set before the import rather than inside the test.
const loadEmailViolations = async (
  overrides: Record<string, string | undefined> = {}
) => {
  const original = process.env;

  process.env = {
    ...original,
    CSP_VIOLATION_EMAILS: 'true',
    GMAIL_SENDER_EMAIL: 'owner@example.test',
    ...overrides,
  } as NodeJS.ProcessEnv;

  jest.resetModules();

  const { emailViolations } = await import('@server/csp-mail/mail');

  process.env = original;

  return emailViolations;
};

const messageFrom = () => mockSend.mock.calls[0][1] as Mail.Options;

beforeEach(() => {
  mockCreateContactTransporter.mockReturnValue(transporter);
  mockSend.mockResolvedValue({ success: true });
});

describe('emailViolations', () => {
  it('sends one email to the +csp alias with the fixed subject prefix', async () => {
    const emailViolations = await loadEmailViolations();

    await emailViolations([violation]);

    expect(mockSend).toHaveBeenCalledTimes(1);
    expect(mockSend).toHaveBeenCalledWith(transporter, expect.any(Object));
    expect(messageFrom()).toEqual({
      subject: '[CSP] script-src-elem on https://www.ouwl.house/travel',
      text: 'script-src-elem blocked https://evil.example/x.js\n  page:   https://www.ouwl.house/travel',
      to: 'owner+csp@example.test',
    });
  });

  // A `report-uri` post carries exactly one violation, so a longer list is not
  // something this endpoint can produce today. What is pinned here is the
  // documented degradation if one ever arrived — see docs/security.md.
  it('names the first violation and carries them all when given several', async () => {
    const emailViolations = await loadEmailViolations();

    await emailViolations([
      violation,
      { ...violation, blockedUri: 'https://evil.example/y.js' },
    ]);

    expect(mockSend).toHaveBeenCalledTimes(1);
    expect(messageFrom().subject).toBe(
      '[CSP] script-src-elem on https://www.ouwl.house/travel'
    );
    expect(messageFrom().text).toContain('https://evil.example/x.js');
    expect(messageFrom().text).toContain('https://evil.example/y.js');
  });

  it('names the source file when the browser reports one', async () => {
    const emailViolations = await loadEmailViolations();

    await emailViolations([
      { ...violation, sourceFile: 'https://www.ouwl.house/_next/chunk.js' },
    ]);

    expect(messageFrom().text).toContain(
      '  source: https://www.ouwl.house/_next/chunk.js'
    );
  });

  it('collapses newlines so a report cannot inject a mail header', async () => {
    const emailViolations = await loadEmailViolations();

    await emailViolations([
      {
        ...violation,
        directive: 'script-src\r\nBcc: victim@example.test',
      },
    ]);

    expect(messageFrom().subject).toBe(
      '[CSP] script-src Bcc: victim@example.test on https://www.ouwl.house/travel'
    );
  });

  it('sends nothing for a repeat of a violation already emailed', async () => {
    const emailViolations = await loadEmailViolations();

    await emailViolations([violation]);
    await emailViolations([violation]);

    expect(mockSend).toHaveBeenCalledTimes(1);
  });

  it('still sends when a later report differs from the ones already seen', async () => {
    const emailViolations = await loadEmailViolations();

    await emailViolations([violation]);
    await emailViolations([{ ...violation, directive: 'connect-src' }]);

    expect(mockSend).toHaveBeenCalledTimes(2);
  });

  it('sends nothing for an empty report', async () => {
    const emailViolations = await loadEmailViolations();

    await emailViolations([]);

    expect(mockSend).not.toHaveBeenCalled();
  });

  it.each([
    ['the toggle is unset', { CSP_VIOLATION_EMAILS: undefined }],
    ['the toggle is not exactly true', { CSP_VIOLATION_EMAILS: 'yes' }],
    ['there is no sender address', { GMAIL_SENDER_EMAIL: undefined }],
  ])('sends nothing when %s', async (_label, overrides) => {
    const emailViolations = await loadEmailViolations(overrides);

    await emailViolations([violation]);

    expect(mockSend).not.toHaveBeenCalled();
  });

  it('stops at the per-instance cap and says so once', async () => {
    const emailViolations = await loadEmailViolations();

    for (let index = 0; index < 25; index += 1) {
      await emailViolations([
        { ...violation, blockedUri: `https://evil.example/${index}.js` },
      ]);
    }

    expect(mockSend).toHaveBeenCalledTimes(20);
    expect(console.warn).toHaveBeenCalledTimes(1);
    expect(console.warn).toHaveBeenCalledWith(
      'CSP violation emails: per-instance cap of 20 reached; violations are logged only from here'
    );
  });

  it('swallows a delivery failure rather than failing the endpoint', async () => {
    const emailViolations = await loadEmailViolations();
    const failure = { error: new Error('smtp'), success: false };

    mockSend.mockRejectedValue(failure);

    await expect(emailViolations([violation])).resolves.toBeUndefined();
    expect(console.warn).toHaveBeenCalledWith(
      'CSP violation email delivery failed',
      failure
    );
  });

  // The deployed GMAIL_SENDER_EMAIL is the display-name form, not a bare
  // address, so the tag has to land inside the angle brackets.
  it('tags the address when the sender carries a display name', async () => {
    const emailViolations = await loadEmailViolations({
      GMAIL_SENDER_EMAIL: 'Louw Swart <owner@example.test>',
    });

    await emailViolations([violation]);

    expect(messageFrom().to).toBe('Louw Swart <owner+csp@example.test>');
  });
});
