"use client"

import { useEffect, useRef } from "react"
import { Card } from "@/components/ui/card"
import { Avatar } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Volume2 } from "lucide-react"
import type { Message } from "@/types"

interface ChatWindowProps {
  messages: Message[]
  isProcessing: boolean
  speak: (text: string) => void
}

export default function ChatWindow({ messages, isProcessing, speak }: ChatWindowProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  return (
    <Card className="flex-1 overflow-y-auto p-4 mb-4">
      <div className="space-y-4">
        {messages.map((message, index) => (
          <div key={index} className={`flex ${message.isUser ? "justify-end" : "justify-start"}`}>
            <div className={`flex items-start gap-2 max-w-[80%] ${message.isUser ? "flex-row-reverse" : ""}`}>
              <Avatar className={`h-8 w-8 ${message.isUser ? "bg-purple-200" : "bg-purple-600"}`}>
                <div className="text-xs font-bold">{message.isUser ? "You" : "NC"}</div>
              </Avatar>
              <div>
                <div
                  className={`rounded-lg p-3 ${
                    message.isUser ? "bg-purple-600 text-white" : "bg-gray-100 dark:bg-gray-800"
                  }`}
                >
                  {message.text}
                  {message.isTampered && (
                    <div className="mt-2 text-xs text-red-500 font-medium">
                      ⚠️ This information appears to be tampered with. Please verify.
                    </div>
                  )}
                </div>
                {!message.isUser && (
                  <div className="mt-1 flex justify-end">
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => speak(message.text)}>
                      <Volume2 size={14} />
                      <span className="sr-only">Read aloud</span>
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        {isProcessing && (
          <div className="flex justify-start">
            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3">
              <div className="flex space-x-2">
                <div className="h-2 w-2 bg-purple-600 rounded-full animate-bounce"></div>
                <div
                  className="h-2 w-2 bg-purple-600 rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                ></div>
                <div
                  className="h-2 w-2 bg-purple-600 rounded-full animate-bounce"
                  style={{ animationDelay: "0.4s" }}
                ></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
    </Card>
  )
}
