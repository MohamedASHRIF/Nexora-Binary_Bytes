import React, { useState, useEffect, useRef } from "react";
import { analyzeSentiment } from "../utils/sentimentAnalysis";
import Cookies from 'js-cookie';

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

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export function ChatWidoo() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [editingIndex, setEditingIndex] = useState(null);
  const [editInput, setEditInput] = useState("");
  const [error, setError] = useState("");
  const messagesEndRef = useRef(null);

  function getAuthHeaders() {
    const token = localStorage.getItem('token') || Cookies.get('token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  }

  async function fetchMessages() {
    try {
      const res = await fetch(`${API_URL}/chatwidoo/messages`, {
        credentials: 'include',
        headers: {
          ...getAuthHeaders(),
        },
      });
      if (!res.ok) {
        if (res.status === 401) {
          setError("You must be logged in to use the Diary feature.");
        } else {
          setError("Failed to load messages. Please try again later.");
        }
        return [];
      }
      const data = await res.json();
      if (!data.data || !data.data.messages) {
        setError("No messages found or server error.");
        return [];
      }
      setError("");
      return data.data.messages;
    } catch (err) {
      setError("Network error. Please try again later.");
      return [];
    }
  }

  async function addMessageAPI({ text, sentiment, score }) {
    try {
      const res = await fetch(`${API_URL}/chatwidoo/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        credentials: 'include',
        body: JSON.stringify({ text, sentiment, score })
      });
      if (!res.ok) {
        if (res.status === 401) setError("You must be logged in to add messages.");
        else setError("Failed to add message.");
        return null;
      }
      const data = await res.json();
      if (!data.data || !data.data.message) {
        setError("Server error: could not add message.");
        return null;
      }
      setError("");
      return data.data.message;
    } catch (err) {
      setError("Network error. Please try again later.");
      return null;
    }
  }

  async function editMessageAPI(id, { text, sentiment, score }) {
    try {
      const res = await fetch(`${API_URL}/chatwidoo/messages/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        credentials: 'include',
        body: JSON.stringify({ text, sentiment, score })
      });
      if (!res.ok) {
        if (res.status === 401) setError("You must be logged in to edit messages.");
        else setError("Failed to edit message.");
        return null;
      }
      const data = await res.json();
      if (!data.data || !data.data.message) {
        setError("Server error: could not edit message.");
        return null;
      }
      setError("");
      return data.data.message;
    } catch (err) {
      setError("Network error. Please try again later.");
      return null;
    }
  }

  async function deleteMessageAPI(id) {
    try {
      const res = await fetch(`${API_URL}/chatwidoo/messages/${id}`, {
        method: "DELETE",
        credentials: 'include',
        headers: {
          ...getAuthHeaders(),
        },
      });
      if (!res.ok) {
        if (res.status === 401) setError("You must be logged in to delete messages.");
        else setError("Failed to delete message.");
        return false;
      }
      setError("");
      return true;
    } catch (err) {
      setError("Network error. Please try again later.");
      return false;
    }
  }

  useEffect(() => {
    fetchMessages().then(setMessages);
  }, []);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollTop = messagesEndRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const { score, label } = analyzeSentiment(input);
    const newMessage = await addMessageAPI({ text: input, sentiment: label, score });
    if (newMessage) {
      setMessages([...messages, newMessage]);
      setInput("");
    }
  };

  const handleDelete = async (index) => {
    const message = messages[index];
    if (!message || !message._id) {
      console.error('Message or message ID not found:', message);
      setError("Cannot delete message: ID not found");
      return;
    }
    
    const success = await deleteMessageAPI(message._id);
    if (success) {
      setMessages(messages.filter((_, i) => i !== index));
      setError(""); // Clear any previous errors
    }
  };

  const handleEdit = (index) => {
    setEditingIndex(index);
    setEditInput(messages[index].text);
  };

  const handleEditSave = async () => {
    if (!editInput.trim()) return;
    const { score, label } = analyzeSentiment(editInput);
    const id = messages[editingIndex]._id;
    const updated = await editMessageAPI(id, { text: editInput, sentiment: label, score });
    if (updated) {
      setMessages(messages.map((msg, i) => (i === editingIndex ? updated : msg)));
      setEditingIndex(null);
      setEditInput("");
    }
  };

  const handleEditCancel = () => {
    setEditingIndex(null);
    setEditInput("");
  };

  return (
    <div className="h-screen w-full bg-white dark:bg-slate-900 flex flex-col">
      <div className="p-6 bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-white dark:border-slate-700 m-4">
        <div className="border-b border-gray-200 dark:border-slate-700 pb-4 mb-4">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Diary</h2>
          {error && (
            <div className="mt-2 p-2 bg-red-100 text-red-700 rounded border border-red-300 text-sm">{error}</div>
          )}
        </div>
        <div
          ref={messagesEndRef}
          className="flex-1 overflow-y-auto flex flex-col gap-3 max-h-[calc(100vh-200px)] min-h-[400px]"
        >
        {messages.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-gray-500 dark:text-gray-400">
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-xl font-semibold mb-2">No diary entries yet</h3>
              <p className="text-sm">Start writing your thoughts and feelings below</p>
            </div>
          </div>
        ) : (
        messages.map((msg, i) => (
          <div
            key={msg._id || i}
            className="flex justify-between items-start p-4 bg-gray-50 dark:bg-slate-700 rounded-lg shadow-sm border border-gray-200 dark:border-slate-600 gap-3"
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
        ))
        )}
        </div>
        <div className="border-t border-gray-200 dark:border-slate-700 pt-4 mt-4">
          <div className="flex gap-3">
            <input
              className="flex-1 border border-gray-300 dark:border-slate-600 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Write your diary entry..."
            />
            <button
              className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition font-medium"
              onClick={handleSend}
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
