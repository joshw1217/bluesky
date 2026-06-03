import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async (to?: string, subject?: string, html?: string) => {
  const response = await resend.emails.send({
    from: 'onboarding@resend.dev',
    to: 'joshgwilson1227@gmail.com',
    subject: 'Hello World',
    html: '<p>Congrats on sending your <strong>first email</strong>!</p>'
  });

  return response;
}

export default sendEmail;