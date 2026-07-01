import { NextResponse } from "next/server";

export async function GET() {
  const apiKey = process.env.CREEM_API_KEY;
  const baseUrl = process.env.CREEM_BASE_URL;

  return NextResponse.json({
    creemApiKey: apiKey ? `${apiKey.slice(0, 10)}...${apiKey.slice(-4)}` : "NOT SET",
    creemBaseURL: baseUrl,
    message: "If you see this, environment variables are accessible",
  });
}
