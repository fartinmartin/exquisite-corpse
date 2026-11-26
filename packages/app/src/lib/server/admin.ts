import { createHmac, timingSafeEqual } from "node:crypto";
import { error, type Cookies } from "@sveltejs/kit";

const COOKIE = "ecc_admin";

/** Admin sessions last a day. Checked server-side: the cookie's own expiry is only a hint. */
export const SESSION_MS = 24 * 60 * 60 * 1000;

function secret(): string {
  const value = process.env.ECC_ADMIN_PASSWORD;
  if (!value) throw new Error("ECC_ADMIN_PASSWORD is not set");
  return value;
}

function hmac(value: string): string {
  return createHmac("sha256", secret()).update(value).digest("hex");
}

/** Signs a timestamp so the cookie can be verified without server storage. */
export function adminToken(): string {
  const issued = Date.now().toString();
  return `${issued}.${hmac(issued)}`;
}

export function isAdmin(cookies: Cookies): boolean {
  const token = cookies.get(COOKIE);
  if (!token) return false;

  const [issued, signature] = token.split(".");
  if (!issued || !signature) return false;

  // A signed but old token (say, from a leaked cookie) is rejected.
  const age = Date.now() - Number(issued);
  if (!Number.isFinite(age) || age < 0 || age > SESSION_MS) return false;

  const expected = hmac(issued);
  const actual = Buffer.from(signature);
  const wanted = Buffer.from(expected);
  if (actual.length !== wanted.length) return false;
  return timingSafeEqual(actual, wanted);
}

/**
 * Constant-time password check. Both sides are HMAC'd first so the comparison
 * is always over equal-length buffers, whatever was typed.
 */
export function checkPassword(password: string): boolean {
  const expected = process.env.ECC_ADMIN_PASSWORD;
  if (!expected) return false;
  return timingSafeEqual(Buffer.from(hmac(password)), Buffer.from(hmac(expected)));
}

/** Throws 401 unless the current request carries a valid admin cookie. */
export function requireAdmin(cookies: Cookies): void {
  if (!isAdmin(cookies)) error(401, "not authorised");
}

export { COOKIE as ADMIN_COOKIE };
