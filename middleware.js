import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { getProtectedRoutes } from "@/config/menu.config";

const publicRoutes = ["/signIn", "/api/auth"];
const protectedRoutes = getProtectedRoutes();

export default auth((req) => {
  const { nextUrl, auth: session } = req;
  const pathname = nextUrl.pathname;

  const isPublicRoute = publicRoutes.some(
    (route) => pathname === route || pathname.startsWith("/api/auth")
  );

  if (pathname === "/") {
    if (session) {
      return NextResponse.redirect(new URL("/home", nextUrl.origin));
    } else {
      return NextResponse.redirect(new URL("/signIn", nextUrl.origin));
    }
  }

  if (!session && !isPublicRoute) {
    const signInUrl = new URL("/signIn", nextUrl.origin);
    signInUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signInUrl);
  }

  if (session && pathname === "/signIn") {
    return NextResponse.redirect(new URL("/home", nextUrl.origin));
  }

  if (session && !isPublicRoute) {
    const user = session.user;

    if (user.isSuperAdmin) {
      return NextResponse.next();
    }

    for (const [route, config] of Object.entries(protectedRoutes)) {
      if (pathname === route || pathname.startsWith(route + "/")) {
        if (config.requireSuperAdmin) {
          return NextResponse.redirect(new URL("/forbidden", nextUrl.origin));
        }

        if (!hasPermission(user.permissions, config.permission)) {
          return NextResponse.redirect(new URL("/forbidden", nextUrl.origin));
        }
        break;
      }
    }
  }

  return NextResponse.next();
});

function hasPermission(userPermissions, requiredPermission) {
  if (!userPermissions || !requiredPermission) return false;

  if (userPermissions.includes(requiredPermission)) return true;

  const wildcardPermissions = userPermissions.filter((p) => p.endsWith(".*"));
  for (const wp of wildcardPermissions) {
    const prefix = wp.slice(0, -2);
    if (requiredPermission.startsWith(prefix)) return true;
  }

  const parts = requiredPermission.split(".");
  if (parts.length > 2) {
    const modulePermission = `${parts[0]}.view`;
    if (userPermissions.includes(modulePermission)) return true;
  }

  return false;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
