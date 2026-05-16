export async function getBaseUrl() {
  // 1. If we're on the client, use window.location.origin
  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  // 2. If we're on the server
  try {
    const { headers } = await import("next/headers");
    const headerList = await headers();
    const host = headerList.get("host");
    const protocol = headerList.get("x-forwarded-proto") || "https";
    
    if (host) {
      return `${protocol}://${host}`;
    }
  } catch (e) {
    // Fallback if headers() is called outside of request context
  }
  
  // 3. Fallback to Vercel Environment Variable (for build time / static generation)
  if (process.env.NEXT_PUBLIC_VERCEL_URL) {
    return `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`;
  }

  // 4. Fallback to manually set App URL or localhost
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
}
