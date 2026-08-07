import {
  buildMessage,
  buildMessageCopy,
  send,
  validate,
} from '@server/contact';
import type { SendResponse, Submission } from '@server/contact';
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
  try {
    await send(buildMessage(submission));
  } catch (rejection: unknown) {
    const { error } = rejection as SendResponse;

    return res.status(500).json({ data: error?.message || 'Unknown error' });
  }

  // send a copy of the message to the sender
  try {
    await send(buildMessageCopy(submission));
  } catch (rejection: unknown) {
    const { error } = rejection as SendResponse;

    return res.status(500).json({ data: error?.message || 'Unknown error' });
  }

  res.status(200).json({ data: 'Sent successfully' });
};

export default handler;
