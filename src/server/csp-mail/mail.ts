import { createContactTransporter, send } from '@server/contact/send';
import type { CspViolation } from '@server/csp';
import type Mail from 'nodemailer/lib/mailer';

// A temporary diagnostic for the Report-Only observation window, written to be
// deleted. See docs/decisions.md#d-260815b.
const CSP_VIOLATION_EMAILS = process.env.CSP_VIOLATION_EMAILS;
const GMAIL_SENDER_EMAIL = process.env.GMAIL_SENDER_EMAIL;

const MAX_EMAILS_PER_INSTANCE = 20;
const MAX_FIELD_LENGTH = 200;
const RECIPIENT_TAG = 'csp';
const SUBJECT_PREFIX = '[CSP]';

const seen = new Set<string>();
let emailsSent = 0;

// Every field here is attacker-controlled, and one of them ends up in a header.
// See docs/security.md#emailing-violations-temporary.
const singleLine = (value: string) =>
  value.replace(/\s+/g, ' ').trim().slice(0, MAX_FIELD_LENGTH);

const keyOf = ({ blockedUri, directive, documentUri }: CspViolation) =>
  `${directive}|${blockedUri}|${documentUri}`;

const format = ({
  blockedUri,
  directive,
  documentUri,
  sourceFile,
}: CspViolation) =>
  [
    `${singleLine(directive)} blocked ${singleLine(blockedUri)}`,
    `  page:   ${singleLine(documentUri)}`,
    ...(sourceFile ? [`  source: ${singleLine(sourceFile)}`] : []),
  ].join('\n');

const buildMessage = (
  violations: CspViolation[],
  sender: string
): Mail.Options => {
  const [first] = violations;

  return {
    subject: `${SUBJECT_PREFIX} ${singleLine(first.directive)} on ${singleLine(first.documentUri)}`,
    text: violations.map(format).join('\n\n'),
    to: sender.replace('@', `+${RECIPIENT_TAG}@`),
  };
};

export const emailViolations = async (
  violations: CspViolation[]
): Promise<void> => {
  if (CSP_VIOLATION_EMAILS !== 'true' || !GMAIL_SENDER_EMAIL) {
    return;
  }

  if (emailsSent >= MAX_EMAILS_PER_INSTANCE) {
    return;
  }

  const unseen = violations.filter(violation => !seen.has(keyOf(violation)));

  if (!unseen.length) {
    return;
  }

  unseen.forEach(violation => seen.add(keyOf(violation)));
  emailsSent += 1;

  if (emailsSent === MAX_EMAILS_PER_INSTANCE) {
    console.warn(
      `CSP violation emails: per-instance cap of ${MAX_EMAILS_PER_INSTANCE} reached; violations are logged only from here`
    );
  }

  try {
    await send(
      createContactTransporter(),
      buildMessage(unseen, GMAIL_SENDER_EMAIL)
    );
  } catch (failure) {
    console.warn('CSP violation email delivery failed', failure);
  }
};
