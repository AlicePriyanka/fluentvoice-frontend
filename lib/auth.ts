import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import type { JwtPayload } from "./types";

const COOKIE_NAME = "fv_token";
const EXPIRES_IN = 60 * 60 * 24 * 7; // 7 days in seconds

function getSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not set");
  return new TextEncoder().encode(secret);
}

export async function signToken(payload: Omit<JwtPayload, "iat" | "exp">): Promise<string> {
  return new SignJWT(payload as Record<string, unknown>)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${EXPIRES_IN}s`)
    .sign(getSecret());
}

export async function verifyToken(token: string): Promise<JwtPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return payload as unknown as JwtPayload;
  } catch {
    return null;
  }
}

/** Read and verify the JWT from the request cookie store (Server Components / Route Handlers) */
export async function getAuthUser(): Promise<JwtPayload | null> {
  try {
    const store = await cookies();
    const token = store.get(COOKIE_NAME)?.value;
    if (!token) return null;
    return verifyToken(token);
  } catch {
    return null;
  }
}

/** Cookie options for set/clear */
export const cookieOptions = {
  name: COOKIE_NAME,
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: EXPIRES_IN,
};
