import { checkBotId } from 'botid/server';
import nodeMailer from 'nodemailer';
import type { SendResponse } from '@server/contact';
import type { SentMessageInfo } from 'nodemailer';
import type Mail from 'nodemailer/lib/mailer';

const GMAIL_APP_EMAIL = process.env.GMAIL_APP_EMAIL;
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD;
const GMAIL_SENDER_EMAIL = process.env.GMAIL_SENDER_EMAIL;

export const send = async (message: Mail.Options): Promise<SendResponse> => {
  const verification = await checkBotId();

  return new Promise((resolve, reject) => {
    if (verification.isBot) {
      console.error(
        `Message not sent: isBot ${verification.isBot}; message ${message}`
      );
      reject({ error: new Error('Access denied'), success: false });
    }

    const transporter = nodeMailer.createTransport(
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

    transporter.sendMail(
      message,
      (error: Error | null, info: SentMessageInfo) => {
        if (error) {
          console.error(`Message not sent: ${error}`);
          reject({ error, success: false });
        }
        console.error(`Message sent: ${JSON.stringify(info)}`);
        resolve({ success: true });
      }
    );
  });
};
