"use client"

import { useSyncExternalStore } from "react"
import type { Transaction } from "@/lib/portfolio-data"
import { createTransactionStore, TRANSACTIONS_STORAGE_KEY } from "@/lib/transaction-storage"

const store = createTransactionStore(() => window.localStorage)
let subscriberCount = 0

function reportError(error: unknown) {
  window.alert(error instanceof Error ? error.message : "Your portfolio could not be saved.")
}

function mutate(action: () => void): boolean {
  try {
    action()
    return true
  } catch (error) {
    reportError(error)
    return false
  }
}

function reload() {
  try {
    store.reload()
  } catch (error) {
    reportError(error)
  }
}

function onStorage(event: StorageEvent) {
  if (event.storageArea === window.localStorage &&
      (event.key === TRANSACTIONS_STORAGE_KEY || event.key === null)) reload()
}

export const getTransactions = store.getSnapshot
export const setTransactions = (next: Transaction[]) => mutate(() => store.set(next))
export const addTransactions = (next: Transaction[]) => mutate(() => store.add(next))
export const updateTransaction = (id: string, patch: Partial<Omit<Transaction, "id">>) =>
  mutate(() => store.update(id, patch))
export const removeTransaction = (id: string) => mutate(() => store.remove(id))
export const clearTransactions = () => mutate(() => store.clear())

export const subscribeToTransactions = (listener: () => void) => {
  const unsubscribe = store.subscribe(listener)
  if (subscriberCount++ === 0) {
    window.addEventListener("storage", onStorage)
    reload()
  }
  return () => {
    unsubscribe()
    if (--subscriberCount === 0) window.removeEventListener("storage", onStorage)
  }
}

export const useTransactions = () =>
  useSyncExternalStore(subscribeToTransactions, getTransactions, store.getServerSnapshot)
