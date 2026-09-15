import test from 'node:test'
import assert from 'node:assert/strict'
import { normalizeTransactionDate } from '../lib/transaction-date.ts'
import { createTransactionStore } from '../lib/transaction-storage.ts'

test('legacy export dates normalize as month/day/year, including ambiguous dates', () => {
  assert.equal(normalizeTransactionDate('11/27/2017'), '2017-11-27')
  assert.equal(normalizeTransactionDate('3/9/2018'), '2018-03-09')
  assert.equal(normalizeTransactionDate('1/2/2020'), '2020-01-02')
  assert.equal(normalizeTransactionDate(' 09/09/2026 '), '2026-09-09')
})

test('ISO dates and leap days remain valid without timezone shifts', () => {
  assert.equal(normalizeTransactionDate('2026-09-09'), '2026-09-09')
  assert.equal(normalizeTransactionDate('2/29/2024'), '2024-02-29')
  assert.equal(normalizeTransactionDate('2000-02-29'), '2000-02-29')
})

test('reject impossible dates rather than rolling into the following month', () => {
  for (const date of ['2/29/2023', '2026-02-30', '4/31/2026', '0/1/2026', '13/1/2026', '1/0/2026', '31/12/2026', '1900-02-29', '', 'not a date', '2026-09-09junk']) {
    assert.equal(normalizeTransactionDate(date), null, date)
  }
})

test('a legacy-format CSV row passes storage validation and survives reopening', () => {
  const [rawDate, type, symbol, shares, price, fees] = '11/27/2017,Buy,TEST,2,100.50,1'.split(',')
  let saved = null
  const storage = { getItem: () => saved, setItem: (_key, value) => { saved = value } }
  const store = createTransactionStore(() => storage)
  store.add([{
    id: 'legacy-csv', date: normalizeTransactionDate(rawDate), type: type.toLowerCase(), symbol,
    shares: Number(shares), pricePerShare: Number(price), fees: Number(fees),
    transactionCost: Number(shares) * Number(price) + Number(fees),
  }])
  const reopened = createTransactionStore(() => storage)
  reopened.reload()
  assert.equal(reopened.getSnapshot()[0].date, '2017-11-27')
  assert.equal(reopened.getSnapshot()[0].transactionCost, 202)
})
