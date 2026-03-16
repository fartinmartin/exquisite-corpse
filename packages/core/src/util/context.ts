import { AsyncLocalStorage } from "node:async_hooks";

export function createContext<T>() {
  const storage = new AsyncLocalStorage<T>();
  return {
    use(): T {
      const value = storage.getStore();
      if (!value) throw new Error("No context available");
      return value;
    },
    provide<R>(value: T, fn: () => R): R {
      return storage.run(value, fn);
    },
  };
}
