import { MetadataRoute } from "next";
import { createClient_server } from "@/lib/supabase/server";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient_server();
  const { data: products } = await supabase
    .from("products")
    .select("slug, updated_at")
    .eq("is_active", true);

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: appUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${appUrl}/products`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ];

  const productPages: MetadataRoute.Sitemap = (products as { slug: string; updated_at: string }[] | undefined)?.map((product) => ({
    url: `${appUrl}/products/${product.slug}`,
    lastModified: new Date(product.updated_at),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  })) || [];

  return [...staticPages, ...productPages];
}
