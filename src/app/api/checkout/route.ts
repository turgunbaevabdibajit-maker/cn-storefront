import { NextResponse } from "next/server";
import { createClient_server } from "@/lib/supabase/server";
import { createCheckout } from "@/lib/creem";
import { revalidatePath } from "next/cache";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { productId } = body;

    if (!productId) {
      return NextResponse.json({ error: "Product ID required" }, { status: 400 });
    }

    const supabase = await createClient_server();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get product details
    const { data: productRaw } = await supabase
      .from("products")
      .select("*")
      .eq("id", productId)
      .single();

    const product = productRaw as {
      id: string;
      title: string;
      slug: string;
      price_cents: number;
      currency: string;
    } | null;

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Check if user already owns this product
    const { data: existingAccess } = await supabase
      .from("download_access")
      .select("id")
      .eq("user_id", user.id)
      .eq("product_id", productId)
      .single();

    if (existingAccess) {
      return NextResponse.json({
        error: "You already own this course",
        alreadyOwned: true,
      });
    }

    // Create order record
    const { data: orderRaw, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: user.id,
        product_id: productId,
        amount_cents: product.price_cents,
        currency: product.currency || "usd",
        status: "pending",
      } as any)
      .select()
      .single();

    const order = orderRaw as { id: string } | null;

    if (orderError || !order) {
      return NextResponse.json(
        { error: "Failed to create order" },
        { status: 500 }
      );
    }

    // Create Creem checkout
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const checkout = await createCheckout(
      order.id,
      product.title,
      product.price_cents,
      product.currency || "usd",
      `${appUrl}/api/creem/success?order_id=${order.id}`,
      `${appUrl}/products/${product.slug}`
    );

    return NextResponse.json({ checkoutUrl: checkout.checkout_url });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal error" },
      { status: 500 }
    );
  }
}
