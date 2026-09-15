import test from 'node:test'
import assert from 'node:assert/strict'
import { createTransactionStore, TRANSACTIONS_STORAGE_KEY } from '../lib/transaction-storage.ts'

const tx = (id, patch = {}) => ({
  id, date: '2026-09-15', type: 'buy', symbol: 'AAPL', shares: 2,
  pricePerShare: 100, fees: 1, transactionCost: 201, ...patch,
})
function fixture() {
  const values = new Map([['theme', 'dark']])
  const storage = {
    fail: false,
    getItem: key => values.get(key) ?? null,
    setItem(key, value) {
      if (this.fail) throw new Error('QuotaExceededError')
      values.set(key, value)
    },
  }
  return { values, storage, open: () => createTransactionStore(() => storage) }
}

test('add, edit, delete and batch replacement survive fresh store instances', () => {
  const f = fixture()
  const first = f.open()
  first.add([tx('one'), tx('two', { comments: 'Keep this note' })])
  const refreshed = f.open()
  refreshed.reload()
  assert.deepEqual(refreshed.getSnapshot(), first.getSnapshot())
  refreshed.update('one', { shares: 3, transactionCost: 301 })
  refreshed.remove('two')
  const reopened = f.open()
  reopened.reload()
  assert.deepEqual(reopened.getSnapshot(), [tx('one', { shares: 3, transactionCost: 301 })])
  reopened.set([tx('replacement')])
  first.reload()
  assert.deepEqual(first.getSnapshot(), [tx('replacement')])
})

test('clear persists an empty portfolio, not demo data, and preserves preferences', () => {
  const f = fixture()
  const store = f.open()
  store.add([tx('one')])
  store.clear()
  const reopened = f.open()
  reopened.reload()
  assert.deepEqual(reopened.getSnapshot(), [])
  assert.equal(f.values.get('theme'), 'dark')
  assert.deepEqual(JSON.parse(f.values.get(TRANSACTIONS_STORAGE_KEY)), { version: 1, transactions: [] })
})

test('failed writes preserve saved data, memory, and subscribers', () => {
  const f = fixture()
  const store = f.open()
  store.add([tx('one')])
  const before = f.values.get(TRANSACTIONS_STORAGE_KEY)
  let notifications = 0
  store.subscribe(() => notifications++)
  f.storage.fail = true
  for (const action of [() => store.add([tx('two')]), () => store.set([]), () => store.clear(), () => store.remove('one')]) {
    assert.throws(action, /Could not save/)
    assert.equal(f.values.get(TRANSACTIONS_STORAGE_KEY), before)
    assert.deepEqual(store.getSnapshot(), [tx('one')])
  }
  assert.equal(notifications, 0)
})

test('corrupt and unsupported saved data cannot be silently overwritten', () => {
  for (const raw of ['{broken', JSON.stringify({ version: 2, transactions: [] }), JSON.stringify({ version: 1, transactions: [{}] })]) {
    const f = fixture()
    f.values.set(TRANSACTIONS_STORAGE_KEY, raw)
    const store = f.open()
    assert.throws(() => store.reload(), /left untouched/)
    assert.throws(() => store.add([tx('one')]), /left untouched/)
    assert.throws(() => store.set([tx('one')]), /left untouched/)
    assert.equal(f.values.get(TRANSACTIONS_STORAGE_KEY), raw)
    store.clear() // Available only after explicit UI confirmation.
    assert.deepEqual(JSON.parse(f.values.get(TRANSACTIONS_STORAGE_KEY)).transactions, [])
  }
})

test('each mutation reads the latest saved data from other tabs', () => {
  const f = fixture()
  const a = f.open(), b = f.open()
  a.add([tx('one')])
  b.add([tx('two')])
  a.update('one', { fees: 2 })
  b.reload()
  assert.deepEqual(b.getSnapshot().map(t => t.id), ['one', 'two'])
  assert.equal(b.getSnapshot()[0].fees, 2)
  b.clear()
  assert.throws(() => a.update('one', { fees: 3 }), /no longer exists/)
  a.add([tx('three')])
  assert.deepEqual(a.getSnapshot(), [tx('three')])
})

test('server snapshots are stable, empty, and never access browser storage', () => {
  const store = createTransactionStore(() => { throw new Error('No browser') })
  assert.equal(store.getServerSnapshot(), store.getServerSnapshot())
  assert.deepEqual(store.getServerSnapshot(), [])
  assert.deepEqual(store.getSnapshot(), [])
  assert.throws(() => store.reload(), /storage is unavailable/)
})

test('reject invalid rows and duplicate IDs without damaging the portfolio', () => {
  const f = fixture(), store = f.open()
  store.add([tx('one')])
  const before = f.values.get(TRANSACTIONS_STORAGE_KEY)
  for (const row of [tx('one'), tx('two', { shares: NaN }), tx('two', { fees: Infinity }), tx('two', { symbol: '' })]) {
    assert.throws(() => store.add([row]), /Invalid saved transaction/)
    assert.equal(f.values.get(TRANSACTIONS_STORAGE_KEY), before)
  }
})
