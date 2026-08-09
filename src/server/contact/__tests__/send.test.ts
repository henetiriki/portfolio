import { checkBotId } from 'botid/server';
import nodeMailer from 'nodemailer';
import {
  createContactTransporter,
  isContactRequestAllowed,
  send,
} from '@server/contact/send';
import type { Transporter } from 'nodemailer';
import type Mail from 'nodemailer/lib/mailer';

jest.mock('botid/server', () => ({ checkBotId: jest.fn() }));
jest.mock('nodemailer', () => ({
  __esModule: true,
  default: { createTransport: jest.fn() },
}));

const message: Mail.Options = { subject: 'Hello', to: 'owner@example.test' };

describe('createContactTransporter', () => {
  it('creates a Gmail transport with the configured sender', () => {
    const transporter = { sendMail: jest.fn() };

    (nodeMailer.createTransport as jest.Mock).mockReturnValue(transporter);

    expect(createContactTransporter()).toBe(transporter);
    expect(nodeMailer.createTransport).toHaveBeenCalledWith(
      {
        auth: {
          pass: 'test-app-password',
          user: 'owner@example.test',
        },
        service: 'gmail',
      },
      { from: 'owner@example.test' }
    );
  });
});

describe('isContactRequestAllowed', () => {
  it.each([
    [false, true],
    [true, false],
  ])('maps an isBot value of %s to %s', async (isBot, expected) => {
    (checkBotId as jest.Mock).mockResolvedValue({ isBot });

    await expect(isContactRequestAllowed()).resolves.toBe(expected);
    expect(checkBotId).toHaveBeenCalledTimes(1);
  });
});

describe('send', () => {
  it('resolves once the supplied transporter sends successfully', async () => {
    const sendMail = jest.fn((_message, callback) =>
      callback(null, { response: 'accepted' })
    );
    const transporter = { sendMail } as unknown as Pick<
      Transporter,
      'sendMail'
    >;

    await expect(send(transporter, message)).resolves.toEqual({
      success: true,
    });
    expect(sendMail).toHaveBeenCalledWith(message, expect.any(Function));
  });

  it('rejects with the send error and does not also resolve', async () => {
    const sendError = new Error('smtp failure');
    const sendMail = jest.fn((_message, callback) =>
      callback(sendError, undefined)
    );
    const transporter = { sendMail } as unknown as Pick<
      Transporter,
      'sendMail'
    >;

    await expect(send(transporter, message)).rejects.toEqual({
      error: sendError,
      success: false,
    });
  });
});
