/** @format */

import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const Ctx = createContext(null)
export const useApp = () => useContext(Ctx)

export function AppProvider({ children }) {
  const [tab, setTab] = useState('home')
  const [stack, setStack] = useState([]) // navigation stack of {name, id}
  const [route, setRoute] = useState({ name: 'home' })
  const [sheet, setSheet] = useState(null) // {type, ...}
  const [drawer, setDrawer] = useState(false)
  const [theme, setTheme] = useState('light')
  const [lang, setLang] = useState('vi')
  const [splash, setSplash] = useState(true)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])
  useEffect(() => {
    const t = setTimeout(() => setSplash(false), 2200)
    return () => clearTimeout(t)
  }, [])

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
  const [bookmarks, setBookmarks] = useState(new Set(['t1']))
  const [downloads, setDownloads] = useState(new Set(['t1', 't3']))
  const toggleSet = (setter) => (id) =>
    setter((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
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
      toggleBookmark: toggleSet(setBookmarks),
      downloads,
      toggleDownload: toggleSet(setDownloads),
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
