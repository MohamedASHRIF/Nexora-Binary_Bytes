import { Request, Response, NextFunction } from 'express';
import OpenAI from 'openai';
import { Chat } from '../models/Chat';
import { User } from '../models/User';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import { Schedule } from '../models/Schedule';
import { BusRoute } from '../models/BusRoute';
import { Event } from '../models/Event';
import { catchAsync } from '../utils/catchAsync';

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: string;
    degree?: string;
  };
}

// Language translations
interface TranslationKeys {
  greeting_response: string;
  mood_tired: string;
  mood_hungry: string;
  mood_bored: string;
  mood_stressed: string;
  mood_sad: string;
  mood_happy: string;
  location_help: string;
  student_only: string;
  degree_not_set: string;
  no_schedules_today: string;
  no_more_classes: string;
  remaining_classes: string;
  no_bus_routes: string;
  available_routes: string;
  no_events: string;
  upcoming_events: string;
  error_fetching_schedule: string;
  error_fetching_bus: string;
  error_fetching_events: string;
  fallback_response: string;
}

const translations: Record<string, TranslationKeys> = {
  en: {
    greeting_response: "Hello! 👋 Welcome to NovaCore University! I'm Nexora, your campus assistant. How can I help you today? I can assist with finding locations, checking class schedules, bus routes, and campus events.",
    mood_tired: "I understand you're feeling tired! 😴 Maybe I can help you find a quiet place to rest on campus, or check if there are any upcoming breaks in your schedule. Would you like me to help you find the library for a peaceful study session, or check your class schedule to see when you have free time?",
    mood_hungry: "Feeling hungry? 🍕 I can help you find the best places to eat on campus! The cafeteria is usually a great option, or I can tell you about other food spots nearby. Would you like me to show you where the cafeteria is located, or check if there are any food-related events happening today?",
    mood_bored: "Bored? 😊 Let me help you find something interesting to do! I can check what events are happening on campus today, show you around different facilities, or help you explore new areas. Would you like to see upcoming events, or shall I give you a virtual tour of some interesting campus locations?",
    mood_stressed: "I'm sorry you're feeling stressed! 😌 Let me help you find some ways to relax. I can show you quiet study areas, check if there are any wellness events happening, or help you find a peaceful spot on campus. Would you like me to locate the library for some quiet time, or check for any stress-relief activities?",
    mood_sad: "I'm sorry you're feeling down. 😔 Let me try to help cheer you up! I can show you some beautiful spots on campus, check for any fun events happening, or help you find a nice place to take a walk. Would you like to explore some campus locations, or shall I check for any upcoming social events?",
    mood_happy: "That's wonderful! 😊 I'm glad you're in a good mood! How can I help make your day even better? I can assist with finding locations, checking schedules, or showing you around campus. What would you like to do?",
    location_help: "I can help you find locations on campus! Try asking for:\n\n• IT Faculty\n• Engineering Faculty\n• Architecture Faculty\n• Library\n• Cafeteria\n• Main Building\n\nJust ask 'Where is [location name]?' and I'll show you on the map!",
    student_only: "I can only show class schedules for students. Please contact the admin for more information.",
    degree_not_set: "Your degree information is not set. Please contact the admin to set your degree.",
    no_schedules_today: "I don't see any class schedules for {degree} degree today.",
    no_more_classes: "You don't have any more {degree} classes scheduled for today.",
    remaining_classes: "Here are your remaining {degree} classes for today:\n\n",
    no_bus_routes: "I don't see any bus routes in the system yet. Please ask an admin to add some routes.",
    available_routes: "Here are the available bus routes:\n\n",
    no_events: "I don't see any upcoming events in the system yet. Please ask an admin to add some events.",
    upcoming_events: "Here are the upcoming events:\n\n",
    error_fetching_schedule: "Sorry, I encountered an error while fetching your schedule. Please try again.",
    error_fetching_bus: "Sorry, I encountered an error while fetching bus routes. Please try again.",
    error_fetching_events: "Sorry, I encountered an error while fetching events. Please try again.",
    fallback_response: "I understand you're asking about something. I can help you with class schedules, bus routes, campus events, and finding locations. What would you like to know?"
  },
  si: {
    greeting_response: "ආයුබෝවන්! 👋 NovaCore විශ්වවිද්‍යාලයට සාදරයෙන් පිළිගනිමු! මම Nexora, ඔබේ විශ්වවිද්‍යාල සහායකයා. අද මට ඔබට කෙසේ උදව් කළ හැකිද? ස්ථාන සොයාගැනීම, පන්ති කාලසටහන් පරීක්ෂා කිරීම, බස් මාර්ග සහ විශ්වවිද්‍යාල සිදුවීම් ගැන මට උදව් කළ හැකිය.",
    mood_tired: "ඔබ අවුරුදු වී සිටින බව මට තේරෙනවා! 😴 මට ඔබට විශ්වවිද්‍යාලයේ සන්සුන් ස්ථානයක් සොයාගැනීමට හෝ ඔබේ කාලසටහනේ ඉදිරි විවේක කාලයන් පරීක්ෂා කිරීමට උදව් කළ හැකිය. පුස්තකාලය සොයාගැනීමට හෝ නිදහස් කාලය පරීක්ෂා කිරීමට උදව් කරන්නද?",
    mood_hungry: "බඩගිනිද? 🍕 මට ඔබට විශ්වවිද්‍යාලයේ හොඳම කෑම ස්ථාන සොයාගැනීමට උදව් කළ හැකිය! කෑමෝටුව සාමාන්‍යයෙන් හොඳ විකල්පයක්, හෝ අවට ඇති වෙනත් කෑම ස්ථාන ගැන කියන්න පුළුවන්. කෑමෝටුව කොහෙද තියෙනවාද කියලා පෙන්වන්නද, නැත්නම් අද කෑම ගැන සිදුවීම් තියෙනවාද කියලා පරීක්ෂා කරන්නද?",
    mood_bored: "බොරුද? 😊 රසවත් දෙයක් කරන්න උදව් කරන්න! අද විශ්වවිද්‍යාලයේ සිදුවන සිදුවීම් පරීක්ෂා කරන්න, විවිධ පහසුකම් පෙන්වන්න, හෝ නව ප්‍රදේශ ගවේෂණය කිරීමට උදව් කරන්න පුළුවන්. ඉදිරි සිදුවීම් බලන්නද, නැත්නම් සිත්ගන්නා විශ්වවිද්‍යාල ස්ථාන වල තාරකා චාරිකාවක් දෙන්නද?",
    mood_stressed: "ඔබ ආතතියෙන් සිටින බව කනගාටුවයි! 😌 සන්සුන් වීමට ක්‍රම සොයාගැනීමට උදව් කරන්න. සන්සුන් අධ්‍යයන ප්‍රදේශ පෙන්වන්න, සෞඛ්‍ය සිදුවීම් තියෙනවාද පරීක්ෂා කරන්න, හෝ විශ්වවිද්‍යාලයේ සන්සුන් ස්ථානයක් සොයාගැනීමට උදව් කරන්න පුළුවන්. සන්සුන් කාලයක් සඳහා පුස්තකාලය සොයාගැනීමටද, නැත්නම් ආතති ලිහිල් කිරීමේ ක්‍රියාකාරකම් පරීක්ෂා කරන්නද?",
    mood_sad: "ඔබ දුක් වී සිටින බව කනගාටුවයි. 😔 සතුටු කිරීමට උදව් කරන්න! විශ්වවිද්‍යාලයේ සුන්දර ස්ථාන පෙන්වන්න, විනෝදජනක සිදුවීම් පරීක්ෂා කරන්න, හෝ ඇවිදීමට හොඳ ස්ථානයක් සොයාගැනීමට උදව් කරන්න පුළුවන්. විශ්වවිද්‍යාල ස්ථාන ගවේෂණය කරන්නද, නැත්නම් ඉදිරි සමාජ සිදුවීම් පරීක්ෂා කරන්නද?",
    mood_happy: "ඒක හොඳයි! 😊 ඔබ හොඳ மனநிலையில் இருப்பதில் மகிழ்ச்சி! உங்கள் நாளை இன்னும் சிறப்பாக்க நான் எப்படி உதவ முடியும்? இடங்களைக் கண்டுபிடிப்பது, அட்டவணைகளை சரிபார்ப்பது, அல்லது வளாகத்தைச் சுற்றிக் காட்டுவது பற்றி உதவ முடியும். நீங்கள் என்ன செய்ய விரும்புகிறீர்கள்?",
    location_help: "வளாகத்தில் இடங்களைக் கண்டுபிடிப்பதில் நான் உதவ முடியும்! இதைக் கேள்வி கேளுங்கள்:\n\n• IT பீடம்\n• பொறியியல் பீடம்\n• கட்டிடக்கலை பீடம்\n• நூலகம்\n• உணவகம்\n• முதன்மை கட்டிடம்\n\n'[இடத்தின் பெயர்] எங்கே?' என்று கேள்வி கேளுங்கள், நான் அதை வரைபடத்தில் காட்டுவேன்!",
    student_only: "மாணவர்களுக்கு மட்டுமே வகுப்பு அட்டவணைகளைக் காட்ட முடியும். மேலும் தகவலுக்கு நிர்வாகியை தொடர்பு கொள்ளவும்.",
    degree_not_set: "உங்கள் பட்டப்படிப்பு தகவல் அமைக்கப்படவில்லை. உங்கள் பட்டப்படிப்பை அமைக்க நிர்வாகியை தொடர்பு கொள்ளவும்.",
    no_schedules_today: "இன்று {degree} பட்டப்படிப்புக்கான வகுப்பு அட்டவணைகள் எதுவும் இல்லை.",
    no_more_classes: "இன்று உங்களுக்கு {degree} வகுப்புகள் எதுவும் இல்லை.",
    remaining_classes: "இன்று உங்கள் மீதமுள்ள {degree} வகுப்புகள் இதோ:\n\n",
    no_bus_routes: "சிஸ்டத்தில் பேருந்து வழித்தடங்கள் எதுவும் இல்லை. நிர்வாகியிடம் வழித்தடங்களை சேர்க்குமாறு கேள்வி கேளுங்கள்.",
    available_routes: "கிடைக்கக்கூடிய பேருந்து வழித்தடங்கள் இதோ:\n\n",
    no_events: "சிஸ்டத்தில் வரவிருக்கும் நிகழ்வுகள் எதுவும் இல்லை. நிர்வாகியிடம் நிகழ்வுகளை சேர்க்குமாறு கேள்வி கேளுங்கள்.",
    upcoming_events: "வரவிருக்கும் நிகழ்வுகள் இதோ:\n\n",
    error_fetching_schedule: "மன்னிக்கவும், உங்கள் அட்டவணையை பெறும்போது பிழை ஏற்பட்டது. தயவுசெய்து மீண்டும் முயற்சிக்கவும்.",
    error_fetching_bus: "மன்னிக்கவும், பேருந்து வழித்தடங்களை பெறும்போது பிழை ஏற்பட்டது. தயவுசெய்து மீண்டும் முயற்சிக்கவும்.",
    error_fetching_events: "மன்னிக்கவும், நிகழ்வுகளை பெறும்போது பிழை ஏற்பட்டது. தயவுசெய்து மீண்டும் முயற்சிக்கவும்.",
    fallback_response: "நீங்கள் ஏதாவது கேள்வி கேட்கிறீர்கள் என்பதை நான் புரிந்துகொள்கிறேன். வகுப்பு அட்டவணைகள், பேருந்து வழித்தடங்கள், வளாக நிகழ்வுகள் மற்றும் இடங்களைக் கண்டுபிடிப்பதில் நான் உதவ முடியும். நீங்கள் என்ன தெரிந்துகொள்ள விரும்புகிறீர்கள்?"
  },
  ta: {
    greeting_response: "வணக்கம்! 👋 NovaCore பல்கலைக்கழகத்திற்கு வரவேற்கிறோம்! நான் Nexora, உங்கள் வளாக உதவியாளர். இன்று நான் உங்களுக்கு எப்படி உதவ முடியும்? இடங்களைக் கண்டுபிடிப்பது, வகுப்பு அட்டவணைகளை சரிபார்ப்பது, பேருந்து வழித்தடங்கள் மற்றும் வளாக நிகழ்வுகள் பற்றி நான் உதவ முடியும்.",
    mood_tired: "நீங்கள் சோர்வாக இருப்பதை நான் புரிந்துகொள்கிறேன்! 😴 வளாகத்தில் ஓய்வெடுக்க அமைதியான இடத்தைக் கண்டுபிடிப்பதில் அல்லது உங்கள் அட்டவணையில் வரவிருக்கும் இடைவேளைகளை சரிபார்ப்பதில் நான் உதவ முடியும். அமைதியான படிப்பு அமர்வுக்கு நூலகத்தைக் கண்டுபிடிப்பதில் உதவுகிறேனா, அல்லது நீங்கள் இலவச நேரம் எப்போது உள்ளது என்பதை சரிபார்க்கிறேனா?",
    mood_hungry: "பசியா இருக்கிறதா? 🍕 வளாகத்தில் சிறந்த உணவு இடங்களைக் கண்டுபிடிப்பதில் நான் உதவ முடியும்! காஃபி பெரும்பாலும் சிறந்த விருப்பமாகும், அல்லது அருகிலுள்ள மற்ற உணவு இடங்களைப் பற்றி சொல்ல முடியும். காஃபி எங்கே உள்ளது என்பதைக் காட்டுகிறேனா, அல்லது இன்று உணவு தொடர்பான நிகழ்வுகள் ஏதாவது உள்ளதா என்பதை சரிபார்க்கிறேனா?",
    mood_bored: "சலிப்பா? 😊 ஏதாவது சுவாரஸ்யமான செய்ய உதவுகிறேன்! இன்று வளாகத்தில் என்ன நிகழ்வுகள் நடக்கிறது என்பதை சரிபார்க்கிறேன், வெவ்வேறு வசதிகளைக் காட்டுகிறேன், அல்லது புதிய பகுதிகளை ஆராய உதவுகிறேன். வரவிருக்கும் நிகழ்வுகளைப் பார்க்க விரும்புகிறீர்களா, அல்லது சில சுவாரஸ்யமான வளாக இடங்களின் மெய்நிகர் சுற்றுப்பயணத்தை வழங்குகிறேனா?",
    mood_stressed: "நீங்கள் மன அழுத்தத்தில் இருப்பதற்கு வருந்துகிறேன்! 😌 ஓய்வெடுக்க சில வழிகளைக் கண்டுபிடிப்பதில் உதவுகிறேன். அமைதியான படிப்பு பகுதிகளைக் காட்டுகிறேன், நல்வாழ்வு நிகழ்வுகள் ஏதாவது நடக்கிறதா என்பதை சரிபார்க்கிறேன், அல்லது வளாகத்தில் அமைதியான இடத்தைக் கண்டுபிடிப்பதில் உதவுகிறேன். அமைதியான நேரத்திற்கு நூலகத்தைக் கண்டுபிடிப்பதில் உதவுகிறேனா, அல்லது மன அழுத்த நிவாரண நடவடிக்கைகளை சரிபார்க்கிறேனா?",
    mood_sad: "நீங்கள் மனம் வருந்துவதற்கு வருந்துகிறேன். 😔 உங்களை மகிழ்விக்க முயற்சிக்கிறேன்! வளாகத்தில் சில அழகான இடங்களைக் காட்டுகிறேன், வேடிக்கையான நிகழ்வுகள் ஏதாவது நடக்கிறதா என்பதை சரிபார்க்கிறேன், அல்லது நடைபயிற்சி செய்ய நல்ல இடத்தைக் கண்டுபிடிப்பதில் உதவுகிறேன். சில வளாக இடங்களை ஆராய விரும்புகிறீர்களா, அல்லது வரவிருக்கும் சமூக நிகழ்வுகளை சரிபார்க்கிறேனா?",
    mood_happy: "அது அருமை! 😊 நீங்கள் நல்ல மனநிலையில் இருப்பதில் மகிழ்ச்சி! உங்கள் நாளை இன்னும் சிறப்பாக்க நான் எப்படி உதவ முடியும்? இடங்களைக் கண்டுபிடிப்பது, அட்டவணைகளை சரிபார்ப்பது, அல்லது வளாகத்தைச் சுற்றிக் காட்டுவது பற்றி உதவ முடியும். நீங்கள் என்ன செய்ய விரும்புகிறீர்கள்?",
    location_help: "வளாகத்தில் இடங்களைக் கண்டுபிடிப்பதில் நான் உதவ முடியும்! இதைக் கேள்வி கேளுங்கள்:\n\n• IT பீடம்\n• பொறியியல் பீடம்\n• கட்டிடக்கலை பீடம்\n• நூலகம்\n• உணவகம்\n• முதன்மை கட்டிடம்\n\n'[இடத்தின் பெயர்] எங்கே?' என்று கேள்வி கேளுங்கள், நான் அதை வரைபடத்தில் காட்டுவேன்!",
    student_only: "மாணவர்களுக்கு மட்டுமே வகுப்பு அட்டவணைகளைக் காட்ட முடியும். மேலும் தகவலுக்கு நிர்வாகியை தொடர்பு கொள்ளவும்.",
    degree_not_set: "உங்கள் பட்டப்படிப்பு தகவல் அமைக்கப்படவில்லை. உங்கள் பட்டப்படிப்பை அமைக்க நிர்வாகியை தொடர்பு கொள்ளவும்.",
    no_schedules_today: "இன்று {degree} பட்டப்படிப்புக்கான வகுப்பு அட்டவணைகள் எதுவும் இல்லை.",
    no_more_classes: "இன்று உங்களுக்கு {degree} வகுப்புகள் எதுவும் இல்லை.",
    remaining_classes: "இன்று உங்கள் மீதமுள்ள {degree} வகுப்புகள் இதோ:\n\n",
    no_bus_routes: "சிஸ்டத்தில் பேருந்து வழித்தடங்கள் எதுவும் இல்லை. நிர்வாகியிடம் வழித்தடங்களை சேர்க்குமாறு கேள்வி கேளுங்கள்.",
    available_routes: "கிடைக்கக்கூடிய பேருந்து வழித்தடங்கள் இதோ:\n\n",
    no_events: "சிஸ்டத்தில் வரவிருக்கும் நிகழ்வுகள் எதுவும் இல்லை. நிர்வாகியிடம் நிகழ்வுகளை சேர்க்குமாறு கேள்வி கேளுங்கள்.",
    upcoming_events: "வரவிருக்கும் நிகழ்வுகள் இதோ:\n\n",
    error_fetching_schedule: "மன்னிக்கவும், உங்கள் அட்டவணையை பெறும்போது பிழை ஏற்பட்டது. தயவுசெய்து மீண்டும் முயற்சிக்கவும்.",
    error_fetching_bus: "மன்னிக்கவும், பேருந்து வழித்தடங்களை பெறும்போது பிழை ஏற்பட்டது. தயவுசெய்து மீண்டும் முயற்சிக்கவும்.",
    error_fetching_events: "மன்னிக்கவும், நிகழ்வுகளை பெறும்போது பிழை ஏற்பட்டது. தயவுசெய்து மீண்டும் முயற்சிக்கவும்.",
    fallback_response: "நீங்கள் ஏதாவது கேள்வி கேட்கிறீர்கள் என்பதை நான் புரிந்துகொள்கிறேன். வகுப்பு அட்டவணைகள், பேருந்து வழித்தடங்கள், வளாக நிகழ்வுகள் மற்றும் இடங்களைக் கண்டுபிடிப்பதில் நான் உதவ முடியும். நீங்கள் என்ன தெரிந்துகொள்ள விரும்புகிறீர்கள்?"
  }
};

// Helper function to get translation
const getTranslation = (key: keyof TranslationKeys, language: string, params?: Record<string, string>): string => {
  const lang = language as 'en' | 'si' | 'ta';
  const translation = translations[lang]?.[key] || translations.en[key] || String(key);
  
  if (params) {
    return Object.entries(params).reduce((text, [param, value]) => {
      return text.replace(new RegExp(`{${param}}`, 'g'), value);
    }, translation);
  }
  
  return translation;
};

// Helper function to detect language from message
const detectLanguage = (message: string): string => {
  const lowerMessage = message.toLowerCase();
  
  // Check for Sinhala characters (Unicode range: U+0D80 to U+0DFF)
  if (/[\u0D80-\u0DFF]/.test(message)) {
    return 'si';
  }
  
  // Check for Tamil characters (Unicode range: U+0B80 to U+0BFF)
  if (/[\u0B80-\u0BFF]/.test(message)) {
    return 'ta';
  }
  
  // Check for Tamil keywords in English script
  const tamilKeywords = ['vakuppu', 'class', 'schedule', 'bus', 'event', 'location', 'where', 'when', 'what'];
  if (tamilKeywords.some(keyword => lowerMessage.includes(keyword))) {
    // If the message contains Tamil characters, prioritize Tamil
    if (/[\u0B80-\u0BFF]/.test(message)) {
      return 'ta';
    }
  }
  
  // Check for Sinhala keywords in English script
  const sinhalaKeywords = ['panti', 'kala', 'bas', 'kama', 'sithiyama', 'kohada'];
  if (sinhalaKeywords.some(keyword => lowerMessage.includes(keyword))) {
    // If the message contains Sinhala characters, prioritize Sinhala
    if (/[\u0D80-\u0DFF]/.test(message)) {
      return 'si';
    }
  }
  
  return 'en';
};

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// System prompt for the chatbot
const SYSTEM_PROMPT = `You are Nexora, a helpful campus assistant for NovaCore University. 
Your role is to assist students, staff, and visitors with campus-related queries.
You can help with:
- Finding locations on campus
- Providing information about facilities
- Answering questions about university services
- Giving directions
- Sharing campus news and events
Always be polite, professional, and accurate in your responses.`;

// Simple sentiment analysis function
const analyzeSentiment = (text: string): number => {
  const lowerText = text.toLowerCase();
  
  // Positive words
  const positiveWords = ['good', 'great', 'excellent', 'amazing', 'wonderful', 'perfect', 'love', 'like', 'happy', 'thanks', 'thank you', 'helpful', 'nice', 'awesome', 'fantastic', 'brilliant', 'super', 'cool', 'yes', 'okay', 'ok', 'sure', 'fine', 'well', 'better', 'best'];
  
  // Negative words
  const negativeWords = ['bad', 'terrible', 'awful', 'horrible', 'hate', 'dislike', 'wrong', 'error', 'problem', 'issue', 'broken', 'failed', 'no', 'not', 'never', 'worst', 'worse', 'sad', 'angry', 'frustrated', 'annoyed', 'upset', 'disappointed'];
  
  let score = 0;
  
  // Count positive words
  positiveWords.forEach(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'g');
    const matches = lowerText.match(regex);
    if (matches) {
      score += matches.length;
    }
  });
  
  // Count negative words
  negativeWords.forEach(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'g');
    const matches = lowerText.match(regex);
    if (matches) {
      score -= matches.length;
    }
  });
  
  // Normalize score to range [-1, 1]
  const totalWords = text.split(' ').length;
  if (totalWords === 0) return 0;
  
  const normalizedScore = Math.max(-1, Math.min(1, score / Math.max(totalWords / 10, 1)));
  return normalizedScore;
};

export const chat = catchAsync(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { message, language: userLanguage } = req.body;
    if (!message) {
      return next(new AppError('Message is required', 400));
    }

    if (!req.user?.id) {
      return next(new AppError('User not authenticated', 401));
    }

    // Detect language from message or use user preference
    const detectedLanguage = userLanguage || detectLanguage(message);
    const lowerMessage = message.toLowerCase();
    logger.info('Received chat message:', { message, user: req.user, language: detectedLanguage });

    let botResponse = '';

    // Check for greetings first
    if (lowerMessage.includes('hi') || lowerMessage.includes('hello') || lowerMessage.includes('hey') ||
        lowerMessage.includes('good morning') || lowerMessage.includes('good afternoon') || lowerMessage.includes('good evening') ||
        lowerMessage.includes('வணக்கம்') || lowerMessage.includes('ஹலோ') || lowerMessage.includes('ஹாய்') ||
        lowerMessage.includes('ආයුබෝවන්') || lowerMessage.includes('හෙලෝ') || lowerMessage.includes('හායි')) {
      
      console.log('Greeting detection triggered for message:', lowerMessage);
      botResponse = getTranslation('greeting_response', detectedLanguage);
    }
    // Check for mood-based responses
    else if (lowerMessage.includes('tired') || lowerMessage.includes('exhausted') || lowerMessage.includes('sleepy') ||
             lowerMessage.includes('சோர்வு') || lowerMessage.includes('அலுப்பு') || lowerMessage.includes('தூக்கம்')) {
      
      console.log('Tired mood detection triggered for message:', lowerMessage);
      botResponse = getTranslation('mood_tired', detectedLanguage);
    }
    else if (lowerMessage.includes('hungry') || lowerMessage.includes('starving') || lowerMessage.includes('food') ||
             lowerMessage.includes('பசி') || lowerMessage.includes('உணவு') || lowerMessage.includes('காஃபி') ||
             lowerMessage.includes('බඩගිනි') || lowerMessage.includes('කෑම')) {
      
      console.log('Hungry mood detection triggered for message:', lowerMessage);
      botResponse = getTranslation('mood_hungry', detectedLanguage);
    }
    else if (lowerMessage.includes('bored') || lowerMessage.includes('boring') || lowerMessage.includes('nothing to do') ||
             lowerMessage.includes('சலிப்பு') || lowerMessage.includes('போரடிப்பு') || lowerMessage.includes('எதுவும் செய்ய') ||
             lowerMessage.includes('බොරු') || lowerMessage.includes('කිසිවක් නැත')) {
      
      console.log('Bored mood detection triggered for message:', lowerMessage);
      botResponse = getTranslation('mood_bored', detectedLanguage);
    }
    else if (lowerMessage.includes('stressed') || lowerMessage.includes('stress') || lowerMessage.includes('anxious') ||
             lowerMessage.includes('மன அழுத்தம்') || lowerMessage.includes('பதட்டம்') || lowerMessage.includes('கவலை') ||
             lowerMessage.includes('ආතතිය') || lowerMessage.includes('පීඩනය')) {
      
      console.log('Stressed mood detection triggered for message:', lowerMessage);
      botResponse = getTranslation('mood_stressed', detectedLanguage);
    }
    else if (lowerMessage.includes('sad') || lowerMessage.includes('depressed') || lowerMessage.includes('unhappy') ||
             lowerMessage.includes('வருத்தம்') || lowerMessage.includes('மனம் வருந்த') || lowerMessage.includes('சோகம்') ||
             lowerMessage.includes('දුක්') || lowerMessage.includes('සංවේග')) {
      
      console.log('Sad mood detection triggered for message:', lowerMessage);
      botResponse = getTranslation('mood_sad', detectedLanguage);
    }
    else if (lowerMessage.includes('happy') || lowerMessage.includes('excited') || lowerMessage.includes('great') ||
             lowerMessage.includes('மகிழ்ச்சி') || lowerMessage.includes('சந்தோஷம்') || lowerMessage.includes('நன்றாக') ||
             lowerMessage.includes('සතුටු') || lowerMessage.includes('උද්වේග')) {
      
      console.log('Happy mood detection triggered for message:', lowerMessage);
      botResponse = getTranslation('mood_happy', detectedLanguage);
    }
    // Check if the message is about locations/directions
    else if (lowerMessage.includes('where') || lowerMessage.includes('location') || lowerMessage.includes('directions') || 
        lowerMessage.includes('how to get to') || lowerMessage.includes('find') || lowerMessage.includes('map') ||
        lowerMessage.includes('எங்கே') || lowerMessage.includes('இடம்') || lowerMessage.includes('வழி') ||
        lowerMessage.includes('කොහෙද') || lowerMessage.includes('ස්ථානය') || lowerMessage.includes('මාර්ගය')) {
      
      console.log('Location detection triggered for message:', lowerMessage);
      
      // Define common campus locations
      const campusLocations = [
        { name: 'IT Faculty', keywords: ['it faculty', 'information technology', 'computer science', 'cs faculty', 'ஐடி பீடம்', 'கணினி அறிவியல்', 'IT පීඨය'] },
        { name: 'Engineering Faculty', keywords: ['engineering faculty', 'engineering', 'eng faculty', 'பொறியியல் பீடம்', 'பொறியியல்', 'ඉංජිනේරු පීඨය'] },
        { name: 'Architecture Faculty', keywords: ['architecture faculty', 'architecture', 'arch faculty', 'கட்டிடக்கலை பீடம்', 'கட்டிடக்கலை', 'ගෘහනිර්මාණ පීඨය'] },
        { name: 'Library', keywords: ['library', 'lib', 'study', 'books', 'நூலகம்', 'புத்தகங்கள்', 'පුස්තකාලය'] },
        { name: 'Cafeteria', keywords: ['cafeteria', 'canteen', 'food', 'lunch', 'dining', 'restaurant', 'உணவகம்', 'உணவு', 'காஃபி', 'කෑමෝටුව'] },
        { name: 'Main Building', keywords: ['main building', 'main', 'administration', 'admin', 'office', 'முதன்மை கட்டிடம்', 'நிர்வாகம்', 'ප්‍රධාන ගොඩනැගිල්ල'] }
      ];

      // Find matching location
      let foundLocation = null;
      for (const location of campusLocations) {
        console.log('Checking location:', location.name, 'with keywords:', location.keywords);
        if (location.keywords.some(keyword => lowerMessage.includes(keyword))) {
          foundLocation = location;
          console.log('Found matching location:', foundLocation.name);
          break;
        }
      }

      if (foundLocation) {
        const encodedLocation = encodeURIComponent(foundLocation.name);
        botResponse = `LOCATION_REDIRECT:${foundLocation.name}:${encodedLocation}`;
        console.log('Generated location redirect response:', botResponse);
      } else {
        console.log('No location found for message:', lowerMessage);
        botResponse = getTranslation('location_help', detectedLanguage);
      }
    }
    // Check if the message is about class schedules
    else if (lowerMessage.includes('class') || lowerMessage.includes('schedule') || 
             lowerMessage.includes('வகுப்பு') || lowerMessage.includes('அட்டவணை') || lowerMessage.includes('vakuppu') ||
             lowerMessage.includes('පන්තිය') || lowerMessage.includes('කාලසටහන') || lowerMessage.includes('panti')) {
      try {
        console.log('Chat request user ID:', req.user.id);
        console.log('Chat request user object:', req.user);

        const user = await User.findById(req.user.id);
        if (!user) {
          return next(new AppError('User not found', 404));
        }

        console.log('Found user in database:', { 
          id: user._id, 
          role: user.role, 
          degree: user.degree,
          email: user.email 
        });

        logger.info('User info:', { userId: user._id, role: user.role, degree: user.degree });

        // If user is not a student, return a message
        if (user.role !== 'student') {
          botResponse = getTranslation('student_only', detectedLanguage);
        } else if (!user.degree) {
          console.log('User degree is not set:', user.degree);
          botResponse = getTranslation('degree_not_set', detectedLanguage);
        } else {
          console.log('User degree is set:', user.degree);

          // Get schedules for the user's degree
          const schedules = await Schedule.find({ 
            degree: user.degree,
            day: new Date().toLocaleDateString('en-US', { weekday: 'long' })
          }).sort({ startTime: 1 });

          logger.info('Found schedules:', { 
            count: schedules.length, 
            degree: user.degree,
            schedules: schedules.map(s => ({ className: s.className, degree: s.degree }))
          });
          
          if (schedules.length === 0) {
            botResponse = getTranslation('no_schedules_today', detectedLanguage, { degree: user.degree });
          } else {
            // Get current time
            const currentTime = new Date().toLocaleTimeString('en-US', { hour12: false });

            // Filter schedules for future times
            const relevantSchedules = schedules.filter(schedule => 
              schedule.startTime >= currentTime
            );

            logger.info('Filtered schedules:', { 
              total: schedules.length, 
              relevant: relevantSchedules.length,
              schedules: relevantSchedules.map(s => ({ 
                className: s.className, 
                day: s.day, 
                startTime: s.startTime,
                degree: s.degree 
              }))
            });

            if (relevantSchedules.length === 0) {
              botResponse = getTranslation('no_more_classes', detectedLanguage, { degree: user.degree });
            } else {
              let formattedResponse = getTranslation('remaining_classes', detectedLanguage, { degree: user.degree });
              
              relevantSchedules.forEach(schedule => {
                formattedResponse += `- ${schedule.startTime} to ${schedule.endTime}: ${schedule.className} (${schedule.location}) with ${schedule.instructor}\n`;
              });

              botResponse = formattedResponse.trim();
            }
          }
        }
      } catch (error) {
        logger.error('Error fetching schedules:', error);
        botResponse = getTranslation('error_fetching_schedule', detectedLanguage);
      }
    }
    // Check if the message is about bus routes
    else if (lowerMessage.includes('bus') || lowerMessage.includes('transport') ||
             lowerMessage.includes('பேருந்து') || lowerMessage.includes('போக்குவரத்து') ||
             lowerMessage.includes('බස්') || lowerMessage.includes('ප්‍රවාහන')) {
      try {
        const busRoutes = await BusRoute.find().sort({ route: 1 });
        
        if (busRoutes.length === 0) {
          botResponse = getTranslation('no_bus_routes', detectedLanguage);
        } else {
          let formattedResponse = getTranslation('available_routes', detectedLanguage);
          
          busRoutes.forEach(route => {
            formattedResponse += `${route.route}:\n`;
            formattedResponse += `Duration: ${route.duration}\n`;
            formattedResponse += `Schedule: ${route.schedule}\n\n`;
          });

          botResponse = formattedResponse.trim();
        }
      } catch (error) {
        logger.error('Error fetching bus routes:', error);
        botResponse = getTranslation('error_fetching_bus', detectedLanguage);
      }
    }
    // Check if the message is about events
    else if (lowerMessage.includes('event') || lowerMessage.includes('upcoming') ||
             lowerMessage.includes('நிகழ்வு') || lowerMessage.includes('வரவிருக்கும்') ||
             lowerMessage.includes('සිදුවීම') || lowerMessage.includes('ඉදිරි')) {
      try {
        console.log('Fetching events directly from database...');
        
        const events = await Event.find().sort({ date: 1 });
        console.log('Found events in database:', events.length);
        
        if (events.length === 0) {
          console.log('No events found in database');
          botResponse = getTranslation('no_events', detectedLanguage);
        } else {
          // Format events to match the expected structure
          const formattedEvents = events.map(event => ({
            date: event.date,
            name: event.title,
            location: event.location,
            time: event.time
          }));
          
          console.log('Formatted events:', formattedEvents.length);
          let formattedResponse = getTranslation('upcoming_events', detectedLanguage);
          
          formattedEvents.forEach((event: any) => {
            formattedResponse += `${event.name}\n`;
            formattedResponse += `Date: ${new Date(event.date).toLocaleDateString()}\n`;
            formattedResponse += `Time: ${event.time}\n`;
            formattedResponse += `Location: ${event.location}\n\n`;
          });

          botResponse = formattedResponse.trim();
        }
      } catch (error) {
        console.error('Error fetching events from database:', error);
        logger.error('Error fetching events from database:', error);
        botResponse = getTranslation('error_fetching_events', detectedLanguage);
      }
    }
    // For other messages, use enhanced fallback responses (OpenAI disabled)
    else {
      console.log('Using enhanced fallback response system...');
      botResponse = getTranslation('fallback_response', detectedLanguage);
    }

    // Save messages to database
    try {
      let chat = await Chat.findOne({ userId: req.user.id });
      
      if (!chat) {
        chat = new Chat({ userId: req.user.id, messages: [] });
      }

      // Analyze sentiment for user message
      const userSentiment = analyzeSentiment(message);

      // Add user message
      chat.messages.push({
        text: message,
        isUser: true,
        timestamp: new Date(),
        sentiment: userSentiment
      });

      // Add bot response
      chat.messages.push({
        text: botResponse,
        isUser: false,
        timestamp: new Date(),
        sentiment: 0 // Bot responses are neutral
      });

      await chat.save();
      console.log('Chat history saved for user:', req.user.id);
    } catch (error) {
      console.error('Error saving chat history:', error);
      // Don't fail the request if chat history saving fails
    }

    console.log('Sending bot response:', botResponse);
    return res.status(200).json({
      status: 'success',
      data: {
        message: botResponse
      }
    });
  } catch (error) {
    logger.error('Error in chat controller:', error);
    return next(new AppError('An error occurred while processing your request', 500));
  }
});

export const getChatHistory = catchAsync(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user?.id) {
      return next(new AppError('User not authenticated', 401));
    }

    const chat = await Chat.findOne({ userId: req.user.id });

    if (!chat) {
      return res.status(200).json({
        status: 'success',
        data: {
          messages: []
        }
      });
    }

    // Format messages for frontend
    const formattedMessages = chat.messages.map(msg => ({
      id: msg._id,
      text: msg.text,
      isUser: msg.isUser,
      timestamp: msg.timestamp,
      sentiment: msg.sentiment
    }));

    res.status(200).json({
      status: 'success',
      data: {
        messages: formattedMessages
      }
    });
  } catch (error) {
    logger.error('Get chat history error:', error);
    return next(new AppError('Error fetching chat history', 500));
  }
});

export const clearChat = catchAsync(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user?.id) {
      return next(new AppError('User not authenticated', 401));
    }

    const result = await Chat.findOneAndUpdate(
      { userId: req.user.id },
      { $set: { messages: [] } },
      { new: true, upsert: true }
    );

    res.status(200).json({
      status: 'success',
      message: 'Chat history cleared'
    });
  } catch (error) {
    logger.error('Clear chat error:', error);
    return next(new AppError('Error clearing chat history', 500));
  }
}); 