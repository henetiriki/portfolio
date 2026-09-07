import { readFileSync } from 'fs';
import path from 'path';
import { CONTACT_FIELD_LIMITS } from '@utils/contactLimits';
import type { ErrorType, Submission } from '@server/contact';
import type Mail from 'nodemailer/lib/mailer';

const CUSTOM_APP_DOMAIN = process.env.CUSTOM_APP_DOMAIN;
const GMAIL_SENDER_EMAIL = process.env.GMAIL_SENDER_EMAIL;

const DISALLOWED_CHARS = /[<>^|%()&+]/;
// Quantifier-free on purpose: `hasUrl` only ever reads a boolean, so a scheme
// plus the first character of a host is the whole question. Parsing the rest
// bought nine unread capture groups and a star-height-2 pattern on public
// input — docs/decisions/2026-09-07-replace-the-url-parser-with-a-url-detector.md.
const URL_REGEX = /(?:https?|ftp):\/\/[^\s/]/i;
const EMAIL_REGEX = /^[a-z0-9_.-]+@[\da-z.-]+\.[a-z.]{2,6}$/i;

const SUBJECT = `Message from {0} | ${CUSTOM_APP_DOMAIN}`;
const SUBJECT_COPY = `Thanks for your message | ${CUSTOM_APP_DOMAIN}`;
const CONTENT: Buffer = readFileSync(
  path.join(
    process.cwd(),
    'src',
    'server',
    'contact',
    'templates',
    'email-template.html'
  )
);
const CONTENT_COPY: Buffer = readFileSync(
  path.join(
    process.cwd(),
    'src',
    'server',
    'contact',
    'templates',
    'email-copy-template.html'
  )
);

const formatValue = (value: string, args: string[]) =>
  value.replace(
    /{(\d+)}/g,
    (match, number) => args.at(Number(number)) ?? match
  );

const escapeHtml = (value: string) =>
  value.replace(/[&<>'"]/g, character => {
    switch (character) {
      case '&':
        return '&amp;';
      case '<':
        return '&lt;';
      case '>':
        return '&gt;';
      case '"':
        return '&quot;';
      default:
        return '&#39;';
    }
  });

const containsDisallowedChars = (value: string) => DISALLOWED_CHARS.test(value);

const containsUrl = (value: string) => URL_REGEX.test(value);

const isValidEmail = (email: string) =>
  !/[\r\n]/.test(email) && EMAIL_REGEX.test(email);

export const isWithinContactFieldLimits = ({
  email,
  message,
  name,
}: Submission) =>
  email.length <= CONTACT_FIELD_LIMITS.email &&
  message.length <= CONTACT_FIELD_LIMITS.message &&
  name.length <= CONTACT_FIELD_LIMITS.name;

export const validate = ({
  email,
  heuning,
  message,
  name,
}: Submission): ErrorType[] => {
  const errors: ErrorType[] = [];
  let hasUrl = false;

  if (heuning) {
    errors.push('e_spam');

    return errors;
  }

  if (!name.trim()) {
    errors.push('e_name_required');
  } else if (containsDisallowedChars(name) || /[\r\n]/.test(name)) {
    errors.push('e_name_disallowed_chars');
  } else if (containsUrl(name)) {
    hasUrl = true;
  }
  if (!email) {
    errors.push('e_email_required');
  } else if (!isValidEmail(email)) {
    errors.push('e_email_invalid');
  }
  if (!message.trim()) {
    errors.push('e_message_required');
  } else if (containsDisallowedChars(message)) {
    errors.push('e_message_disallowed_chars');
  } else if (containsUrl(message)) {
    hasUrl = true;
  }

  if (hasUrl) {
    errors.push('e_contains_url');
  }

  return errors;
};

export const buildMessage = ({
  email,
  message,
  name,
}: Submission): Mail.Options => ({
  html: formatValue(`${CONTENT}`, [
    escapeHtml(name),
    escapeHtml(email),
    escapeHtml(message).replace(/\r\n?|\n/g, '<br>'),
  ]), // html body
  replyTo: { address: email, name }, // sender address
  subject: formatValue(SUBJECT, [name]), // Subject line
  to: GMAIL_SENDER_EMAIL, // list of receivers
});

export const buildMessageCopy = ({
  email,
  name,
}: Submission): Mail.Options => ({
  html: formatValue(`${CONTENT_COPY}`, [escapeHtml(name)]), // html body
  subject: `${SUBJECT_COPY}`, // Subject line
  to: { address: email, name }, // list of receivers
});
