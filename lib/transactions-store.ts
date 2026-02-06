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
