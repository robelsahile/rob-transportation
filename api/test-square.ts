export const config = { runtime: "edge" };

function squareHost(env: string | undefined) {
  return (env || "production") === "sandbox"
    ? "https://connect.squareupsandbox.com"
    : "https://connect.squareup.com";
}

export default async function handler(req: Request) {
  if (req.method !== "GET") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  const token = process.env.SQUARE_ACCESS_TOKEN;
  const env = process.env.SQUARE_ENV || "production";
  const locationId = process.env.SQUARE_LOCATION_ID;

  if (!token || !locationId) {
    return Response.json(
      { 
        error: "Missing Square credentials",
        hasToken: !!token,
        hasLocationId: !!locationId,
        env: env
      },
      { status: 500 }
    );
  }

  try {
    const host = squareHost(env);
    
    // Test Square API connection by getting location info
    const response = await fetch(`${host}/v2/locations/${locationId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "Square-Version": "2023-10-18",
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return Response.json({
        error: "Square API connection failed",
        status: response.status,
        details: data,
        host: host,
        locationId: locationId
      }, { status: 500 });
    }

    return Response.json({
      success: true,
      location: data.location,
      environment: env,
      host: host
    });

  } catch (error) {
    return Response.json({
      error: "Square API test failed",
      details: error instanceof Error ? error.message : "Unknown error",
      host: squareHost(env),
      locationId: locationId
    }, { status: 500 });
  }
}
