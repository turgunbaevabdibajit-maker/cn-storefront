import { notFound } from "next/navigation";
import { createClient_server } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import PurchaseButton from "@/components/purchase-button";

type Product = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  price_cents: number;
  cover_image_url: string | null;
  category: string | null;
  level: string | null;
  sample_url: string | null;
};

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient_server();

  const { data: productRaw, error } = await supabase
    .from("products")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (!productRaw || error) {
    notFound();
  }

  const product = productRaw as Product;
  const price = (product.price_cents / 100).toFixed(2);

  // Check if user has purchased
  const {
    data: { user },
  } = await supabase.auth.getUser();
  let hasPurchased = false;
  if (user) {
    const { data: access } = await supabase
      .from("download_access")
      .select("id")
      .eq("user_id", user.id)
      .eq("product_id", product.id)
      .single();
    hasPurchased = !!access;
  }

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <Link href="/products" className="text-sm text-muted-foreground hover:text-primary mb-4 inline-block">
        &larr; Back to Courses
      </Link>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Image */}
        <div className="aspect-[4/3] bg-muted rounded-xl flex items-center justify-center text-6xl text-muted-foreground overflow-hidden">
          {product.cover_image_url ? (
            <img src={product.cover_image_url} alt={product.title} className="h-full w-full object-cover" />
          ) : (
            <span>书</span>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            {product.category && (
              <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium">
                {product.category}
              </span>
            )}
            {product.level && (
              <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium">
                {product.level}
              </span>
            )}
          </div>

          <h1 className="mt-3 text-3xl font-bold leading-tight">{product.title}</h1>
          <p className="mt-4 text-3xl font-semibold text-red-600">${price}</p>

          <p className="mt-4 text-muted-foreground text-sm leading-relaxed">
            {product.description}
          </p>

          <div className="mt-auto pt-6">
            {hasPurchased ? (
              <Link href={`/products/${product.slug}/download`} className="w-full">
                <Button size="lg" variant="default" className="w-full">
                  Download Your Course
                </Button>
              </Link>
            ) : (
              <PurchaseButton productId={product.id} priceCents={product.price_cents} />
            )}
          </div>
        </div>
      </div>

      {/* Details */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>What&apos;s Included</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
            <li>Complete course materials (PDF format)</li>
            <li>Audio files for pronunciation practice</li>
            <li>Printable worksheets and exercises</li>
            <li>Lifetime access and free updates</li>
            <li>Certificate of completion</li>
          </ul>
        </CardContent>
      </Card>

      {/* Sample */}
      {product.sample_url && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Free Sample</CardTitle>
            <CardDescription>Try before you buy.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href={product.sample_url} target="_blank">
              <Button variant="outline">Download Sample</Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
