import mailgun from "mailgun-js";

const API_KEY = "dbc332075997c5112114aa0f94d7acc4-eb38c18d-f1e5f004";
const DOMAIN = "sandbox38bd33f2890542db85984f7eedc914e5.mailgun.org";
const mg = mailgun({ apiKey: API_KEY, domain: DOMAIN });

const sendVerificationEmail = (to, url) => {
  const data = {
    from: "verify-your-email@atable.ma",
    to,
    subject: "Verify your email",
    text: `Click on the link below to verify your email address ${url}`,
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

export { sendVerificationEmail };
