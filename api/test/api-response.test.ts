import assert from 'node:assert/strict'
import test from 'node:test'
import { getPagination, paginationMeta } from '../src/lib/api-response'

test('pagination uses safe defaults and caps page size', () => {
  assert.deepEqual(getPagination(undefined, undefined), {
    page: 1,
    pageSize: 20,
    from: 0,
    to: 19,
  })

  assert.deepEqual(getPagination('3', '500'), {
    page: 3,
    pageSize: 100,
    from: 200,
    to: 299,
  })
})

test('pagination metadata reports totals consistently', () => {
  assert.deepEqual(paginationMeta(2, 20, 45), {
    page: 2,
    pageSize: 20,
    total: 45,
    totalPages: 3,
  })
})
