import { useState, useEffect } from 'react';
import { Location } from '../types';
import { getCurrentLocation } from '../utils/helpers';

interface UseGeolocationReturn {
  location: Location | null;
  error: string | null;
  isLoading: boolean;
  getCurrentPosition: () => Promise<void>;
}

export const useGeolocation = (autoFetch: boolean = false): UseGeolocationReturn => {
  const [location, setLocation] = useState<Location | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const getCurrentPosition = async (): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const position = await getCurrentLocation();
      setLocation(position);
      
      // Store in localStorage for future use
      localStorage.setItem('lastKnownLocation', JSON.stringify(position));
    } catch (err: any) {
      let errorMessage = 'Unable to get your location';
      
      if (err.code === 1) {
        errorMessage = 'Location access denied. Please enable location services.';
      } else if (err.code === 2) {
        errorMessage = 'Location unavailable. Please try again.';
      } else if (err.code === 3) {
        errorMessage = 'Location request timed out. Please try again.';
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Try to load last known location from localStorage
    const storedLocation = localStorage.getItem('lastKnownLocation');
    if (storedLocation) {
      try {
        setLocation(JSON.parse(storedLocation));
      } catch {
        // Invalid stored location, ignore
      }
    }

    if (autoFetch) {
      getCurrentPosition();
    }
  }, [autoFetch]);

  return {
    location,
    error,
    isLoading,
    getCurrentPosition
  };
};