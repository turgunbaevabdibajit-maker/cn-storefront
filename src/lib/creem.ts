import { createClient_server } from "@/lib/supabase/server";

const CREEM_API_KEY = process.env.CREEM_API_KEY!;
const CREEM_BASE_URL = process.env.CREEM_BASE_URL || "https://api.creem.io";

interface CreemCheckoutResponse {
  checkout_url: string;
  payment_id?: string;
  [key: string]: any;
}

export async function createCheckout(
  orderId: string,
  productTitle: string,
  amountCents: number,
  currency: string,
  successUrl: string,
  cancelUrl: string
): Promise<CreemCheckoutResponse> {
  const response = await fetch(`${CREEM_BASE_URL}/v1/checkouts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${CREEM_API_KEY}`,
    },
    body: JSON.stringify({
      metadata: {
        order_id: orderId,
      },
      line_items: [
        {
          name: productTitle,
          description: `ChineseMaster Course`,
          unit_amount: amountCents,
          currency,
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`Creem API error (${response.status}):`, errorText);
    // Check for common 401 causes
    if (response.status === 401) {
      throw new Error(
        "Creem API error (401): API key may be invalid or missing. Check CREEM_API_KEY in environment variables."
      );
    }
    throw new Error(`Creem API error (${response.status}): ${errorText}`);
  }

  return response.json();
}

export async function handleCreemWebhookEvent(_rawBody: string, _signature: string) {
  // Signature verified in route.ts before calling this function
  const event = JSON.parse(_rawBody);
  const supabase = await createClient_server();

  switch (event.type) {
    case "payment.succeeded": {
      const { metadata } = event.data || {};
      const orderId = (metadata as { order_id?: string })?.order_id;

      if (orderId) {
        // Update order status to paid
        await (supabase as any)
          .from("orders")
          .update({ status: "paid", paid_at: new Date().toISOString() })
          .eq("id", orderId);

        // Get order details to find user and product
        const { data: orderRaw } = await supabase
          .from("orders")
          .select("user_id, product_id")
          .eq("id", orderId)
          .single();

        const order = orderRaw as { user_id: string; product_id: string } | null;

        if (order) {
          // Grant download access
          await supabase.from("download_access").upsert({
            user_id: order.user_id,
            product_id: order.product_id,
            order_id: orderId,
          } as any);
        }
      }
      break;
    }

    case "payment.failed": {
      const { metadata } = event.data || {};
      const orderId = (metadata as { order_id?: string })?.order_id;
      if (orderId) {
        await (supabase as any)
          .from("orders")
          .update({ status: "failed" })
          .eq("id", orderId);
      }
      break;
    }

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  return { received: true };
}
