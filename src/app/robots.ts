import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/dashboard",
        "/login",
        "/signup",
        "/api/",
      ],
    },
    sitemap: process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}/sitemap.xml`
      : process.env.NEXT_PUBLIC_APP_URL
        ? `${process.env.NEXT_PUBLIC_APP_URL}/sitemap.xml`
        : undefined,
  };
}
