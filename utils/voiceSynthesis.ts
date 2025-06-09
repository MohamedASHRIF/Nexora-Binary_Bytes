interface VoiceOptions {
  lang?: string;
  pitch?: number;
  rate?: number;
  volume?: number;
}

export const speak = (text: string, options: VoiceOptions = {}): void => {
  if (!('speechSynthesis' in window)) {
    console.warn('Speech synthesis not supported in this browser');
    return;
  }

  const utterance = new SpeechSynthesisUtterance(text);
  
  // Set default options
  utterance.lang = options.lang || 'en-US';
  utterance.pitch = options.pitch || 1;
  utterance.rate = options.rate || 1;
  utterance.volume = options.volume || 1;

  // Get available voices
  const voices = window.speechSynthesis.getVoices();
  
  // Try to find a voice matching the language
  const voice = voices.find(v => v.lang.startsWith(options.lang || 'en-US'));
  if (voice) {
    utterance.voice = voice;
  }

  window.speechSynthesis.speak(utterance);
};

export const stopSpeaking = (): void => {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
};

// Example usage:
// speak('Hello, how can I help you today?', { lang: 'en-US' });
// speak('வணக்கம், நான் உங்களுக்கு எப்படி உதவ முடியும்?', { lang: 'ta-IN' });
// speak('ආයුබෝවන්, මට ඔබට කෙසේ උදව් කළ හැකිද?', { lang: 'si-LK' }); 