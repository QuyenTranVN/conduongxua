import type { ApiErrorResponse, PaginationMeta } from '../types/api'

export const DEFAULT_PAGE_SIZE = 20
export const MAX_PAGE_SIZE = 100

export function getPagination(pageValue?: string, pageSizeValue?: string) {
  const page = positiveInteger(pageValue, 1)
  const pageSize = Math.min(
    positiveInteger(pageSizeValue, DEFAULT_PAGE_SIZE),
    MAX_PAGE_SIZE,
  )

  return {
    page,
    pageSize,
    from: (page - 1) * pageSize,
    to: page * pageSize - 1,
  }
}

export function paginationMeta(
  page: number,
  pageSize: number,
  total: number,
): PaginationMeta {
  return {
    page,
    pageSize,
    total,
    totalPages: total === 0 ? 0 : Math.ceil(total / pageSize),
  }
}

export function apiError(code: string, message: string): ApiErrorResponse {
  return { error: { code, message } }
}

function positiveInteger(value: string | undefined, fallback: number): number {
  const parsed = Number.parseInt(value ?? '', 10)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback
}
