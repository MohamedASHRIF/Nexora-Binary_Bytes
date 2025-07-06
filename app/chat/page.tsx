'use client';

import { ChatWindow } from '../../components/ChatWindow';
import { ChatHistory } from '../../components/ChatHistory';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export default function ChatPage() {
  const [recentMessages, setRecentMessages] = useState<string[]>([]);
  const [initialMessage, setInitialMessage] = useState<string>('');
  const searchParams = useSearchParams();

  useEffect(() => {
    const initialMsg = searchParams.get('initialMessage');
    if (initialMsg) {
      setInitialMessage(decodeURIComponent(initialMsg));
    }
  }, [searchParams]);

  const handleRecentMessagesChange = (messages: string[]) => {
    setRecentMessages(messages);
  };



  const handlePromptClick = (prompt: string) => {
    const event = new CustomEvent('setChatInput', { detail: { text: prompt } });
    window.dispatchEvent(event);
  };

  return (
    <div className="flex h-[calc(100vh-8rem)]">
      <ChatHistory onPromptClick={handlePromptClick} />
      <div className="flex-1 w-full h-full flex flex-col mx-auto p-2">
        <div className="flex-1 overflow-auto">
          <ChatWindow 
            initialMessage={initialMessage}
            onRecentMessagesChange={handleRecentMessagesChange}
            hasSidebar={true}
          />
        </div>

      </div>
    </div>
  );
} 