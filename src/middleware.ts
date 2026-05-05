import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

function hasSessionCookie(req: NextRequest): boolean {
  return (
    req.cookies.has("authjs.session-token") ||
    req.cookies.has("__Secure-authjs.session-token") ||
    req.cookies.has("next-auth.session-token") ||
    req.cookies.has("__Secure-next-auth.session-token")
  );
}

export default function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isLoggedIn = hasSessionCookie(req);

  if (pathname.startsWith("/admin")) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/auth/signin?callbackUrl=/admin", req.url));
    }
  }

  const directoryAccess = process.env.DIRECTORY_ACCESS ?? "public";
  if (directoryAccess === "protected" && pathname.startsWith("/directory")) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL(`/auth/signin?callbackUrl=${pathname}`, req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/directory/:path*"],
};
