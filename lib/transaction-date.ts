/** Accept ISO dates and the M/D/YYYY format used by older OpenStocky exports. */
export function normalizeTransactionDate(value: string): string | null {
  const text = value.trim()
  const iso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(text)
  const legacy = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(text)
  if (!iso && !legacy) return null

  const year = Number(iso ? iso[1] : legacy![3])
  const month = Number(iso ? iso[2] : legacy![1])
  const day = Number(iso ? iso[3] : legacy![2])
  const date = new Date(0)
  date.setUTCFullYear(year, month - 1, day)
  if (
    year < 1 || date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day
  ) return null

  return `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`
}
