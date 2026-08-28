const APP_PREFIX = 'con-duong-xua:'

export function readLocalJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    if (raw === null) return fallback
    const value = JSON.parse(raw)
    return value ?? fallback
  } catch { return fallback }
}

export function writeLocalJson(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); return true } catch { return false }
}

export function readLocalEnum(key, allowed, fallback) {
  try {
    const value = localStorage.getItem(key)
    return allowed.includes(value) ? value : fallback
  } catch { return fallback }
}

export function writeLocalValue(key, value) {
  try { localStorage.setItem(key, String(value)); return true } catch { return false }
}

export function clearAppLocalData() {
  try {
    const keys = Array.from({ length: localStorage.length }, (_, index) => localStorage.key(index)).filter((key) => key?.startsWith(APP_PREFIX))
    keys.forEach((key) => localStorage.removeItem(key))
    return true
  } catch { return false }
}
