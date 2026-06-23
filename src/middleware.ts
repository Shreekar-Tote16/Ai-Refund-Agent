import { getToken } from "next-auth/jwt";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const { nextUrl } = request;
  const isLogin = nextUrl.pathname === "/admin/login";
  const isAdmin = nextUrl.pathname.startsWith("/admin");
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  if (isAdmin && !isLogin && !token) {
    const url = new URL("/admin/login", nextUrl);
    url.searchParams.set("callbackUrl", nextUrl.pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"]
};
