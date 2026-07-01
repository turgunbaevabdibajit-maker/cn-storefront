import { NextResponse } from "next/server";

const CREEM_API_KEY = process.env.CREEM_API_KEY;
const CREEM_BASE_URL = process.env.CREEM_BASE_URL || "https://api.creem.io";

export async function GET() {
  const results: Record<string, string | number | null> = {
    apiKeyPrefix: CREEM_API_KEY ? `${CREEM_API_KEY.slice(0, 10)}...${CREEM_API_KEY.slice(-4)}` : "NOT SET",
    baseUrl: CREEM_BASE_URL,
  };

  // Test direct connection to Creem API
  try {
    const response = await fetch(`${CREEM_BASE_URL}/v1/checkouts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": CREEM_API_KEY || "",
      },
      body: JSON.stringify({
        line_items: [
          {
            name: "Test Product",
            description: "Test",
            unit_amount: 100,
            currency: "usd",
            quantity: 1,
          },
        ],
        success_url: "https://example.com/success",
        cancel_url: "https://example.com/cancel",
      }),
    });

    results["status"] = response.status;
    const text = await response.text();
    results["response"] = text;
    results["ok"] = response.ok;
  } catch (err: any) {
    results["error"] = err?.message || String(err);
  }

  return NextResponse.json(results);
}
