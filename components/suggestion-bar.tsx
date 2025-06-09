"use client"

import { Button } from "@/components/ui/button"

interface SuggestionBarProps {
  suggestions: string[]
  onSuggestionClick: (suggestion: string) => void
}

export default function SuggestionBar({ suggestions, onSuggestionClick }: SuggestionBarProps) {
  if (!suggestions.length) return null

  return (
    <div className="flex flex-wrap gap-2 mb-2">
      {suggestions.map((suggestion, index) => (
        <Button
          key={index}
          variant="outline"
          size="sm"
          onClick={() => onSuggestionClick(suggestion)}
          className="text-xs"
        >
          {suggestion}
        </Button>
      ))}
    </div>
  )
}
