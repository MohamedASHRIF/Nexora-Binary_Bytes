import React, { useState, useEffect, useRef } from "react";
import { analyzeSentiment } from "../utils/sentimentAnalysis";

// ✅ Updated function to format timestamp without seconds
function formatTimestamp(timestamp) {
  const date = new Date(timestamp);
  return date.toLocaleString(undefined, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export function ChatWidoo() {
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem("chatwidooMessages");
    return saved ? JSON.parse(saved) : [];
  });
  const [input, setInput] = useState("");
  const [editingIndex, setEditingIndex] = useState(null);
  const [editInput, setEditInput] = useState("");
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
    const { score, label } = analyzeSentiment(input);
    const newMessage = {
      text: input,
      sentiment: label,
      score,
      timestamp: new Date().toISOString(),
    };

    const updated = [...messages, newMessage];
    setMessages(updated);
    localStorage.setItem("chatwidooMessages", JSON.stringify(updated));
    window.dispatchEvent(new Event("chatUpdated"));
    setInput("");
  };

  const handleDelete = (index) => {
    const updated = messages.filter((_, i) => i !== index);
    setMessages(updated);
    localStorage.setItem("chatwidooMessages", JSON.stringify(updated));
    window.dispatchEvent(new Event("chatUpdated"));
  };

  const handleEdit = (index) => {
    setEditingIndex(index);
    setEditInput(messages[index].text);
  };

  const handleEditSave = () => {
    if (!editInput.trim()) return;
    const { score, label } = analyzeSentiment(editInput);
    const updated = [...messages];
    updated[editingIndex] = {
      ...updated[editingIndex],
      text: editInput,
      sentiment: label,
      score,
      timestamp: new Date().toISOString(),
    };
    setMessages(updated);
    localStorage.setItem("chatwidooMessages", JSON.stringify(updated));
    setEditingIndex(null);
    setEditInput("");
    window.dispatchEvent(new Event("chatUpdated"));
  };

  const handleEditCancel = () => {
    setEditingIndex(null);
    setEditInput("");
  };

  return (
    <div className="p-4 bg-white rounded shadow max-w-xl mx-auto">
      <h2 className="text-lg font-semibold mb-2">Chat</h2>
      <div
        ref={messagesEndRef}
        className="h-64 overflow-y-auto border p-2 mb-2 flex flex-col gap-2"
      >
        {messages.map((msg, i) => (
          <div
            key={i}
            className="flex justify-between items-start border-b pb-2 gap-2"
          >
            <div className="flex-1">
              {editingIndex === i ? (
                <>
                  <input
                    type="text"
                    value={editInput}
                    onChange={(e) => setEditInput(e.target.value)}
                    className="border rounded px-2 py-1 w-full"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleEditSave();
                      if (e.key === "Escape") handleEditCancel();
                    }}
                    autoFocus
                  />
                  <div className="mt-1 space-x-2">
                    <button
                      onClick={handleEditSave}
                      className="text-green-700 border border-green-700 px-2 py-0.5 rounded hover:bg-green-700 hover:text-white transition"
                    >
                      Save
                    </button>
                    <button
                      onClick={handleEditCancel}
                      className="text-gray-700 border border-gray-700 px-2 py-0.5 rounded hover:bg-gray-700 hover:text-white transition"
                    >
                      Cancel
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="text-sm">{msg.text}</div>
                  <div className="text-xs text-gray-500">
                    [{msg.sentiment}] • {formatTimestamp(msg.timestamp)}
                  </div>
                </>
              )}
            </div>
            {editingIndex !== i && (
              <div className="flex gap-2 self-start">
                <button
                  onClick={() => handleEdit(i)}
                  className="text-blue-600 border border-blue-600 px-2 py-0.5 rounded hover:bg-blue-600 hover:text-white transition"
                  aria-label={`Edit message ${i + 1}`}
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(i)}
                  className="text-red-600 border border-red-600 px-2 py-0.5 rounded hover:bg-red-600 hover:text-white transition"
                  aria-label={`Delete message ${i + 1}`}
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
      <input
        className="border p-2 w-full mb-2 rounded"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSend()}
        placeholder="Ask me anything..."
      />
      <button
        className="bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600 transition"
        onClick={handleSend}
      >
        Send
      </button>
    </div>
  );
}
