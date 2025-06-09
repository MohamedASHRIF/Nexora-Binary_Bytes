export interface Message {
  text: string
  isUser: boolean
  timestamp: Date
  isTampered?: boolean
}

export interface QueryLog {
  text: string
  timestamp: Date
  sentiment: number
}

export interface ScheduleItem {
  time: string
  name: string
  location: string
}

export interface BusInfo {
  route: string
  time: string
  destination: string
}

export interface EventInfo {
  date: string
  name: string
  location: string
  time?: string
}

export interface FAQItem {
  question: string
  answer: string
}
