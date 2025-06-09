interface StorageItem<T> {
  data: T;
  timestamp: number;
  expiry?: number;
}

export const setItem = <T>(key: string, data: T, expiryInHours?: number): void => {
  const item: StorageItem<T> = {
    data,
    timestamp: Date.now(),
    expiry: expiryInHours ? Date.now() + expiryInHours * 60 * 60 * 1000 : undefined,
  };
  localStorage.setItem(key, JSON.stringify(item));
};

export const getItem = <T>(key: string): T | null => {
  const item = localStorage.getItem(key);
  if (!item) return null;

  try {
    const parsedItem: StorageItem<T> = JSON.parse(item);
    
    // Check if item has expired
    if (parsedItem.expiry && Date.now() > parsedItem.expiry) {
      localStorage.removeItem(key);
      return null;
    }

    return parsedItem.data;
  } catch {
    return null;
  }
};

export const removeItem = (key: string): void => {
  localStorage.removeItem(key);
};

export const clearAll = (): void => {
  localStorage.clear();
};

// Example usage:
// setItem('schedules', schedules, 24); // Expires in 24 hours
// const cachedSchedules = getItem('schedules');
// if (cachedSchedules) {
//   // Use cached data
// } 