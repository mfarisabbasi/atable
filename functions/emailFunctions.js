import mailgun from "mailgun-js";

const API_KEY = "dbc332075997c5112114aa0f94d7acc4-eb38c18d-f1e5f004";
const DOMAIN = "sandbox38bd33f2890542db85984f7eedc914e5.mailgun.org";
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

export { sendVerificationEmail, sendWelcomeEmail };
