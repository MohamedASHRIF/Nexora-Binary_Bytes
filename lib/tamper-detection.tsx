// Simple tamper detection function
export function detectTampering(dataType: string, data: any): boolean {
  // In a real app, this would use cryptographic hashing to verify data integrity
  // For this demo, we'll just check for some obvious signs of tampering

  switch (dataType) {
    case "schedule":
      // Check for invalid times in schedule
      if (data.today && Array.isArray(data.today)) {
        for (const item of data.today) {
          if (typeof item.time === "string") {
            const timeMatch = item.time.match(/(\d+):(\d+)/)
            if (timeMatch) {
              const hours = Number.parseInt(timeMatch[1], 10)
              const minutes = Number.parseInt(timeMatch[2], 10)
              if (hours > 23 || minutes > 59) {
                return true // Tampered
              }
            }
          }
        }
      }
      break

    case "bus":
      // Check for invalid times in bus schedule
      if (data.nextBuses && Array.isArray(data.nextBuses)) {
        for (const bus of data.nextBuses) {
          if (typeof bus.time === "string") {
            const timeMatch = bus.time.match(/(\d+):(\d+)/)
            if (timeMatch) {
              const hours = Number.parseInt(timeMatch[1], 10)
              const minutes = Number.parseInt(timeMatch[2], 10)
              if (hours > 23 || minutes > 59) {
                return true // Tampered
              }
            }
          }
        }
      }
      break

    case "cafeteria":
      // Check for suspicious menu items
      if (data.today) {
        const allItems = Object.values(data.today).flat() as string[]
        const suspiciousItems = ["poison", "toxic", "dangerous", "harmful"]

        for (const item of allItems) {
          if (typeof item === "string" && suspiciousItems.some((sus) => item.toLowerCase().includes(sus))) {
            return true // Tampered
          }
        }
      }
      break

    case "event":
      // Check for events at impossible dates
      if (data.upcoming && Array.isArray(data.upcoming)) {
        for (const event of data.upcoming) {
          if (typeof event.date === "string") {
            const dateMatch = event.date.match(/(\d+)\/(\d+)/)
            if (dateMatch) {
              const month = Number.parseInt(dateMatch[1], 10)
              const day = Number.parseInt(dateMatch[2], 10)
              if (month > 12 || day > 31) {
                return true // Tampered
              }
            }
          }
        }
      }
      break
  }

  return false // Not tampered
}
