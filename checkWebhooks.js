const fs = require("fs");
const { createClient } = require("@supabase/supabase-js");

const env = fs.readFileSync(".env.local", "utf8").split("\n").reduce((acc, line) => {
  const [key, val] = line.split("=");
  if (key && val) acc[key] = val.trim();
  return acc;
}, {});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, serviceKey);

async function checkRows() {
  console.log("Checking stripe_webhooks table for resent events...");
  const { data: webhooks, error: wError } = await supabase.from("stripe_webhooks").select("*").order("created_at", { ascending: false }).limit(5);
  console.log("Recent webhooks:", webhooks);
  
  console.log("Checking service_bookings table...");
  const { data: bookings, error: bError } = await supabase.from("service_bookings").select("*").order("created_at", { ascending: false }).limit(5);
  console.log("Recent bookings:", bookings);
  
  console.log("Checking points_transactions...");
  const { data: points, error: pError } = await supabase.from("points_transactions").select("*").order("created_at", { ascending: false }).limit(5);
  console.log("Recent points transactions:", points);
}

checkRows();
