import type { Transaction } from "./portfolio-data"

export const TRANSACTIONS_STORAGE_KEY = "openstocky:transactions"
const STORAGE_VERSION = 1

type TransactionStorage = Pick<Storage, "getItem" | "setItem">

function validateTransactions(value: unknown): asserts value is Transaction[] {
  if (!Array.isArray(value)) throw new Error("Invalid saved transactions.")
  const ids = new Set<string>()
  for (const tx of value) {
    if (
      !tx || typeof tx !== "object" ||
      typeof tx.id !== "string" || !tx.id || ids.has(tx.id) ||
      typeof tx.date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(tx.date) ||
      !Number.isFinite(Date.parse(tx.date)) ||
      (tx.type !== "buy" && tx.type !== "sell") ||
      typeof tx.symbol !== "string" || !tx.symbol.trim() ||
      ![tx.shares, tx.pricePerShare, tx.fees, tx.transactionCost].every(
        (n) => typeof n === "number" && Number.isFinite(n),
      ) ||
      (tx.comments !== undefined && typeof tx.comments !== "string")
    ) throw new Error("Invalid saved transaction. Existing data has been left untouched.")
    ids.add(tx.id)
  }
}

/** Browser storage is injected so server rendering never reads or writes it. */
export function createTransactionStore(getStorage: () => TransactionStorage) {
  let current: Transaction[] = []
  const serverSnapshot: Transaction[] = []
  const listeners = new Set<() => void>()
  const notify = () => listeners.forEach((listener) => listener())

  function read(): Transaction[] {
    let raw: string | null
    try {
      raw = getStorage().getItem(TRANSACTIONS_STORAGE_KEY)
    } catch {
      throw new Error("Browser storage is unavailable. Allow site storage to save your portfolio.")
    }
    if (raw === null) return []
    try {
      const saved = JSON.parse(raw)
      if (!saved || saved.version !== STORAGE_VERSION) throw new Error("Unsupported version")
      validateTransactions(saved.transactions)
      return saved.transactions
    } catch {
      throw new Error("Your saved portfolio could not be read. It has been left untouched. Restore access to the saved data or use Clear portfolio to start again.")
    }
  }

  function commit(next: Transaction[]) {
    validateTransactions(next)
    try {
      // Persist before publishing: a failed write must not appear to have saved.
      getStorage().setItem(TRANSACTIONS_STORAGE_KEY, JSON.stringify({
        version: STORAGE_VERSION,
        transactions: next,
      }))
    } catch {
      throw new Error("Could not save to this browser. Your previous portfolio is unchanged. Free up browser storage or allow site storage and try again.")
    }
    current = [...next]
    notify()
  }

  return {
    getSnapshot: () => current,
    getServerSnapshot: () => serverSnapshot,
    subscribe: (listener: () => void) => {
      listeners.add(listener)
      return () => { listeners.delete(listener) }
    },
    reload: () => {
      current = read()
      notify()
    },
    set: (next: Transaction[]) => {
      read() // Do not silently overwrite unreadable or newer-version data.
      commit(next)
    },
    add: (next: Transaction[]) => commit([...read(), ...next]),
    update: (id: string, patch: Partial<Omit<Transaction, "id">>) => {
      const latest = read()
      if (!latest.some((tx) => tx.id === id)) throw new Error("This transaction no longer exists. Refresh your portfolio.")
      commit(latest.map((tx) => tx.id === id ? { ...tx, ...patch, id } : tx))
    },
    remove: (id: string) => commit(read().filter((tx) => tx.id !== id)),
    // Explicit confirmation in the UI permits resetting even unreadable data.
    clear: () => commit([]),
  }
}
