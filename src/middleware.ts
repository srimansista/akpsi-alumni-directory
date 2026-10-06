import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
// This redirect is only a navigation convenience. Pages and APIs validate approval against the database.
export default function middleware(req: NextRequest) {
 const hasCookie = req.cookies.has("authjs.session-token") || req.cookies.has("__Secure-authjs.session-token");
 if(!hasCookie) {
  const url = new URL("/auth/signin",req.url);
  url.searchParams.set("callbackUrl",req.nextUrl.pathname+req.nextUrl.search);
  return NextResponse.redirect(url);
 }
 return NextResponse.next();
}
export const config = {matcher:["/admin/:path*","/directory/:path*","/alumni/:path*"]};
