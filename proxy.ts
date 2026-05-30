import { NextResponse, type NextRequest } from "next/server";

const AUTH_COOKIE = "nc_auth";
const PROTECTED_ROUTES = new Set([
  "/",
  "/ai-assistant",
  "/bao-cao",
  "/cai-dat",
  "/can-ho",
  "/dashboard",
  "/gia-dinh",
  "/gop-y",
  "/ho-so",
  "/kho-tai-lieu",
  "/kpi",
  "/lich-su",
  "/quy-bao-tri",
  "/tai-chinh",
  "/thong-bao",
  "/thu-chi",
  "/tin-tuc",
  "/van-hanh",
]);

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProtected = Array.from(PROTECTED_ROUTES).some(
    (route) => pathname === route || (route !== "/" && pathname.startsWith(`${route}/`)),
  );

  if (!isProtected || request.cookies.get(AUTH_COOKIE)?.value === "1") {
    return NextResponse.next();
  }

  const signInUrl = new URL("/sign-in", request.url);
  signInUrl.searchParams.set("from", pathname);
  return NextResponse.redirect(signInUrl);
}

export const config = {
  matcher: [
    "/",
    "/ai-assistant/:path*",
    "/bao-cao/:path*",
    "/cai-dat/:path*",
    "/can-ho/:path*",
    "/dashboard/:path*",
    "/gia-dinh/:path*",
    "/gop-y/:path*",
    "/ho-so/:path*",
    "/kho-tai-lieu/:path*",
    "/kpi/:path*",
    "/lich-su/:path*",
    "/quy-bao-tri/:path*",
    "/tai-chinh/:path*",
    "/thong-bao/:path*",
    "/thu-chi/:path*",
    "/tin-tuc/:path*",
    "/van-hanh/:path*",
  ],
};
