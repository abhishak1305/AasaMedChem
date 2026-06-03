import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

export async function middleware(request) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  const pathname = request.nextUrl.pathname;

  // Allow login and root pages without auth
  if (pathname === "/login" || pathname === "/") {
    return NextResponse.next();
  }

  // Require auth for all other pages
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Admin-only pages
  if (pathname.startsWith("/admin")) {
    if (token.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  // Seller-only pages
  if (pathname.startsWith("/dashboard")) {
    if (!token.role) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/dashboard/:path*", "/api/protected/:path*"],
};
