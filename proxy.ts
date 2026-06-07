// proxy.ts — optimistic edge guard for protected routes (Next.js 16 proxy convention).
// Checks only for the presence of an Auth.js session cookie (edge-safe, no DB).
// Definitive enforcement happens in the server components via `await auth()`.

import { NextResponse, type NextRequest } from "next/server";

const SESSION_COOKIES = [
  "authjs.session-token",
  "__Secure-authjs.session-token",
];

export default function proxy(req: NextRequest) {
  const hasSession = SESSION_COOKIES.some((c) => req.cookies.has(c));
  if (!hasSession) {
    const url = new URL("/login", req.url);
    url.searchParams.set("callbackUrl", req.nextUrl.pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/conta/:path*", "/projetos/:path*"],
};
