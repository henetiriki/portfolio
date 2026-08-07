import {
  buildMessage,
  buildMessageCopy,
  validate,
} from '@server/contact/helpers';
import type { Submission } from '@pages/api/types';

const validSubmission: Submission = {
  email: 'jane@example.com',
  message: 'Hello there!',
  name: 'Jane',
};

describe('validate', () => {
  it('returns no errors for a valid submission', () => {
    expect(validate(validSubmission)).toEqual([]);
  });

  it('returns only e_spam when the honeypot field is filled in, ignoring other issues', () => {
    expect(
      validate({ ...validSubmission, email: '', heuning: 'robots are here' })
    ).toEqual(['e_spam']);
  });

  it('requires a name', () => {
    expect(validate({ ...validSubmission, name: '' })).toEqual([
      'e_name_required',
    ]);
  });

  it('rejects a name with disallowed characters', () => {
    expect(validate({ ...validSubmission, name: 'Ja<ne>' })).toEqual([
      'e_name_disallowed_chars',
    ]);
  });

  it('flags a name containing a URL', () => {
    expect(
      validate({ ...validSubmission, name: 'Jane https://spam.example' })
    ).toEqual(['e_contains_url']);
  });

  it('requires an email', () => {
    expect(validate({ ...validSubmission, email: '' })).toEqual([
      'e_email_required',
    ]);
  });

  it('rejects an improperly formatted email', () => {
    expect(validate({ ...validSubmission, email: 'not-an-email' })).toEqual([
      'e_email_invalid',
    ]);
  });

  it('accepts an email with uppercase characters', () => {
    expect(validate({ ...validSubmission, email: 'Jane@Example.com' })).toEqual(
      []
    );
  });

  it('requires a message', () => {
    expect(validate({ ...validSubmission, message: '' })).toEqual([
      'e_message_required',
    ]);
  });

  it('rejects a message with disallowed characters', () => {
    expect(
      validate({ ...validSubmission, message: 'price & terms (negotiable)' })
    ).toEqual(['e_message_disallowed_chars']);
  });

  it('flags a message containing a URL', () => {
    expect(
      validate({ ...validSubmission, message: 'see https://example.com' })
    ).toEqual(['e_contains_url']);
  });

  it('combines multiple errors in field order', () => {
    expect(validate({ email: '', message: '', name: '' })).toEqual([
      'e_name_required',
      'e_email_required',
      'e_message_required',
    ]);
  });
});

describe('buildMessage', () => {
  it('builds the owner-facing email from the submission', () => {
    const mail = buildMessage({
      email: 'jane@example.com',
      message: 'Line one\nLine two',
      name: 'Jane',
    });

    expect(mail.subject).toBe('Message from Jane | example.test');
    expect(mail.to).toBe('owner@example.test');
    expect(mail.replyTo).toBe('Jane <jane@example.com>');
    expect(mail.html).toContain(
      'You have been contacted by Jane (jane@example.com).'
    );
    expect(mail.html).toContain('Line one<br>Line two');
  });
});

describe('buildMessageCopy', () => {
  it('builds the sender-facing confirmation email from the submission', () => {
    const mail = buildMessageCopy({
      email: 'jane@example.com',
      message: 'irrelevant',
      name: 'Jane',
    });

    expect(mail.subject).toBe('Thanks for your message | example.test');
    expect(mail.to).toBe('Jane <jane@example.com>');
    expect(mail.html).toContain('Hi, Jane');
  });

  // formatValue (the internal {n}-placeholder substituter used to build
  // this html) isn't exported, and the real checked-in templates always
  // have exactly as many placeholders as args — so its "no matching arg"
  // fallback can only be exercised indirectly, through the public API,
  // with a fake template that has an extra placeholder.
  it('leaves an extra template placeholder untouched when no matching arg is supplied for it', async () => {
    jest.resetModules();
    jest.doMock('fs', () => ({
      ...jest.requireActual('fs'),
      readFileSync: jest.fn(() => 'Hi, {0} {1}'),
    }));

    const { buildMessageCopy: freshBuildMessageCopy } =
      await import('@server/contact/helpers');

    const mail = freshBuildMessageCopy({
      email: 'jane@example.com',
      message: 'irrelevant',
      name: 'Jane',
    });

    expect(mail.html).toBe('Hi, Jane {1}');
  });
});
