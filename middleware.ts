import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";

// This middleware handles both protection and redirection
export default async function middleware(req: NextRequest) {
  // Get the pathname from the request
  const path = req.nextUrl.pathname;

  // Check if user is authenticated by getting the token
  const session = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // Home page route handling - redirect to dashboard if authenticated
  if (path === "/") {
    // If user is authenticated and trying to access home page, redirect to dashboard
    if (session) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    // Otherwise allow access to home page
    return NextResponse.next();
  }

  // Protected routes handling
  if (path.startsWith("/dashboard")) {
    // If user is not authenticated and trying to access dashboard, redirect to login
    if (!session) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    // Allow access to dashboard for authenticated users
    return NextResponse.next();
  }

  // Default behavior - allow access
  return NextResponse.next();
}

// Apply middleware to specific routes
export const config = {
  matcher: ["/", "/dashboard/:path*"],
};
