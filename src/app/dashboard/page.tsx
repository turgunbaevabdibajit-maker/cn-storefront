import { redirect } from "next/navigation";
import { createClient_server } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

type Profile = {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
};

type PurchaseItem = {
  product_id: string;
  orders: { status: string; paid_at: string | null }[];
};

type ProductItem = {
  id: string;
  title: string;
  slug: string;
  cover_image_url: string | null;
  category: string | null;
};

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string }>;
}) {
  const params = await searchParams;

  const supabase = await createClient_server();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch user profile
  const { data: profileRaw } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const profile = profileRaw as Profile | null;

  // Fetch user purchases
  const { data: purchases } = await supabase
    .from("download_access")
    .select("product_id, orders!inner(status, paid_at)")
    .eq("user_id", user.id);

  const purchaseList = purchases as PurchaseItem[] | null;

  // Fetch purchase details
  const productIds = (purchaseList ?? []).map((p) => p.product_id);
  const { data: purchaseProductsRaw } = productIds.length > 0
    ? await supabase
        .from("products")
        .select("*")
        .in("id", productIds)
    : { data: [] };

  const purchaseProducts = (purchaseProductsRaw as any[]) as ProductItem[];

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      {params.success && (
        <div className="mt-2 rounded-md border border-green-500/50 bg-green-500/10 p-3 text-sm text-green-700">
          Payment successful! Your download access is being activated. Check back in a moment if it doesn't appear.
        </div>
      )}
      <p className="text-muted-foreground">
        Welcome, {profile?.full_name || user.email}. Here you can manage your purchases and download materials.
      </p>

      {/* Profile Info */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Your Account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>
            <span className="font-medium">Email:</span> {user.email}
          </p>
          {profile?.full_name && (
            <p>
              <span className="font-medium">Name:</span> {profile.full_name}
            </p>
          )}
          <p>
            <span className="font-medium">Member since:</span>{" "}
            {new Date(user.created_at).toLocaleDateString()}
          </p>
        </CardContent>
      </Card>

      {/* Purchases */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Your Courses</CardTitle>
          <CardDescription>
            {purchaseProducts.length > 0
              ? "Download your purchased materials below."
              : "You haven't purchased any courses yet."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {purchaseProducts.length > 0 ? (
            <div className="space-y-4">
              {purchaseProducts.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div>
                    <h3 className="font-medium">{product.title}</h3>
                    {product.category && (
                      <p className="text-sm text-muted-foreground">
                        {product.category}
                      </p>
                    )}
                  </div>
                  <Link href={`/products/${product.slug}`}>
                    <Button size="sm">Download</Button>
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-muted-foreground mb-4">
                Browse our courses and start learning!
              </p>
              <Link href="/products">
                <Button>Browse Courses</Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
