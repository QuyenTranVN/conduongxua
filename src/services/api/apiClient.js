const DEFAULT_TIMEOUT_MS = 10_000

export class ApiError extends Error {
  constructor(message, { code = 'API_ERROR', status = 0, cause } = {}) {
    super(message, { cause })
    this.name = 'ApiError'
    this.code = code
    this.status = status
  }
}

export async function apiGet(path, { signal, timeoutMs = DEFAULT_TIMEOUT_MS } = {}) {
  const baseUrl = getApiBaseUrl()
  const timeoutController = new AbortController()
  const timeoutId = setTimeout(() => timeoutController.abort(), timeoutMs)
  const requestSignal = combineSignals(signal, timeoutController.signal)

  try {
    const response = await fetch(`${baseUrl}${normalizePath(path)}`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal: requestSignal,
    })

    const payload = await parseJson(response)

    if (!response.ok) {
      throw new ApiError(
        payload?.error?.message || 'Không thể tải dữ liệu. Vui lòng thử lại.',
        {
          code: payload?.error?.code || 'HTTP_ERROR',
          status: response.status,
        },
      )
    }

    if (!payload || !Object.prototype.hasOwnProperty.call(payload, 'data')) {
      throw new ApiError('Phản hồi API không hợp lệ.', { code: 'INVALID_RESPONSE' })
    }

    return payload
  } catch (error) {
    if (error instanceof ApiError) throw error
    if (requestSignal.aborted) {
      throw new ApiError('Yêu cầu mất quá nhiều thời gian.', {
        code: 'REQUEST_TIMEOUT',
        cause: error,
      })
    }
    throw new ApiError('Không thể kết nối đến máy chủ.', {
      code: 'NETWORK_ERROR',
      cause: error,
    })
  } finally {
    clearTimeout(timeoutId)
  }
}

function getApiBaseUrl() {
  const value = import.meta.env.VITE_API_URL?.trim()
  if (!value) {
    throw new ApiError('Thiếu cấu hình VITE_API_URL.', {
      code: 'API_URL_MISSING',
    })
  }
  return value.replace(/\/$/, '')
}

function normalizePath(path) {
  return path.startsWith('/') ? path : `/${path}`
}

async function parseJson(response) {
  try {
    return await response.json()
  } catch (error) {
    throw new ApiError('Máy chủ trả về dữ liệu không hợp lệ.', {
      code: 'INVALID_JSON',
      status: response.status,
      cause: error,
    })
  }
}

function combineSignals(externalSignal, timeoutSignal) {
  if (!externalSignal) return timeoutSignal
  if (typeof AbortSignal.any === 'function') {
    return AbortSignal.any([externalSignal, timeoutSignal])
  }

  const controller = new AbortController()
  const abort = () => controller.abort()
  externalSignal.addEventListener('abort', abort, { once: true })
  timeoutSignal.addEventListener('abort', abort, { once: true })
  return controller.signal
}
