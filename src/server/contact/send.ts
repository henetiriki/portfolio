import { checkBotId } from 'botid/server';
import nodeMailer from 'nodemailer';
import type { SendResponse } from '@server/contact';
import type { Transporter } from 'nodemailer';
import type Mail from 'nodemailer/lib/mailer';

const GMAIL_APP_EMAIL = process.env.GMAIL_APP_EMAIL;
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD;
const GMAIL_SENDER_EMAIL = process.env.GMAIL_SENDER_EMAIL;

export const createContactTransporter = () =>
  nodeMailer.createTransport(
    {
      auth: {
        pass: GMAIL_APP_PASSWORD,
        user: GMAIL_APP_EMAIL,
      },
      service: 'gmail',
    },
    {
      from: GMAIL_SENDER_EMAIL,
    }
  );

export const isContactRequestAllowed = async () => !(await checkBotId()).isBot;

export const send = async (
  transporter: Pick<Transporter, 'sendMail'>,
  message: Mail.Options
): Promise<SendResponse> =>
  new Promise((resolve, reject) => {
    transporter.sendMail(message, (error: Error | null) => {
      if (error) {
        reject({ error, success: false });

        return;
      }
      resolve({ success: true });
    });
  });
