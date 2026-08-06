import { checkBotId } from 'botid/server';
import nodeMailer from 'nodemailer';
import { send } from '@server/contact/send';
import type Mail from 'nodemailer/lib/mailer';

jest.mock('botid/server', () => ({ checkBotId: jest.fn() }));
jest.mock('nodemailer', () => ({
  __esModule: true,
  default: { createTransport: jest.fn() },
}));

const message: Mail.Options = { subject: 'Hello', to: 'owner@example.test' };

describe('send', () => {
  it('resolves once the message is sent successfully', async () => {
    const sendMail = jest.fn((_message, callback) =>
      callback(null, { response: 'accepted' })
    );

    (checkBotId as jest.Mock).mockResolvedValue({ isBot: false });
    (nodeMailer.createTransport as jest.Mock).mockReturnValue({ sendMail });

    await expect(send(message)).resolves.toEqual({ success: true });
    expect(sendMail).toHaveBeenCalledWith(message, expect.any(Function));
  });

  it('rejects without sending mail when the request is classified as a bot', async () => {
    const createTransport = nodeMailer.createTransport as jest.Mock;

    (checkBotId as jest.Mock).mockResolvedValue({ isBot: true });

    await expect(send(message)).rejects.toEqual({
      error: expect.any(Error),
      success: false,
    });
    expect(createTransport).not.toHaveBeenCalled();
  });

  it('rejects with the send error and does not also resolve', async () => {
    const sendError = new Error('smtp failure');
    const sendMail = jest.fn((_message, callback) =>
      callback(sendError, undefined)
    );

    (checkBotId as jest.Mock).mockResolvedValue({ isBot: false });
    (nodeMailer.createTransport as jest.Mock).mockReturnValue({ sendMail });

    await expect(send(message)).rejects.toEqual({
      error: sendError,
      success: false,
    });
  });
});
