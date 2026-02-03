import { getProtectedRoutes } from "@/config/menu.config";

export default async function sitemap() {
  const baseUrl = "https://your-domain.com";

  // Static routes
  const staticRoutes = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/home`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/signIn`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.3,
    },
  ];

  // Dynamic routes from menu config
  const protectedRoutes = getProtectedRoutes();
  const dynamicRoutes = Object.keys(protectedRoutes).map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [...staticRoutes, ...dynamicRoutes];
}
