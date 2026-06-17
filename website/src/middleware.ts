import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const COOKIE_NAME = "admin_token";

export function middleware(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");
  const cookieToken = request.cookies.get(COOKIE_NAME)?.value;
  const adminToken = process.env.ADMIN_TOKEN || "change-me-in-production";

  if (cookieToken === adminToken) {
    return NextResponse.next();
  }

  if (token === adminToken) {
    const response = NextResponse.redirect(
      new URL("/admin", request.url)
    );
    response.cookies.set(COOKIE_NAME, adminToken, {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      maxAge: 86400 * 30,
    });
    return response;
  }

  const loginHtml = `<!DOCTYPE html><html><head><title>admin login</title><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="margin:0;background:#0a0a0a;color:#e0e0e0;display:flex;align-items:center;justify-content:center;height:100vh;font-family:monospace"><form method="get" style="text-align:center;padding:32px;border:1px solid #222;border-radius:8px;background:#111"><div style="font-size:12px;color:#0ff;margin-bottom:16px">$ admin login</div><input name="token" type="password" placeholder="enter token" autofocus style="background:#1a1a1a;border:1px solid #333;color:#0ff;padding:8px 12px;border-radius:4px;font-family:monospace;font-size:13px;outline:none" onkeydown="if(event.key==='Enter')this.form.submit()"><button type="submit" style="background:transparent;border:1px solid #0ff;color:#0ff;padding:8px 16px;border-radius:4px;margin-left:8px;cursor:pointer;font-family:monospace;font-size:13px">login</button></form></body></html>`;

  return new NextResponse(loginHtml, {
    status: 401,
    headers: { "content-type": "text/html" },
  });
}

export const config = {
  matcher: "/admin/:path*",
};
