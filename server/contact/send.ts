import nodeMailer, { SentMessageInfo } from 'nodemailer';
import Mail from 'nodemailer/lib/mailer';
import { SendResponse } from '@server/contact';

const GMAIL_APP_EMAIL = process.env.GMAIL_APP_EMAIL;
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD;
const GMAIL_SENDER_EMAIL = process.env.GMAIL_SENDER_EMAIL;

export const send = (message: Mail.Options): Promise<SendResponse> =>
  new Promise((resolve, reject) => {
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
