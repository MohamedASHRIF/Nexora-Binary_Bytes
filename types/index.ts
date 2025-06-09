export interface Message {
  text: string
  isUser: boolean
  timestamp: Date
  isTampered?: boolean
  isSystem?: boolean
}

export interface QueryLog {
  text: string
  timestamp: Date
  sentiment: number
} 