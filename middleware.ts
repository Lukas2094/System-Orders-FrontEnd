// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
    const token = req.cookies.get("token")?.value;
    const { pathname } = req.nextUrl;

    const publicPaths = ["/login", "/register", "/reset-password"];

    if (!token && !publicPaths.includes(pathname)) {
        return NextResponse.redirect(new URL("/login", req.url));
    }

    if (token && publicPaths.includes(pathname)) {
        return NextResponse.redirect(new URL("/", req.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!_next|public|favicon.ico).*)"], 
};
