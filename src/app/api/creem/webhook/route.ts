import { NextRequest, NextResponse } from "next/server";
import { createClient_server } from "@/lib/supabase/server";
import { handleCreemWebhookEvent } from "@/lib/creem";

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const signature = request.headers.get("creem-webhook-signature") || "";

  // Verify webhook signature
  const WEBHOOK_SECRET = process.env.CREEM_WEBHOOK_SECRET;
  if (!WEBHOOK_SECRET) {
    console.error("CREEM_WEBHOOK_SECRET is not configured");
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 500 }
    );
  }

  if (!signature) {
    return NextResponse.json(
      { error: "Missing webhook signature" },
      { status: 401 }
    );
  }

  // Verify signature using HMAC-SHA256
  const crypto = await import("crypto");
  const hmac = crypto.createHmac("sha256", WEBHOOK_SECRET);
  const digest = hmac.update(rawBody, "utf8").digest("hex");

  // Constant-time comparison to prevent timing attacks
  const valid = crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(digest)
  );

  if (!valid) {
    console.warn("Invalid webhook signature");
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 401 }
    );
  }

  try {
    const result = await handleCreemWebhookEvent(rawBody, signature);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Webhook failed" }, { status: 400 });
  }
}

// Webhook should not be handled by Next.js revalidation
export const dynamic = "force-static";
export const revalidate = 0;
