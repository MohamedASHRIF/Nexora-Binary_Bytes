"use client"

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { MapView } from '@/components/MapView';

interface LocationData {
  id: string;
  name: string;
  position: {
    lat: number;
    lng: number;
  };
  description: string;
  type: string;
  category: string;
}

export default function LocationMapPage() {
  const params = useParams();
  const router = useRouter();
  const [location, setLocation] = useState<LocationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLocation = async () => {
      try {
        setLoading(true);
        const locationName = decodeURIComponent(params.location as string);
        
        // First try to find the location in our database
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
        const response = await fetch(`${apiUrl}/locations/search?query=${encodeURIComponent(locationName)}`);
        
        if (response.ok) {
          const data = await response.json();
          if (data.data.locations && data.data.locations.length > 0) {
            const foundLocation = data.data.locations[0];
            setLocation({
              id: foundLocation._id,
              name: foundLocation.name,
              position: foundLocation.position,
              description: foundLocation.description,
              type: foundLocation.type,
              category: foundLocation.category
            });
          } else {
            // If not found in database, use hardcoded locations as fallback
            const hardcodedLocations = [
              {
                id: '1',
                name: 'Main Building',
                position: { lat: 6.7951, lng: 79.9007 },
                description: 'The main administrative building of the university',
                type: 'building',
                category: 'administration'
              },
              {
                id: '2',
                name: 'Engineering Faculty',
                position: { lat: 6.7955, lng: 79.9010 },
                description: 'Faculty of Engineering building',
                type: 'building',
                category: 'academic'
              },
              {
                id: '3',
                name: 'Architecture Faculty',
                position: { lat: 6.7948, lng: 79.9005 },
                description: 'Faculty of Architecture building',
                type: 'building',
                category: 'academic'
              },
              {
                id: '4',
                name: 'IT Faculty',
                position: { lat: 6.7953, lng: 79.9008 },
                description: 'Faculty of Information Technology',
                type: 'building',
                category: 'academic'
              },
              {
                id: '5',
                name: 'Library',
                position: { lat: 6.7949, lng: 79.9006 },
                description: 'University Library',
                type: 'facility',
                category: 'academic'
              },
              {
                id: '6',
                name: 'Cafeteria',
                position: { lat: 6.7952, lng: 79.9009 },
                description: 'Main Cafeteria',
                type: 'facility',
                category: 'dining'
              }
            ];

            const foundLocation = hardcodedLocations.find(loc => 
              loc.name.toLowerCase().includes(locationName.toLowerCase()) ||
              locationName.toLowerCase().includes(loc.name.toLowerCase())
            );

            if (foundLocation) {
              setLocation(foundLocation);
            } else {
              setError(`Location "${locationName}" not found. Please try searching for a different location.`);
            }
          }
        } else {
          setError('Failed to fetch location data. Please try again.');
        }
      } catch (err) {
        console.error('Error fetching location:', err);
        setError('An error occurred while fetching location data.');
      } finally {
        setLoading(false);
      }
    };

    if (params.location) {
      fetchLocation();
    }
  }, [params.location]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-4">Loading Map...</h2>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center p-6 bg-white rounded-lg shadow-lg max-w-md">
          <h2 className="text-xl font-semibold mb-4 text-red-600">Location Not Found</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
          >
            Back to Chat
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {location?.name}
              </h1>
              <p className="text-gray-600 mt-1">
                {location?.description}
              </p>
            </div>
            <button
              onClick={() => router.push('/')}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
            >
              Back to Chat
            </button>
          </div>
        </div>
      </div>
      
      <div className="h-[calc(100vh-120px)]">
        <MapView 
          highlightedLocation={location}
          center={location?.position}
          zoom={18}
        />
      </div>
    </div>
  );
} 