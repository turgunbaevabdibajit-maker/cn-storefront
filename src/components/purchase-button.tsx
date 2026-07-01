"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function PurchaseButton({
  productId,
  priceCents,
}: {
  productId: string;
  priceCents: number;
}) {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.alreadyOwned) {
          toast.info("You already own this course!");
        } else {
          toast.error(data.detail || data.error || "Failed to start checkout");
        }
        return;
      }

      // Redirect to Creem checkout
      window.location.href = data.checkoutUrl;
    } catch (err) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button size="lg" className="w-full" onClick={handleClick} disabled={loading}>
      {loading ? "Processing..." : `Purchase — $${(priceCents / 100).toFixed(2)}`}
    </Button>
  );
}
