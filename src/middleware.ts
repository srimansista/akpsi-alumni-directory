import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;
  const isAdmin = req.auth?.user?.role === "ADMIN";

  if (pathname.startsWith("/admin")) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/auth/signin?callbackUrl=/admin", req.url));
    }
    if (!isAdmin) {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  const directoryAccess = process.env.DIRECTORY_ACCESS ?? "public";
  if (directoryAccess === "protected" && pathname.startsWith("/directory")) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL(`/auth/signin?callbackUrl=${pathname}`, req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*", "/directory/:path*"],
};
