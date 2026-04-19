export async function getBaseUrl() {
  // If we're on the server
  if (typeof window === "undefined") {
    try {
      const { headers } = await import("next/headers");
      const headerList = await headers();
      const host = headerList.get("host");
      const protocol = headerList.get("x-forwarded-proto") || "http";
      
      if (host) {
        return `${protocol}://${host}`;
      }
    } catch (e) {
      // Fallback if headers() is called outside of request context
    }
    
    // Fallback to Env variable for CI/Build time or background tasks
    return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  }

  // If we're on the client
  return window.location.origin;
}
