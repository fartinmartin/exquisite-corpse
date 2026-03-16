import { nanoid } from "nanoid";

export const prefixes = {
  section: "sec",
  corpse: "cps",
  guest: "gst",
  like: "lke",
} as const;

export function createID(prefix: keyof typeof prefixes): string {
  return `${prefixes[prefix]}_${nanoid()}`;
}
