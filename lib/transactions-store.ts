"use client"

import { useSyncExternalStore } from "react"
import { transactions as seedTransactions, type Transaction } from "@/lib/portfolio-data"

let currentTransactions = [...seedTransactions]
const listeners = new Set<() => void>()

const notify = () => {
  for (const listener of listeners) {
    listener()
  }
}

export const getTransactions = () => currentTransactions

export const setTransactions = (next: Transaction[]) => {
  currentTransactions = [...next]
  notify()
}

export const addTransactions = (next: Transaction[]) => {
  currentTransactions = [...currentTransactions, ...next]
  notify()
}

export const updateTransaction = (id: string, patch: Partial<Omit<Transaction, "id">>) => {
  const index = currentTransactions.findIndex((tx) => tx.id === id)
  if (index === -1) return
  currentTransactions = [
    ...currentTransactions.slice(0, index),
    { ...currentTransactions[index], ...patch },
    ...currentTransactions.slice(index + 1),
  ]
  notify()
}

export const removeTransaction = (id: string) => {
  currentTransactions = currentTransactions.filter((tx) => tx.id !== id)
  notify()
}

export const subscribeToTransactions = (listener: () => void) => {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export const useTransactions = () =>
  useSyncExternalStore(
    subscribeToTransactions,
    getTransactions,
    getTransactions,
  )
