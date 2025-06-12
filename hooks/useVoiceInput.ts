import { useState, useCallback, useRef } from 'react';
import { useLanguage } from './useLanguage';

export const useVoiceInput = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef<any>(null);
  const { language, translate } = useLanguage();

  // Language codes for speech recognition
  const getLanguageCode = (lang: string) => {
    switch (lang) {
      case 'si':
        return 'si-LK'; // Sinhala (Sri Lanka)
      case 'ta':
        return 'ta-IN'; // Tamil (India)
      case 'en':
      default:
        return 'en-US'; // English (US)
    }
  };

  const startListening = useCallback(() => {
    try {
      if (!('webkitSpeechRecognition' in window)) {
        alert(translate('voice_not_supported'));
        return;
      }

      // Clean up any existing recognition instance
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // Ignore errors from stopping
        }
      }

      const recognition = new (window as any).webkitSpeechRecognition();
      recognitionRef.current = recognition;
      
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = getLanguageCode(language);

      recognition.onstart = () => {
        setIsListening(true);
        setTranscript('');
      };

      recognition.onresult = (event: any) => {
        const current = event.resultIndex;
        const transcript = event.results[current][0].transcript;
        setTranscript(transcript);
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        
        // Only show alert for critical errors
        if (event.error === 'not-allowed') {
          alert(translate('voice_error'));
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (error) {
      console.error('Error starting speech recognition:', error);
      setIsListening(false);
      alert(translate('voice_start_error'));
    }
  }, [language, translate]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (error) {
        console.error('Error stopping speech recognition:', error);
      }
    }
    setIsListening(false);
  }, []);

  const clearTranscript = useCallback(() => {
    setTranscript('');
  }, []);

  return {
    isListening,
    transcript,
    startListening,
    stopListening,
    clearTranscript,
    language
  };
}; 