/** @format */

import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { settingsService } from '../services/settingsService.js'
import { readLocalJson, writeLocalJson } from '../services/localStorageService.js'

const Ctx = createContext(null)
export const useApp = () => useContext(Ctx)

export function AppProvider({ children }) {
  const [tab, setTab] = useState('home')
  const [stack, setStack] = useState([]) // navigation stack of {name, id}
  const [route, setRoute] = useState({ name: 'home' })
  const [sheet, setSheet] = useState(null) // {type, ...}
  const [drawer, setDrawer] = useState(false)
  const [theme, setThemeState] = useState(settingsService.getTheme)
  const [lang, setLangState] = useState(settingsService.getLanguage)
  const [splash, setSplash] = useState(true)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    settingsService.saveTheme(theme)
  }, [theme])
  useEffect(() => {
    document.documentElement.lang = lang
    settingsService.saveLanguage(lang)
  }, [lang])
  useEffect(() => {
    const t = setTimeout(() => setSplash(false), 900)
    return () => clearTimeout(t)
  }, [])

  const setTheme = (nextTheme) => setThemeState(['light', 'dark'].includes(nextTheme) ? nextTheme : 'light')
  const setLang = (nextLanguage) => setLangState(['vi', 'en'].includes(nextLanguage) ? nextLanguage : 'vi')

  // ── navigation ─────────────────────────────────────────
  const go = (name, id) => {
    setStack((s) => [...s, route])
    setRoute({ name, id })
  }
  const back = () => {
    const prev = stack[stack.length - 1]
    setRoute(prev || { name: tab })
    setStack((s) => s.slice(0, -1))
  }
  const switchTab = (t) => {
    setTab(t)
    setStack([])
    setRoute({ name: t })
  }

  // ── saved state ────────────────────────────────────────
  const readIdSet = (key) => {
    const saved = readLocalJson(key, [])
    return new Set(Array.isArray(saved) ? saved.filter((id) => typeof id === 'string') : [])
  }
  const [bookmarks, setBookmarks] = useState(() => readIdSet('con-duong-xua:bookmarks'))
  const [downloads, setDownloads] = useState(() => readIdSet('con-duong-xua:downloads'))
  const toggleSet = (setter, key) => (id) =>
    setter((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      writeLocalJson(key, [...next])
      return next
    })

  const value = useMemo(
    () => ({
      tab,
      switchTab,
      route,
      go,
      back,
      stack,
      sheet,
      setSheet,
      drawer,
      setDrawer,
      theme,
      setTheme,
      lang,
      setLang,
      splash,
      setSplash,
      bookmarks,
      toggleBookmark: toggleSet(setBookmarks, 'con-duong-xua:bookmarks'),
      downloads,
      toggleDownload: toggleSet(setDownloads, 'con-duong-xua:downloads'),
    }),
    [
      tab,
      route,
      stack,
      sheet,
      drawer,
      theme,
      lang,
      splash,
      bookmarks,
      downloads,
    ],
  )

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}
