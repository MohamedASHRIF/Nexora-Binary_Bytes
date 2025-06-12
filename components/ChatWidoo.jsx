import React, { useState, useEffect, useRef } from "react";
import { analyzeSentiment } from "../utils/sentiment";
import { logQuery } from "../utils/logger";

function formatTimestamp(timestamp) {
  const date = new Date(timestamp);
  return date.toLocaleString(); // e.g. "6/12/2025, 10:25:33 AM"
}

export function ChatWidoo() {
  const [messages, setMessages] = useState(() => {
    const savedMessages = localStorage.getItem("chatwidooMessages");
    return savedMessages ? JSON.parse(savedMessages) : [];
  });

  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    localStorage.setItem("chatwidooMessages", JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollTop = messagesEndRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;

    const sentiment = analyzeSentiment(input);
    const newMessage = {
      text: input,
      sentiment,
      timestamp: new Date().toISOString(),
    };

    setMessages([...messages, newMessage]);
    logQuery(newMessage);
    setInput("");
  };

  const token = localStorage.getItem('token');

  return (
    <div className="p-4 bg-white rounded shadow">
      <h2 className="text-lg font-semibold mb-2">Chat</h2>
      <div
        ref={messagesEndRef}
        className="h-64 overflow-y-auto border p-2 mb-2 flex flex-col gap-2"
      >
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className="flex justify-between items-center border-b pb-1"
          >
            <span className="text-left">{msg.text}</span>
            <div className="text-right text-xs text-gray-500 min-w-[130px]">
              <div>[{msg.sentiment}]</div>
              <div>{formatTimestamp(msg.timestamp)}</div>
            </div>
          </div>
        ))}
      </div>
      <input
        className="border p-2 w-full mb-2"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSend()}
        placeholder="Ask me anything..."
      />
      <button
        className="bg-blue-500 text-white px-4 py-1 rounded"
        onClick={handleSend}
      >
        Send
      </button>
    </div>
  );
}
