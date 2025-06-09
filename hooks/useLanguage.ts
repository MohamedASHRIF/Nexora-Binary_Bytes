import { useState, useEffect } from 'react';

type Language = 'en' | 'si' | 'ta';

interface Translations {
  [key: string]: {
    en: string;
    si: string;
    ta: string;
  };
}

const translations: Translations = {
  'welcome': {
    en: 'Welcome to Nexora Campus Copilot! How can I help you today?',
    si: 'Nexora Campus Copilot වෙත සාදරයෙන් පිළිගනිමු! මට ඔබට කෙසේ උදව් කළ හැකිද?',
    ta: 'Nexora Campus Copilot க்கு வரவேற்கிறோம்! நான் உங்களுக்கு எப்படி உதவ முடியும்?',
  },
  'schedule': {
    en: 'Class Schedule',
    si: 'පන්ති කාලසටහන',
    ta: 'வகுப்பு அட்டவணை',
  },
  'bus': {
    en: 'Bus Timings',
    si: 'බස් වේලාවන්',
    ta: 'பேருந்து நேரங்கள்',
  },
  'menu': {
    en: 'Cafeteria Menu',
    si: 'කෑමෝටුව මෙනුව',
    ta: 'உணவக மெனு',
  },
  'events': {
    en: 'Upcoming Events',
    si: 'ඉදිරි සිදුවීම්',
    ta: 'வரவிருக்கும் நிகழ்வுகள்',
  },
  'unknown': {
    en: "I'm not sure I understand. You can ask me about class schedules, bus timings, cafeteria menus, or upcoming events.",
    si: 'මට ඔබේ ප්‍රශ්නය තේරුම් ගැනීමට අපහසුයි. පන්ති කාලසටහන්, බස් වේලාවන්, කෑමෝටුව මෙනුව, හෝ ඉදිරි සිදුවීම් ගැන අසන්න.',
    ta: 'உங்கள் கேள்வியை புரிந்து கொள்ள எனக்கு சிரமமாக உள்ளது. வகுப்பு அட்டவணைகள், பேருந்து நேரங்கள், உணவக மெனு, அல்லது வரவிருக்கும் நிகழ்வுகள் பற்றி கேளுங்கள்.',
  },
};

export const useLanguage = () => {
  const [language, setLanguage] = useState<Language>('en');
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('language');
    if (stored) {
      setLanguage(stored as Language);
    }
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem('language', language);
    }
  }, [language, isInitialized]);

  const translate = (key: string): string => {
    return translations[key]?.[language] || translations['unknown'][language];
  };

  return {
    language,
    setLanguage,
    translate,
    isInitialized,
  };
}; 