import React, { useState, useCallback, useRef } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow, DirectionsRenderer } from '@react-google-maps/api';

// University of Moratuwa coordinates
const UNIVERSITY_CENTER = {
  lat: 6.7951,
  lng: 79.9007
};

// Key locations on campus
const LOCATIONS = [
  {
    id: 1,
    name: 'Main Building',
    position: { lat: 6.7951, lng: 79.9007 },
    description: 'The main administrative building of the university'
  },
  {
    id: 2,
    name: 'Engineering Faculty',
    position: { lat: 6.7955, lng: 79.9010 },
    description: 'Faculty of Engineering building'
  },
  {
    id: 3,
    name: 'Architecture Faculty',
    position: { lat: 6.7948, lng: 79.9005 },
    description: 'Faculty of Architecture building'
  },
  {
    id: 4,
    name: 'IT Faculty',
    position: { lat: 6.7953, lng: 79.9008 },
    description: 'Faculty of Information Technology'
  },
  {
    id: 5,
    name: 'Library',
    position: { lat: 6.7949, lng: 79.9006 },
    description: 'University Library'
  },
  {
    id: 6,
    name: 'Cafeteria',
    position: { lat: 6.7952, lng: 79.9009 },
    description: 'Main Cafeteria'
  }
];

const containerStyle = {
  width: '100%',
  height: '100%'
};

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

interface MapViewProps {
  highlightedLocation?: LocationData | null;
  center?: { lat: number; lng: number };
  zoom?: number;
}

export const MapView: React.FC<MapViewProps> = ({ 
  highlightedLocation = null, 
  center = UNIVERSITY_CENTER, 
  zoom = 17 
}) => {
  const [selectedLocation, setSelectedLocation] = useState<typeof LOCATIONS[0] | null>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const searchBoxRef = useRef<google.maps.places.SearchBox | null>(null);

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries: ['places']
  });

  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
    
    // Only add search functionality if not in highlighted location mode
    if (!highlightedLocation) {
      const searchBox = new google.maps.places.SearchBox(
        document.getElementById('search-input') as HTMLInputElement
      );
      searchBoxRef.current = searchBox;
      map.controls[google.maps.ControlPosition.TOP_LEFT].push(
        document.getElementById('search-container') as HTMLElement
      );
    }
  }, [highlightedLocation]);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  const handleSearch = useCallback(() => {
    if (!searchBoxRef.current || !map) return;

    const places = searchBoxRef.current.getPlaces();
    if (places && places.length > 0) {
      const place = places[0];
      if (place.geometry && place.geometry.location) {
        map.panTo(place.geometry.location);
        map.setZoom(17);
        
        // Add a marker for the searched location
        new google.maps.Marker({
          map,
          position: place.geometry.location,
          title: place.name
        });
      }
    }
  }, [map]);

  const getDirections = useCallback((destination: google.maps.LatLngLiteral) => {
    if (!map) return;

    const directionsService = new google.maps.DirectionsService();
    directionsService.route(
      {
        origin: UNIVERSITY_CENTER,
        destination,
        travelMode: google.maps.TravelMode.WALKING
      },
      (result, status) => {
        if (status === google.maps.DirectionsStatus.OK && result) {
          setDirections(result);
        }
      }
    );
  }, [map]);

  // Auto-select highlighted location when component mounts
  React.useEffect(() => {
    if (highlightedLocation && map) {
      setSelectedLocation({
        id: parseInt(highlightedLocation.id),
        name: highlightedLocation.name,
        position: highlightedLocation.position,
        description: highlightedLocation.description
      });
      // Temporarily disable directions to avoid API error
      // getDirections(highlightedLocation.position);
    } else {
      // Check for highlighted location from localStorage (from chatbot redirect)
      const storedLocation = localStorage.getItem('highlightedLocation');
      if (storedLocation && map) {
        try {
          const locationData = JSON.parse(storedLocation);
          console.log('Found highlighted location in localStorage:', locationData);
          
          // Find the location in our hardcoded locations
          const foundLocation = LOCATIONS.find(loc => 
            loc.name.toLowerCase().includes(locationData.name.toLowerCase()) ||
            locationData.name.toLowerCase().includes(loc.name.toLowerCase())
          );
          
          if (foundLocation) {
            console.log('Highlighting location:', foundLocation.name);
            setSelectedLocation(foundLocation);
            // Temporarily disable directions to avoid API error
            // getDirections(foundLocation.position);
            
            // Clear the stored location after using it
            localStorage.removeItem('highlightedLocation');
          }
        } catch (error) {
          console.error('Error parsing stored location:', error);
          localStorage.removeItem('highlightedLocation');
        }
      }
    }
  }, [highlightedLocation, map]);

  if (loadError) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-center p-4 bg-white rounded-lg shadow-lg max-w-md">
          <h2 className="text-xl font-semibold mb-4 text-red-600">Map Loading Error</h2>
          <p className="text-gray-600 mb-4">
            {loadError.message === 'ApiProjectMapError'
              ? 'Google Maps API key is missing or invalid. Please check your configuration.'
              : 'Failed to load the map. Please try again later.'}
          </p>
          <div className="text-sm text-gray-500">
            <p>To fix this:</p>
            <ol className="list-decimal list-inside mt-2">
              <li>Create a Google Cloud project</li>
              <li>Enable Maps JavaScript API</li>
              <li>Create an API key</li>
              <li>Add the key to your .env.local file</li>
            </ol>
          </div>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-4">Loading Map...</h2>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      {!highlightedLocation && (
        <div id="search-container" className="absolute top-4 left-4 z-10">
          <div className="bg-white p-4 rounded-lg shadow-lg">
            <input
              id="search-input"
              type="text"
              placeholder="Search locations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            />
            <button
              onClick={handleSearch}
              className="mt-2 w-full bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600"
            >
              Search
            </button>
          </div>
        </div>
      )}

      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={zoom}
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={{
          styles: [
            {
              featureType: 'poi',
              elementType: 'labels',
              stylers: [{ visibility: 'off' }]
            }
          ],
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false
        }}
      >
        {LOCATIONS.map((location) => (
          <Marker
            key={location.id}
            position={location.position}
            onClick={() => {
              setSelectedLocation(location);
              getDirections(location.position);
            }}
            icon={highlightedLocation && highlightedLocation.name === location.name ? {
              url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="20" cy="20" r="18" fill="#FF4444" stroke="#FFFFFF" stroke-width="3"/>
                  <circle cx="20" cy="20" r="8" fill="#FFFFFF"/>
                </svg>
              `),
              scaledSize: new google.maps.Size(40, 40),
              anchor: new google.maps.Point(20, 20)
            } : undefined}
          />
        ))}

        {selectedLocation && (
          <InfoWindow
            position={selectedLocation.position}
            onCloseClick={() => {
              setSelectedLocation(null);
              setDirections(null);
            }}
          >
            <div className="p-2">
              <h3 className="font-semibold text-lg">{selectedLocation.name}</h3>
              <p className="text-gray-600">{selectedLocation.description}</p>
              {/* Temporarily hide directions button to avoid API error */}
              {/* <button
                onClick={() => getDirections(selectedLocation.position)}
                className="mt-2 bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
              >
                Get Directions
              </button> */}
            </div>
          </InfoWindow>
        )}

        {directions && <DirectionsRenderer directions={directions} />}
      </GoogleMap>

      {!highlightedLocation && (
        <div className="absolute top-4 right-4 bg-white p-4 rounded-lg shadow-lg">
          <h2 className="text-lg font-semibold mb-2">University of Moratuwa</h2>
          <p className="text-sm text-gray-600">
            Click on markers to see location details and get directions
          </p>
        </div>
      )}
    </div>
  );
}; 