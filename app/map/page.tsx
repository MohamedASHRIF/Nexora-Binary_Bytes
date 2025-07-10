'use client';

import { MapView } from '../../components/MapView';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

interface LocationData {
  id: string;
  name: string;
  position: {
    lat: number;
    lng: number;
  };
  description: string;
  type?: string;
  category?: string;
}

export default function MapPage() {
  const searchParams = useSearchParams();
  const [highlightedLocation, setHighlightedLocation] = useState<LocationData | null>(null);

  useEffect(() => {
    const locationName = searchParams.get('locationName');
    const encodedLocation = searchParams.get('encodedLocation');
    
    if (locationName && encodedLocation) {
      // Store in localStorage for MapView component to use
      localStorage.setItem('highlightedLocation', JSON.stringify({
        name: locationName,
        encodedLocation: encodedLocation
      }));
      
      // Create highlighted location data
      setHighlightedLocation({
        id: '1',
        name: locationName,
        position: { lat: 6.7951, lng: 79.9007 }, // Default to university center
        description: `Location: ${locationName}`
      });
    }
  }, [searchParams]);

  return (
    <div className="w-full h-screen p-4">
      <div className="w-full h-full bg-white dark:bg-slate-800 rounded-lg shadow-lg overflow-hidden">
        <MapView highlightedLocation={highlightedLocation} />
      </div>
    </div>
  );
} 