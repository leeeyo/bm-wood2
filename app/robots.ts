import type { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://bmwood.tn"
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/cms/", "/dashboard", "/api/", "/login", "/register", "/forgot-password"],
      },
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: ["/cms/", "/dashboard", "/api/", "/login", "/register", "/forgot-password"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
