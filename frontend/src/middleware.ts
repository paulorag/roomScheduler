import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

interface JwtPayload {
    sub?: string;
    role?: string;
    exp?: number;
}

function parseJwt(token: string): JwtPayload | null {
    try {
        const base64Url = token.split(".")[1];
        if (!base64Url) return null;
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split("")
                .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
                .join("")
        );
        return JSON.parse(jsonPayload);
    } catch {
        return null;
    }
}

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const token = request.cookies.get("room_token")?.value;

    const isAuthRoute = pathname.startsWith("/login") || pathname.startsWith("/register");
    const isProtectedRoute = pathname.startsWith("/my-bookings");
    const isAdminRoute = pathname.startsWith("/admin");

    if (token) {
        const payload = parseJwt(token);
        const isExpired = payload?.exp ? payload.exp * 1000 < Date.now() : true;

        if (isExpired) {
            const response = NextResponse.redirect(new URL(`/login?redirect=${encodeURIComponent(pathname)}`, request.url));
            response.cookies.delete("room_token");
            return response;
        }

        if (isAuthRoute) {
            return NextResponse.redirect(new URL("/", request.url));
        }

        if (isAdminRoute && payload?.role !== "ADMIN") {
            return NextResponse.redirect(new URL("/", request.url));
        }
    } else {
        if (isProtectedRoute || isAdminRoute) {
            return NextResponse.redirect(new URL(`/login?redirect=${encodeURIComponent(pathname)}`, request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/admin/:path*", "/my-bookings/:path*", "/login", "/register"],
};
