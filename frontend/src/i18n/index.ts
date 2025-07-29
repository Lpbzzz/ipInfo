import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

// 导入语言资源
import zhCN from './locales/zh-CN.json'
import zhTW from './locales/zh-TW.json'
import en from './locales/en.json'
import ja from './locales/ja.json'
import ko from './locales/ko.json'

// 支持的语言列表
export const SUPPORTED_LANGUAGES = {
  'zh-CN': { name: '简体中文', nativeName: '简体中文', flag: '🇨🇳' },
  'zh-TW': { name: '繁體中文', nativeName: '繁體中文', flag: '🇹🇼' },
  'en': { name: 'English', nativeName: 'English', flag: '🇺🇸' },
  'ja': { name: '日本語', nativeName: '日本語', flag: '🇯🇵' },
  'ko': { name: '한국어', nativeName: '한국어', flag: '🇰🇷' }
} as const

export type SupportedLanguage = keyof typeof SUPPORTED_LANGUAGES

// 默认语言
export const DEFAULT_LANGUAGE: SupportedLanguage = 'zh-CN'

// 语言映射 - 处理浏览器语言到支持语言的映射
const LANGUAGE_MAPPING: Record<string, SupportedLanguage> = {
  'zh': 'zh-CN',
  'zh-cn': 'zh-CN',
  'zh-hans': 'zh-CN',
  'zh-tw': 'zh-TW',
  'zh-hant': 'zh-TW',
  'en': 'en',
  'en-us': 'en',
  'en-gb': 'en',
  'ja': 'ja',
  'ja-jp': 'ja',
  'ko': 'ko',
  'ko-kr': 'ko'
}

// 获取最佳匹配语言
export const getBestMatchLanguage = (detectedLanguage: string): SupportedLanguage => {
  const normalizedLang = detectedLanguage.toLowerCase()
  
  // 直接匹配
  if (normalizedLang in SUPPORTED_LANGUAGES) {
    return normalizedLang as SupportedLanguage
  }
  
  // 映射匹配
  if (normalizedLang in LANGUAGE_MAPPING) {
    return LANGUAGE_MAPPING[normalizedLang]
  }
  
  // 前缀匹配
  for (const [key, value] of Object.entries(LANGUAGE_MAPPING)) {
    if (normalizedLang.startsWith(key)) {
      return value
    }
  }
  
  // 返回默认语言
  return DEFAULT_LANGUAGE
}

// 语言检测器配置
const languageDetector = new LanguageDetector()
languageDetector.addDetector({
  name: 'customDetector',
  lookup() {
    // 1. 从 localStorage 获取用户选择的语言
    const savedLanguage = localStorage.getItem('preferred-language')
    if (savedLanguage && savedLanguage in SUPPORTED_LANGUAGES) {
      return savedLanguage
    }
    
    // 2. 从浏览器语言检测
    const browserLanguages = navigator.languages || [navigator.language]
    for (const lang of browserLanguages) {
      const matchedLang = getBestMatchLanguage(lang)
      if (matchedLang !== DEFAULT_LANGUAGE || lang.toLowerCase().includes('zh')) {
        return matchedLang
      }
    }
    
    // 3. 返回默认语言
    return DEFAULT_LANGUAGE
  },
  cacheUserLanguage(lng: string) {
    if (lng in SUPPORTED_LANGUAGES) {
      localStorage.setItem('preferred-language', lng)
      // 记录语言使用历史
      const history = JSON.parse(localStorage.getItem('language-history') || '[]')
      const newHistory = [lng, ...history.filter((l: string) => l !== lng)].slice(0, 3)
      localStorage.setItem('language-history', JSON.stringify(newHistory))
    }
  }
})

// 初始化 i18n
i18n
  .use(languageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      'zh-CN': { translation: zhCN },
      'zh-TW': { translation: zhTW },
      'en': { translation: en },
      'ja': { translation: ja },
      'ko': { translation: ko }
    },
    
    fallbackLng: DEFAULT_LANGUAGE,
    
    detection: {
      order: ['customDetector', 'localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: 'preferred-language'
    },
    
    interpolation: {
      escapeValue: false
    },
    
    react: {
      useSuspense: false
    }
  })

export default i18n