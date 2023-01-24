import mailgun from "mailgun-js";

const API_KEY = "dbc332075997c5112114aa0f94d7acc4-eb38c18d-f1e5f004";
const DOMAIN = "sandbox38bd33f2890542db85984f7eedc914e5.mailgun.org";
const mg = mailgun({ apiKey: API_KEY, domain: DOMAIN });

const sendEmail = (to, subject, text) => {
  const data = {
    from: "welcome@atable.ma",
    to,
    subject,
    text,
  };

  mg.messages().send(data, (error, body) => {
    if (error) {
      console.log(error);
    } else {
      console.log(body);
    }
  });
};

export { sendEmail };
