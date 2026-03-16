import { createContext } from "./context.js";

export namespace Log {
  const ctx = createContext<{ tags: Record<string, unknown> }>();

  export function create(tags: Record<string, unknown> = {}) {
    const fmt = (extra?: Record<string, unknown>) =>
      Object.entries({ ...use().tags, ...tags, ...extra })
        .map(([k, v]) => `${k}=${v}`)
        .join(" ");

    const log = {
      info: (msg: string, extra?: Record<string, unknown>) => (console.log(fmt(extra), msg), log),
      warn: (msg: string, extra?: Record<string, unknown>) => (console.warn(fmt(extra), msg), log),
      error: (err: Error, extra?: Record<string, unknown>) => (console.error(fmt(extra), err), log),
      tag: (key: string, value: unknown) => (tags = { ...tags, [key]: value }, log),
      clone: () => Log.create({ ...tags }),
    };

    return log;
  }

  export function provide<R>(tags: Record<string, unknown>, fn: () => R): R {
    return ctx.provide({ tags: { ...use().tags, ...tags } }, fn);
  }

  function use() {
    try {
      return ctx.use();
    } catch {
      return { tags: {} };
    }
  }
}
