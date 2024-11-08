import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendVerificationEmail = async (email, token) => {
  const verificationUrl = `${process.env.FRONTEND_URL}/auth/verify-email?token=${token}`;

  const mailOptions = {
    from: process.env.SMTP_FROM || '"Company Portal" <noreply@company.com>',
    to: email,
    subject: '请验证您的电子邮箱',
    html: `
      <h1>欢迎注册公司导航门户</h1>
      <p>请点击下面的链接验证您的电子邮箱：</p>
      <a href="${verificationUrl}">${verificationUrl}</a>
      <p>如果您没有注册账号，请忽略此邮件。</p>
    `,
  };

  await transporter.sendMail(mailOptions);
};
