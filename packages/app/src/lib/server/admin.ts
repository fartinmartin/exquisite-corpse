import { createHmac, timingSafeEqual } from "node:crypto";
import { error, type Cookies } from "@sveltejs/kit";

const COOKIE = "ecc_admin";

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

  const expected = hmac(issued);
  const actual = Buffer.from(signature);
  const wanted = Buffer.from(expected);
  if (actual.length !== wanted.length) return false;
  return timingSafeEqual(actual, wanted);
}

/** Throws 401 unless the current request carries a valid admin cookie. */
export function requireAdmin(cookies: Cookies): void {
  if (!isAdmin(cookies)) error(401, "not authorised");
}

export { COOKIE as ADMIN_COOKIE };
