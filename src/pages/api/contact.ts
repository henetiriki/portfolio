import {
  buildMessage,
  buildMessageCopy,
  send,
  validate,
} from '@server/contact';
import type { Submission } from '@pages/api/types';
import type { NextApiRequest, NextApiResponse } from 'next';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  // Get data submitted in request's body.
  const submission: Submission = req.body;

  console.log('Submission received', { submission });

  const errors: string[] = validate(submission);

  if (errors.length) {
    return res.status(400).json({ data: errors });
  }

  // send the message to the website owner
  const { error, success } = await send(buildMessage(submission));

  if (!success) {
    return res.status(500).json({ data: error?.message || 'Unknown error' });
  }

  // send a copy of the message to the sender
  const { error: ccError, success: ccSuccess } = await send(
    buildMessageCopy(submission)
  );

  if (!ccSuccess) {
    return res.status(500).json({ data: ccError?.message || 'Unknown error' });
  }

  res.status(200).json({ data: 'Sent successfully' });
};

export default handler;
