import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const COOKIE_NAME = "fv_token";

function getSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not set");
  return new TextEncoder().encode(secret);
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isPatient   = pathname.startsWith("/patient");
  const isTherapist = pathname.startsWith("/therapist");
  const isSettings  = pathname.startsWith("/settings");

  if (!isPatient && !isTherapist && !isSettings) return NextResponse.next();

  const token = req.cookies.get(COOKIE_NAME)?.value;

  if (!token) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  try {
    const { payload } = await jwtVerify(token, getSecret());
    const role = payload.role as string | undefined;

    // Role-gated routes: wrong role → redirect to their own dashboard
    if (isTherapist && role !== "therapist") {
      // Patient accidentally on therapist route → send to patient dashboard
      return NextResponse.redirect(new URL("/patient", req.url));
    }
    if (isPatient && role !== "patient") {
      // Therapist accidentally on patient route → send to therapist dashboard
      return NextResponse.redirect(new URL("/therapist", req.url));
    }

    return NextResponse.next();
  } catch {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("from", pathname);
    const res = NextResponse.redirect(loginUrl);
    res.cookies.set({ name: COOKIE_NAME, value: "", maxAge: 0, path: "/" });
    return res;
  }
}

export const config = {
  matcher: ["/patient/:path*", "/therapist/:path*", "/settings/:path*"],
};
