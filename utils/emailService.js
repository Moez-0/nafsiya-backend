const nodemailer = require('nodemailer');

const sendEmail = async options => {
  // 1) Create a transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT),
    secure: false, // STARTTLS
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
    requireTLS: true,
    tls: {
      rejectUnauthorized: true,
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 10000,
  });

  // 2) Define the email options
  const mailOptions = {
    from: 'Nafsiya Support  <support@nafsiya.tn>',
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html || null // Use HTML if provided, otherwise fallback to text
  };

  // 3) Actually send the email
  transporter.sendMail(mailOptions)
  .then(() => console.log("📧 Email sent"))
  .catch(err => console.error("❌ Email failed:", err.message));
};
// HTML template generator function
const generateVerificationEmail = (username, verificationUrl) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Segoe UI', Tahoma, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { text-align: center; padding: 20px 0; }
    .content { background-color: #f8f9fa; padding: 30px; border-radius: 8px; margin: 20px 0; }
    .button { display: inline-block; background-color: #4f46e5; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600; }
    .footer { text-align: center; font-size: 12px; color: #666; padding-top: 20px; }
  </style>
</head>
<body>
  <div class="header">
    <h1> Nafisya </h1>
  </div>
  
  <div class="content">
    <h2>Verify Your Email Address</h2>
    <p>Hello ${username},</p>
    <p>Thank you for signing up with Nafsiya! Please verify your email:</p>
    
    <div style="text-align: center; margin: 20px 0;text-decoration: none; color:white;">
      <a href="${verificationUrl}" class="button">Verify Email</a>
    </div>
    
    <p>Or copy this link to your browser:</p>
    <p style="word-break: break-all; font-size: 12px;">${verificationUrl}</p>
    
    <p>This link will expire in 24 hours. If you didn't create this account, please ignore this email.</p>
  </div>
  
  <div class="footer">
    <p>© ${new Date().getFullYear()} Nafsiya. All rights reserved.</p>
  </div>
</body>
</html>
`;

module.exports = { sendEmail, generateVerificationEmail };
// module.exports = sendEmail;
