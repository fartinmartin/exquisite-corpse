import { db } from "./index.js";
import { createContext } from "../util/context.js";

type Transaction = Parameters<Parameters<typeof db.transaction>[0]>[0];
type TxOrDb = Transaction | typeof db;

const TransactionContext = createContext<{
  tx: Transaction;
  effects: (() => void | Promise<void>)[];
}>();

/** Run a callback inside the current transaction if one exists, otherwise use the db directly. */
export async function useTransaction<T>(callback: (trx: TxOrDb) => Promise<T>): Promise<T> {
  try {
    const { tx } = TransactionContext.use();
    return callback(tx);
  } catch {
    return callback(db);
  }
}

/** Register a side effect to run after the current transaction commits (e.g. sending an email).
 *  If called outside a transaction, runs immediately. */
export async function afterTx(effect: () => void | Promise<void>): Promise<void> {
  try {
    const { effects } = TransactionContext.use();
    effects.push(effect);
  } catch {
    await effect();
  }
}

/** Open a transaction. Nested calls join the outer transaction rather than opening a new one. */
export async function createTransaction<T>(
  callback: (tx: Transaction) => Promise<T>
): Promise<T> {
  try {
    const { tx } = TransactionContext.use();
    return callback(tx);
  } catch {
    const effects: (() => void | Promise<void>)[] = [];
    const result = await db.transaction((tx) =>
      TransactionContext.provide({ tx, effects }, () => callback(tx))
    );
    await Promise.all(effects.map((fn) => fn()));
    return result;
  }
}
