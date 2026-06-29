import { notFound } from "next/navigation";
import { createClient_server } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { redirect } from "next/navigation";

type Product = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  price_cents: number;
  cover_image_url: string | null;
  category: string | null;
  level: string | null;
  download_url: string | null;
  sample_url: string | null;
};

export default async function DownloadPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient_server();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Get product
  const { data: productRaw } = await supabase
    .from("products")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (!productRaw) {
    notFound();
  }

  const product = productRaw as Product;

  // Check download access
  const { data: accessRaw } = await supabase
    .from("download_access")
    .select("*")
    .eq("user_id", user.id)
    .eq("product_id", product.id)
    .single();

  const access = accessRaw as { id: string; created_at: string; order_id: string | null } | null;

  // Get order info
  let orderStatus = "pending";
  let paidAt: string | null = null;
  if (access?.order_id) {
    const { data: orderData } = await supabase
      .from("orders")
      .select("status, paid_at")
      .eq("id", access.order_id)
      .single();
    orderStatus = (orderData as { status: string; paid_at: string | null } | null)?.status ?? "pending";
    paidAt = (orderData as { status: string; paid_at: string | null } | null)?.paid_at ?? null;
  }

  const hasAccess = orderStatus === "paid";

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-primary mb-4 inline-block">
        &larr; Back to Dashboard
      </Link>

      <h1 className="text-3xl font-bold tracking-tight">{product.title}</h1>
      <p className="mt-2 text-muted-foreground">Your purchased materials</p>

      {!hasAccess ? (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Payment {orderStatus === "pending" ? "Pending" : "Not Found"}</CardTitle>
            <CardDescription>
              {orderStatus === "pending"
                ? "Your payment is being processed. Check back shortly."
                : "You haven't purchased this course yet."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {orderStatus === "pending" ? (
              <p className="text-sm text-muted-foreground">
                Once your payment is confirmed, your materials will be available here.
              </p>
            ) : (
              <Link href={`/products/${product.slug}`}>
                <Button>Purchase Now</Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="mt-6 space-y-6">
          {/* Download Section */}
          <Card>
            <CardHeader>
              <CardTitle>Download Materials</CardTitle>
              <CardDescription>
                Purchased on{" "}
                {access?.created_at
                  ? new Date(access.created_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  : "N/A"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {product.download_url ? (
                <a
                  href={product.download_url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button size="lg" className="w-full">
                    Download Full Course
                  </Button>
                </a>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Download link coming soon. Contact support if you need access.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Sample */}
          {product.sample_url && (
            <Card>
              <CardHeader>
                <CardTitle>Free Sample</CardTitle>
                <CardDescription>Additional reference material</CardDescription>
              </CardHeader>
              <CardContent>
                <a href={product.sample_url} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" className="w-full">
                    Download Sample
                  </Button>
                </a>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
