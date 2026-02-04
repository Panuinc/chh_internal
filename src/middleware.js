import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { getProtectedRoutes } from "@/config/menu.config";
import { generateRequestId } from "@/lib/requestContext";

const publicRoutes = ["/signIn", "/api/auth"];
const protectedRoutes = getProtectedRoutes();

export default auth((req) => {
  const { nextUrl, auth: session } = req;
  const pathname = nextUrl.pathname;

  const existingRequestId = req.headers.get("x-request-id");
  const requestId = existingRequestId || generateRequestId();

  const isPublicRoute = publicRoutes.some(
    (route) => pathname === route || pathname.startsWith("/api/auth")
  );

  if (pathname === "/") {
    if (session) {
      const response = NextResponse.redirect(new URL("/home", nextUrl.origin));
      response.headers.set("x-request-id", requestId);
      return response;
    } else {
      const response = NextResponse.redirect(new URL("/signIn", nextUrl.origin));
      response.headers.set("x-request-id", requestId);
      return response;
    }
  }

  if (!session && !isPublicRoute) {
    const signInUrl = new URL("/signIn", nextUrl.origin);
    signInUrl.searchParams.set("callbackUrl", pathname);
    const response = NextResponse.redirect(signInUrl);
    response.headers.set("x-request-id", requestId);
    return response;
  }

  if (session && pathname === "/signIn") {
    const response = NextResponse.redirect(new URL("/home", nextUrl.origin));
    response.headers.set("x-request-id", requestId);
    return response;
  }

  if (session && !isPublicRoute) {
    const user = session.user;

    if (user.isSuperAdmin) {
      const response = NextResponse.next();
      response.headers.set("x-request-id", requestId);
      return response;
    }

    const matchedRoute = findMatchingRoute(pathname, protectedRoutes);

    if (matchedRoute) {
      const { config } = matchedRoute;

      if (config.requireSuperAdmin) {
        const response = NextResponse.redirect(new URL("/forbidden", nextUrl.origin));
        response.headers.set("x-request-id", requestId);
        return response;
      }

      if (!hasPermission(user.permissions, config.permission)) {
        const response = NextResponse.redirect(new URL("/forbidden", nextUrl.origin));
        response.headers.set("x-request-id", requestId);
        return response;
      }
    }
  }

  const response = NextResponse.next();
  response.headers.set("x-request-id", requestId);
  return response;
});

function findMatchingRoute(pathname, routes) {
  const sortedRoutes = Object.entries(routes).sort(
    ([a], [b]) => b.length - a.length
  );

  for (const [route, config] of sortedRoutes) {
    if (pathname === route || pathname.startsWith(route + "/")) {
      return { route, config };
    }
  }

  return null;
}

function hasPermission(userPermissions, requiredPermission) {
  if (!userPermissions || !requiredPermission) return false;

  if (userPermissions.includes(requiredPermission)) return true;

  const wildcardPermissions = userPermissions.filter((p) => p.endsWith(".*"));
  for (const wp of wildcardPermissions) {
    const prefix = wp.slice(0, -2);
    if (requiredPermission.startsWith(prefix + ".")) return true;
  }

  return false;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
