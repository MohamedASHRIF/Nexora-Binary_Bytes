"use client"

import { useState, useCallback } from "react"

type Language = 'en' | 'si' | 'ta'

interface Translations {
  [key: string]: {
    en: string
    si: string
    ta: string
  }
}

// Common translations
const translations: Translations = {
  welcome: {
    en: "Hello! I'm your campus assistant. How can I help you today?",
    si: "ආයුබෝවන්! මම ඔබේ පරිසර සහායකයායි. මට ඔබට කෙසේ උදව් කළ හැකිද?",
    ta: "வணக்கம்! நான் உங்கள் வளாக உதவியாளர். இன்று உங்களுக்கு எப்படி உதவ முடியும்?"
  },
  offline: {
    en: "You're currently offline. I'll try to use cached data, but some features may be limited.",
    si: "ඔබ දැනට අන්තර්ජාලයට සම්බන්ධ නැත. මම කෑෂ් කළ දත්ත භාවිතා කරන්නම්, නමුත් සමහර විශේෂාංග සීමිත විය හැකිය.",
    ta: "நீங்கள் தற்போது ஆஃப்லைனில் உள்ளீர்கள். நான் கேஷ் செய்யப்பட்ட தரவைப் பயன்படுத்த முயற்சிப்பேன், ஆனால் சில அம்சங்கள் கட்டுப்படுத்தப்படலாம்."
  },
  error: {
    en: "Sorry, I encountered an error. Please try again.",
    si: "සමාවෙන්න, මට දෝෂයක් ඇති විය. කරුණාකර නැවත උත්සාහ කරන්න.",
    ta: "மன்னிக்கவும், நான் ஒரு பிழையை சந்தித்தேன். தயவுசெய்து மீண்டும் முயற்சிக்கவும்."
  },
  schedule: {
    en: "Here's your class schedule",
    si: "මෙන්න ඔබේ පන්ති කාලසටහන",
    ta: "இதோ உங்கள் வகுப்பு அட்டவணை"
  },
  bus: {
    en: "Here are the upcoming bus schedules",
    si: "මෙන්න ඉදිරි බස් කාලසටහන්",
    ta: "இதோ வரவிருக்கும் பேருந்து அட்டவணைகள்"
  },
  menu: {
    en: "Today's cafeteria menu",
    si: "අද ආහාරශාලා මෙනුව",
    ta: "இன்றைய உணவக மெனு"
  },
  events: {
    en: "Upcoming events",
    si: "ඉදිරි සිදුවීම්",
    ta: "வரவிருக்கும் நிகழ்வுகள்"
  }
}

export const useLanguage = () => {
  const [language, setLanguage] = useState<Language>('en')

  const translate = useCallback((key: string): string => {
    return translations[key]?.[language] || translations[key]?.en || key
  }, [language])

  const toggleLanguage = useCallback(() => {
    setLanguage(prev => {
      switch (prev) {
        case 'en': return 'si'
        case 'si': return 'ta'
        case 'ta': return 'en'
        default: return 'en'
      }
    })
  }, [])

  return {
    language,
    translate,
    toggleLanguage,
    setLanguage
  }
}
