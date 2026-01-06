
// Send email via Mailtrap HTTP API
const sendEmail = async ({ email, subject, html, message }) => {
  try {
    const res = await fetch("https://send.api.mailtrap.io/api/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Api-Token": process.env.EMAIL_PASSWORD,
      },
      body: JSON.stringify({
        from: "Nafsiya Support <support@nafsiya.tn>",
        to: email,
        subject,
        html: html || undefined,
        text: message || undefined,
      }),
    });

    const data = await res.json();
    if (!res.ok) console.error("❌ Mailtrap API error:", data);
    else console.log("📧 Email sent via Mailtrap API");
  } catch (err) {
    console.error("❌ HTTP request failed:", err.message);
  }
};

// HTML template generator (unchanged)
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
