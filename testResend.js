const fs = require("fs");
const { Resend } = require("resend");

const env = fs.readFileSync(".env.local", "utf8").split("\n").reduce((acc, line) => {
  const [key, val] = line.split("=");
  if (key && val) acc[key] = val.trim();
  return acc;
}, {});

const apiKey = env.RESEND_API_KEY;
const resend = new Resend(apiKey);

async function testResendLiveDomain() {
  console.log("Testing Resend API with getsquito.com...");
  try {
    const data = await resend.emails.send({
      from: "Squito <service@getsquito.com>",
      to: "delivered@resend.dev",
      subject: "Test from Squito Domain",
      html: "<p>Testing verified domain.</p>"
    });
    console.log("Response:", data);
  } catch (err) {
    console.error("Resend Error:", err);
  }
}

testResendLiveDomain();
