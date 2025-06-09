"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MapPin, Search } from "lucide-react"

const LOCATIONS = [
  { id: "library", name: "Library", x: 30, y: 20 },
  { id: "cafeteria", name: "Cafeteria", x: 70, y: 30 },
  { id: "admin", name: "Admin Building", x: 50, y: 60 },
  { id: "science", name: "Science Block", x: 20, y: 70 },
  { id: "arts", name: "Arts Building", x: 80, y: 70 },
  { id: "sports", name: "Sports Complex", x: 40, y: 85 },
  { id: "dorms", name: "Dormitories", x: 85, y: 40 },
  { id: "parking", name: "Parking Lot", x: 15, y: 40 },
]

export default function MapView() {
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  const filteredLocations = LOCATIONS.filter((loc) => loc.name.toLowerCase().includes(searchQuery.toLowerCase()))

  return (
    <div className="flex flex-col h-full">
      <div className="mb-4 relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
        <input
          type="text"
          placeholder="Search locations..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 rounded-md border focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="space-y-2 overflow-y-auto max-h-[200px]">
          {filteredLocations.map((location) => (
            <Button
              key={location.id}
              variant={selectedLocation === location.id ? "default" : "outline"}
              className="w-full justify-start"
              onClick={() => setSelectedLocation(location.id)}
            >
              <MapPin size={16} className="mr-2" />
              {location.name}
            </Button>
          ))}
        </div>

        <Card className="p-4">
          {selectedLocation ? (
            <div>
              <h3 className="font-medium mb-2">{LOCATIONS.find((l) => l.id === selectedLocation)?.name}</h3>
              <p className="text-sm text-gray-500 mb-2">Building hours: 7:00 AM - 9:00 PM</p>
              <p className="text-sm">Follow the highlighted path on the map to reach this location.</p>
            </div>
          ) : (
            <div className="text-center text-gray-500">Select a location to see details</div>
          )}
        </Card>
      </div>

      <Card className="flex-1 relative bg-blue-50 dark:bg-gray-800 overflow-hidden">
        <div className="absolute inset-0">
          <svg width="100%" height="100%" viewBox="0 0 100 100" className="stroke-gray-300 dark:stroke-gray-600">
            {/* Campus outline */}
            <rect x="5" y="5" width="90" height="90" fill="none" strokeWidth="1" rx="10" />

            {/* Buildings */}
            <rect x="25" y="15" width="10" height="10" fill="#d1d5db" stroke="none" rx="2" />
            <rect x="65" y="25" width="10" height="10" fill="#d1d5db" stroke="none" rx="2" />
            <rect x="45" y="55" width="10" height="10" fill="#d1d5db" stroke="none" rx="2" />
            <rect x="15" y="65" width="10" height="10" fill="#d1d5db" stroke="none" rx="2" />
            <rect x="75" y="65" width="10" height="10" fill="#d1d5db" stroke="none" rx="2" />
            <rect x="35" y="80" width="10" height="10" fill="#d1d5db" stroke="none" rx="2" />
            <rect x="80" y="35" width="10" height="10" fill="#d1d5db" stroke="none" rx="2" />
            <rect x="10" y="35" width="10" height="10" fill="#d1d5db" stroke="none" rx="2" />

            {/* Paths */}
            <path d="M30 25 L 45 55" fill="none" strokeWidth="1" />
            <path d="M55 60 L 65 35" fill="none" strokeWidth="1" />
            <path d="M45 55 L 20 65" fill="none" strokeWidth="1" />
            <path d="M55 60 L 75 70" fill="none" strokeWidth="1" />
            <path d="M45 65 L 40 80" fill="none" strokeWidth="1" />
            <path d="M15 40 L 25 55" fill="none" strokeWidth="1" />
            <path d="M75 30 L 80 35" fill="none" strokeWidth="1" />

            {/* Selected location highlight */}
            {selectedLocation &&
              (() => {
                const location = LOCATIONS.find((l) => l.id === selectedLocation)
                if (!location) return null
                return (
                  <>
                    <circle cx={location.x} cy={location.y} r="3" fill="purple" className="animate-ping opacity-75" />
                    <circle cx={location.x} cy={location.y} r="2" fill="purple" />
                  </>
                )
              })()}
          </svg>

          {/* Location labels */}
          {LOCATIONS.map((location) => (
            <div
              key={location.id}
              className="absolute text-xs font-medium"
              style={{
                left: `${location.x}%`,
                top: `${location.y}%`,
                transform: "translate(-50%, -50%)",
                pointerEvents: "none",
              }}
            >
              <div className="bg-white dark:bg-gray-700 px-1 rounded shadow-sm whitespace-nowrap">{location.name}</div>
            </div>
          ))}
        </div>

        <div className="absolute bottom-4 right-4 bg-white dark:bg-gray-700 p-2 rounded-md shadow-md text-xs">
          <div className="font-medium mb-1">Legend</div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-purple-600 rounded-full"></div>
            <span>Selected Location</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-gray-300 dark:bg-gray-500 rounded"></div>
            <span>Buildings</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-0.5 bg-gray-300 dark:bg-gray-600"></div>
            <span>Paths</span>
          </div>
        </div>
      </Card>
    </div>
  )
}
