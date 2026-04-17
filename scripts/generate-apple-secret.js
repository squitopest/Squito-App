const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");

const KEY_ID = "SH3T3U8M89";             
const TEAM_ID = "4367ZCH572";           
const CLIENT_ID = "com.squito.pestcontrol.app.services";   

const P8_PATH = process.env.APPLE_AUTH_KEY_PATH || path.join(__dirname, "AuthKey.p8");

try {
  if (!fs.existsSync(P8_PATH)) {
    console.error("❌ Error: Could not find the Apple private key file.");
    console.error("   Put it at scripts/AuthKey.p8 or set APPLE_AUTH_KEY_PATH.");
    process.exit(1);
  }

  const privateKey = fs.readFileSync(P8_PATH, "utf8");

  // Force strict Apple compliant timestamps
  const iat = Math.floor(Date.now() / 1000);
  const exp = iat + 15777000; // Exactly 6 months
  
  const token = jwt.sign(
    {
      iss: TEAM_ID,
      iat: iat,
      exp: exp,
      aud: "https://appleid.apple.com",
      sub: CLIENT_ID,
    },
    privateKey,
    {
      algorithm: "ES256",
      keyid: KEY_ID,
    }
  );

  const outputPath = process.env.APPLE_CLIENT_SECRET_OUTPUT || path.join(__dirname, "apple-jwt.txt");
  fs.writeFileSync(outputPath, token);
  
  console.log("\n✅ Apple Client Secret Generated Successfully!");
  console.log(`👉 The JWT has been saved to: ${outputPath}`);
  console.log("Please open that file in VS Code, copy everything inside, and paste it into Supabase.");
  console.log("This prevents your terminal from accidentally adding hidden spaces or newlines when copying!\n");

} catch (e) {
  console.error("❌ Error generating secret:", e.message);
}
