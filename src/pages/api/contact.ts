import {
  buildMessage,
  buildMessageCopy,
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

  const errors = validate(submission);

  if (errors.length) {
    return res.status(400).json({ data: errors });
  }

  try {
    await send(buildMessage(submission));
    await send(buildMessageCopy(submission));
  } catch {
    console.error('Contact email delivery failed');

    return respondWithError(res, 500);
  }

  res.status(200).json({ data: 'Sent successfully' });
};

export default handler;
