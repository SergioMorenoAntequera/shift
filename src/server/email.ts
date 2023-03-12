
import nodemailer from 'nodemailer'
import { env } from '~/env.mjs';

const emailService = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: env.EMAIL_USER,
      pass: env.EMAIL_PASSWORD
    }
});

export default emailService