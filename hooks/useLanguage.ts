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
  'offline': {
    en: "You're currently offline. I'll try to use cached data, but some features may be limited.",
    si: "ඔබ දැනට අන්තර්ජාලයට සම්බන්ධ නැත. මම කෑෂ් කළ දත්ත භාවිතා කරන්නම්, නමුත් සමහර විශේෂාංග සීමිත විය හැකිය.",
    ta: "நீங்கள் தற்போது ஆஃப்லைனில் உள்ளீர்கள். நான் கேஷ் செய்யப்பட்ட தரவைப் பயன்படுத்த முயற்சிப்பேன், ஆனால் சில அம்சங்கள் கட்டுப்படுத்தப்படலாம்.",
  },
  'error': {
    en: "Sorry, I encountered an error. Please try again.",
    si: "සමාවෙන්න, මට දෝෂයක් ඇති විය. කරුණාකර නැවත උත්සාහ කරන්න.",
    ta: "மன்னிக்கவும், நான் ஒரு பிழையை சந்தித்தேன். தயவுசெய்து மீண்டும் முயற்சிக்கவும்.",
  },
  'processing': {
    en: "Processing your request...",
    si: "ඔබේ ඉල්ලීම සැකසෙමින්...",
    ta: "உங்கள் கோரிக்கையை செயலாக்குகிறேன்...",
  },
  'no_data': {
    en: "No data available for this request.",
    si: "මෙම ඉල්ලීම සඳහා දත්ත නොමැත.",
    ta: "இந்த கோரிக்கைக்கு தரவு எதுவும் இல்லை.",
  },
  'location_found': {
    en: "I found the location you're looking for.",
    si: "ඔබ සොයන ස්ථානය මට හොයාගත හැකි විය.",
    ta: "நீங்கள் தேடும் இடத்தை நான் கண்டுபிடித்தேன்.",
  },
  'help': {
    en: "I can help you with class schedules, bus timings, cafeteria menus, campus events, and finding locations.",
    si: "මට පන්ති කාලසටහන්, බස් වේලාවන්, කෑමෝටුව මෙනුව, විශ්වවිද්‍යාල සිදුවීම් සහ ස්ථාන සොයාගැනීම ගැන උදව් කළ හැකිය.",
    ta: "வகுப்பு அட்டவணைகள், பேருந்து நேரங்கள், உணவக மெனு, வளாக நிகழ்வுகள் மற்றும் இடங்களைக் கண்டுபிடிப்பதில் நான் உதவ முடியும்.",
  },
  'voice_not_supported': {
    en: "Voice input is not supported in your browser. Please use Chrome.",
    si: "ඔබේ බ්‍රවුසරයේ හඬ ඇතුළත් කිරීම සඳහා සහාය නොදක්වයි. කරුණාකර Chrome භාවිතා කරන්න.",
    ta: "உங்கள் உலாவியில் குரல் உள்ளீடு ஆதரிக்கப்படவில்லை. தயவுசெய்து Chrome பயன்படுத்தவும்.",
  },
  'voice_error': {
    en: "Voice input error occurred.",
    si: "හඬ ඇතුළත් කිරීමේ දෝෂයක් ඇති විය.",
    ta: "குரல் உள்ளீட்டில் பிழை ஏற்பட்டது.",
  },
  'voice_start_error': {
    en: "Failed to start voice input.",
    si: "හඬ ඇතුළත් කිරීම ආරම්භ කිරීමට අසමත් විය.",
    ta: "குரல் உள்ளீட்டைத் தொடங்க முடியவில்லை.",
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