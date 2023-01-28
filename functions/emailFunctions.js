import mailgun from "mailgun-js";

const API_KEY = "0e9c55257fb174c2b4b8d69d7a26dca2-c50a0e68-fe55cc45";
const DOMAIN = "sandbox01172abaa00f4b469b88652a04246741.mailgun.org";
const mg = mailgun({ apiKey: API_KEY, domain: DOMAIN });

const sendVerificationEmail = (to, url) => {
  const data = {
    from: "verify-your-email@atable.ma",
    to,
    subject: "Verify your email",
    html: `<h3>Thank you for signing up.</h3>
    <br>
    <p>Click on <a href=${url}>this</a> link below to verify your email address.</p>
    `,
  };

  mg.messages().send(data, (error, _) => {
    if (error) {
      console.log(error);
    } else {
      console.log({
        success: true,
        message: "Email Verification Link Sent",
      });
    }
  });
};

const sendPasswordResetEmail = (to, url) => {
  const data = {
    from: "reset-password@atable.ma",
    to,
    subject: "Reset your password",
    html: `<h3>Password Reset Request</h3>
    <br>
    <p>Click on <a href=${url}>this</a> link to reset your password</p>
    `,
  };

  mg.messages().send(data, (error, _) => {
    if (error) {
      console.log(error);
    } else {
      console.log({
        success: true,
        message: "Password Reset Link Sent",
      });
    }
  });
};

const sendWelcomeEmail = (to, name) => {
  const data = {
    from: "welcome@atable.ma",
    to,
    subject: "Welcome To A-Table",
    html: `<h3>Welcome ${name},</h3><br>
    <p>Thank you for signing up to A-Table</p>`,
  };

  mg.messages().send(data, (error, _) => {
    if (error) {
      console.log(error);
    } else {
      console.log({
        success: true,
        message: "Welcome Email Sent",
      });
    }
  });
};

export { sendVerificationEmail, sendWelcomeEmail, sendPasswordResetEmail };
