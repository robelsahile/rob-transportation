// Simple test script to check Square credentials locally
// Run with: node test-square-local.js

const SQUARE_ACCESS_TOKEN = process.env.SQUARE_ACCESS_TOKEN;
const SQUARE_ENV = process.env.SQUARE_ENV || "production";
const SQUARE_LOCATION_ID = process.env.SQUARE_LOCATION_ID;

function squareHost(env) {
  return env === "sandbox"
    ? "https://connect.squareupsandbox.com"
    : "https://connect.squareup.com";
}

async function testSquareCredentials() {
  console.log("🔍 Testing Square Credentials...");
  console.log("Environment:", SQUARE_ENV);
  console.log("Has Token:", !!SQUARE_ACCESS_TOKEN);
  console.log("Has Location ID:", !!SQUARE_LOCATION_ID);
  console.log("Location ID:", SQUARE_LOCATION_ID);
  
  if (!SQUARE_ACCESS_TOKEN || !SQUARE_LOCATION_ID) {
    console.log("❌ Missing credentials!");
    console.log("Please set SQUARE_ACCESS_TOKEN and SQUARE_LOCATION_ID in your environment");
    return;
  }

  try {
    const host = squareHost(SQUARE_ENV);
    console.log("Testing against:", host);
    
    const response = await fetch(`${host}/v2/locations/${SQUARE_LOCATION_ID}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${SQUARE_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
        "Square-Version": "2023-10-18",
      },
    });

    const data = await response.json();

    if (!response.ok) {
      console.log("❌ Square API connection failed!");
      console.log("Status:", response.status);
      console.log("Error:", data);
    } else {
      console.log("✅ Square credentials are working!");
      console.log("Location Name:", data.location?.name);
      console.log("Location Address:", data.location?.address?.address_line_1);
      console.log("Location City:", data.location?.address?.locality);
    }

  } catch (error) {
    console.log("❌ Error testing Square API:");
    console.log(error.message);
  }
}

testSquareCredentials();
