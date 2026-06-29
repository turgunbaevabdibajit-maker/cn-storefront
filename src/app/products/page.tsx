import { createClient_server } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function ProductsPage() {
  const supabase = await createClient_server();
  const { data: products } = await supabase
    .from("products")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-3xl font-bold tracking-tight">All Courses</h1>
      <p className="mt-2 text-muted-foreground">
        Browse our complete collection of Chinese learning materials.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {(products as any[])?.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {(!products || products.length === 0) && (
        <div className="mt-12 text-center">
          <p className="text-muted-foreground">No courses available yet. Check back soon!</p>
        </div>
      )}
    </div>
  );
}

function ProductCard({
  product,
}: {
  product: {
    id: string;
    title: string;
    slug: string;
    short_description: string | null;
    price_cents: number;
    cover_image_url: string | null;
    category: string | null;
    level: string | null;
  };
}) {
  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-md">
      <div className="aspect-[4/3] bg-muted flex items-center justify-center text-4xl text-muted-foreground">
        {product.cover_image_url ? (
          <img
            src={product.cover_image_url}
            alt={product.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="text-6xl">书</span>
        )}
      </div>
      <CardContent className="pt-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            {product.category && (
              <p className="text-xs text-muted-foreground">{product.category}</p>
            )}
            <h3 className="font-semibold leading-tight">{product.title}</h3>
            {product.level && (
              <p className="mt-1 text-xs text-muted-foreground">{product.level}</p>
            )}
          </div>
          <p className="whitespace-nowrap font-semibold text-red-600">
            ${(product.price_cents / 100).toFixed(2)}
          </p>
        </div>
        {product.short_description && (
          <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
            {product.short_description}
          </p>
        )}
        <Link href={`/products/${product.slug}`}>
          <Button className="mt-4 w-full" size="sm">View Details</Button>
        </Link>
      </CardContent>
    </Card>
  );
}
