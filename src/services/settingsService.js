import { readLocalEnum, writeLocalValue } from './localStorageService.js'

const LANGUAGE_KEY = 'con-duong-xua:language'
const THEME_KEY = 'con-duong-xua:theme'
const LANGUAGES = ['vi', 'en']
const THEMES = ['light', 'dark']

export const settingsService = {
  getLanguage: () => readLocalEnum(LANGUAGE_KEY, LANGUAGES, 'vi'),
  saveLanguage: (language) => writeLocalValue(LANGUAGE_KEY, LANGUAGES.includes(language) ? language : 'vi'),
  getTheme: () => readLocalEnum(THEME_KEY, THEMES, 'light'),
  saveTheme: (theme) => writeLocalValue(THEME_KEY, THEMES.includes(theme) ? theme : 'light'),
}
