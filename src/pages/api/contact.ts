import {
  buildMessage,
  buildMessageCopy,
  createContactTransporter,
  isContactRequestAllowed,
  isWithinContactFieldLimits,
  send,
  validate,
} from '@server/contact';
import type {
  ContactApiErrorCode,
  ContactApiResponse,
  Submission,
} from '@server/contact';
import type { NextApiRequest, NextApiResponse } from 'next';

const isSubmission = (value: unknown): value is Submission => {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return false;
  }

  const { email, heuning, message, name } = value as Record<string, unknown>;

  return (
    typeof email === 'string' &&
    (typeof heuning === 'string' || typeof heuning === 'undefined') &&
    typeof message === 'string' &&
    typeof name === 'string'
  );
};

const respondWithError = (
  res: NextApiResponse<ContactApiResponse>,
  status: number,
  code: ContactApiErrorCode = 'e_generic'
) => res.status(status).json({ data: [code] });

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse<ContactApiResponse>
) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');

    return respondWithError(res, 405);
  }

  if (!isSubmission(req.body)) {
    return respondWithError(res, 400);
  }

  const submission = req.body;

  if (!isWithinContactFieldLimits(submission)) {
    return respondWithError(res, 400);
  }

  const errors = validate(submission);

  if (errors.length) {
    return res.status(400).json({ data: errors });
  }

  let requestAllowed: boolean;

  try {
    requestAllowed = await isContactRequestAllowed();
  } catch {
    console.error('Contact request verification failed');

    return respondWithError(res, 500);
  }

  if (!requestAllowed) {
    console.warn('Contact message rejected');

    return respondWithError(res, 400);
  }

  let transporter: ReturnType<typeof createContactTransporter>;

  try {
    transporter = createContactTransporter();
    await send(transporter, buildMessage(submission));
  } catch {
    console.error('Contact owner email delivery failed');

    return respondWithError(res, 500);
  }

  try {
    await send(transporter, buildMessageCopy(submission));
  } catch {
    console.warn('Contact confirmation email delivery failed');
  }

  res.status(200).json({ data: 'Sent successfully' });
};

export default handler;
