import Link from "next/link";
import { createClient_server } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function Home() {
  const supabase = await createClient_server();
  const { data: products } = await supabase
    .from("products")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  return (
    <div className="flex flex-col gap-12 pb-16">
      {/* Hero */}
      <section className="px-4 pt-16">
        <div className="container mx-auto max-w-5xl text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
            Learn Chinese,{" "}
            <span className="text-red-600">Start Speaking</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            Expertly crafted courses for English speakers — from HSK prep and
            business Chinese to calligraphy and daily conversation. Learn at
            your own pace with downloadable materials.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Link href="/products">
              <Button size="lg">Browse Courses</Button>
            </Link>
            <Link href="/signup">
              <Button variant="outline" size="lg">Create Free Account</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="px-4">
        <div className="container mx-auto max-w-5xl">
          <h2 className="mb-8 text-2xl font-semibold tracking-tight">
            Popular Courses
          </h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {(products as any[])?.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link href="/products">
              <Button variant="outline">View All Courses &rarr;</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="px-4 bg-muted/50 py-16">
        <div className="container mx-auto max-w-5xl">
          <h2 className="mb-10 text-center text-2xl font-semibold tracking-tight">
            Why ChineseMaster?
          </h2>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
            {[
              {
                title: "For English Speakers",
                desc: "Every course is designed specifically for native English speakers, with clear explanations and cultural context.",
              },
              {
                title: "Instant Download",
                desc: "Purchase once and get immediate access to all materials — PDFs, audio files, and printable worksheets.",
              },
              {
                title: "All Levels Welcome",
                desc: "From absolute beginner to advanced business Chinese, we have structured courses for your journey.",
              },
            ].map((item) => (
              <div key={item.title} className="text-center">
                <h3 className="font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
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
