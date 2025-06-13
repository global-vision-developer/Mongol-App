
"use client";
import type { City } from '@/types';
import { CITIES } from '@/lib/constants';
import React, { createContext, useContext, useState, useEffect } from 'react';

interface CityContextType {
  selectedCity: City | undefined;
  setSelectedCity: (city: City) => void;
  availableCities: City[];
}

const CityContext = createContext<CityContextType | undefined>(undefined);

export const CityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedCity, setSelectedCityState] = useState<City | undefined>(() => {
    // Ensure "All" is the first city or find it
    return CITIES.find(c => c.value === 'all') || CITIES[0];
  });

  useEffect(() => {
    const savedCityValue = localStorage.getItem('selectedCity');
    const defaultAllCity = CITIES.find(c => c.value === 'all');

    if (savedCityValue) {
      const city = CITIES.find(c => c.value === savedCityValue);
      if (city) {
        setSelectedCityState(city);
      } else {
        // If saved value is invalid or not "all", default to "All"
        if (defaultAllCity) setSelectedCityState(defaultAllCity);
      }
    } else {
      // If no saved value, default to "All"
      if (defaultAllCity) setSelectedCityState(defaultAllCity);
    }
  }, []);

  const setSelectedCity = (city: City) => {
    setSelectedCityState(city);
    localStorage.setItem('selectedCity', city.value);
  };

  return (
    <CityContext.Provider value={{ selectedCity, setSelectedCity, availableCities: CITIES }}>
      {children}
    </CityContext.Provider>
  );
};

export const useCity = (): CityContextType => {
  const context = useContext(CityContext);
  if (!context) {
    throw new Error('useCity must be used within a CityProvider');
  }
  return context;
};
