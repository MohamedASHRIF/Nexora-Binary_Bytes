// Class schedule data
export function getScheduleData() {
  return {
    classes: [
      { time: "08:00", name: "Math 101", location: "Room A" },
      { time: "10:00", name: "Physics 201", location: "Room B" }
    ]
  };
}

// Bus schedule data
export function getBusData() {
  return {
    nextBuses: [
      { route: "A", time: "09:00", destination: "Downtown" },
      { route: "B", time: "09:30", destination: "Campus" }
    ],
    routes: [
      { name: "A", description: "Downtown to Campus" },
      { name: "B", description: "Campus to Downtown" }
    ]
  };
}

// Cafeteria menu data
export function getCafeteriaData() {
  return {
    today: { breakfast: ["Eggs", "Toast"], lunch: ["Rice", "Curry"], dinner: ["Noodles"] },
    tomorrow: { breakfast: ["Pancakes"], lunch: ["Pasta"], dinner: ["Soup"] },
    hours: { breakfast: "7-9am", lunch: "12-2pm", dinner: "6-8pm" }
  };
}

// Campus events data
export function getEventData() {
  return {
    upcoming: [
      { date: "2024-06-01", name: "Workshop", location: "Hall 1", time: "10:00" }
    ],
    categories: ["Workshop", "Seminar"],
    registration: { required: ["Workshop"], link: "https://example.com/register" }
  };
}

// FAQ data
export function getFAQData() {
  return [
    { question: "Where is the library?", answer: "The library is next to the main hall." }
  ];
}

// Types for the data
export interface ScheduleItem {
  time: string;
  name: string;
  location: string;
}

export interface ScheduleData {
  classes: ScheduleItem[];
}

export interface BusItem {
  route: string;
  time: string;
  destination: string;
}

export interface BusData {
  nextBuses: BusItem[];
  routes: { name: string; description: string }[];
}

export interface MenuData {
  today: {
    breakfast: string[];
    lunch: string[];
    dinner: string[];
  };
  tomorrow: {
    breakfast: string[];
    lunch: string[];
    dinner: string[];
  };
  hours: {
    breakfast: string;
    lunch: string;
    dinner: string;
  };
}

export interface Event {
  date: string;
  name: string;
  location: string;
  time: string;
}

export interface EventData {
  upcoming: Event[];
  categories: string[];
  registration: {
    required: string[];
    link: string;
  };
}

export interface FAQItem {
  question: string;
  answer: string;
}
