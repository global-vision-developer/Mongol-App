"use client";
import type { City } from '@/types';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy, type DocumentData } from 'firebase/firestore';
import { useLanguage } from './LanguageContext'; // For "All" translation

interface CityContextType {
  selectedCity: City | undefined;
  setSelectedCity: (city: City) => void;
  availableCities: City[];
  loadingCities: boolean;
}

const CityContext = createContext<CityContextType | undefined>(undefined);

export const CityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedCity, setSelectedCityState] = useState<City | undefined>(undefined);
  const [availableCities, setAvailableCities] = useState<City[]>([]);
  const [loadingCities, setLoadingCities] = useState(true);
  const { t } = useLanguage(); // For translating "All"

  useEffect(() => {
    const fetchCitiesAndSetDefault = async () => {
      setLoadingCities(true);
      const allOption: City = {
        id: 'all',
        value: 'all', // Special value for "All"
        label: t('allCities', undefined, 'Бүгд'),
        label_cn: t('allCities', undefined, '全部'),
        isMajor: true, 
        order: -1, 
        cityType: 'all',
      };
      
      try {
        const citiesColRef = collection(db, "cities");
        const q = query(citiesColRef, orderBy("order", "asc"), orderBy("name", "asc"));
        const snapshot = await getDocs(q);
        
        const fetchedCities: City[] = snapshot.docs.map(doc => {
          const data = doc.data() as DocumentData;
          const rawCityType = data.cityType as string | undefined;
          let cityType: 'major' | 'other' | undefined;

          if (rawCityType?.toLowerCase() === 'major') {
            cityType = 'major';
          } else if (rawCityType?.toLowerCase() === 'other') {
            cityType = 'other';
          }
          
          return {
            id: doc.id,
            value: doc.id,
            label: data.name,
            label_cn: data.nameCN,
            isMajor: cityType === 'major', // Derived from the normalized cityType
            order: data.order,
            cityType: cityType,
          } as City;
        });

        const citiesWithAll = [allOption, ...fetchedCities];
        setAvailableCities(citiesWithAll);
        
        // This is the key change for hydration: Set a consistent default first.
        // The server and client will both initially render with "All".
        setSelectedCityState(allOption);

      } catch (error) {
        console.error("Error fetching cities from Firestore:", error);
        setAvailableCities([allOption]);
        setSelectedCityState(allOption);
      } finally {
        setLoadingCities(false);
      }
    };

    fetchCitiesAndSetDefault();
  }, [t]);

  // This second useEffect runs ONLY on the client, after hydration, to sync with localStorage.
  useEffect(() => {
    // Only run if cities have been loaded and we're on the client
    if (typeof window !== 'undefined' && availableCities.length > 1) {
        const savedCityValue = localStorage.getItem('selectedCityValue');
        if (savedCityValue) {
          const city = availableCities.find(c => c.value === savedCityValue);
          if (city) {
            setSelectedCityState(city);
          }
        }
    }
  }, [availableCities]); // Reruns when the list of cities is populated.


  const setSelectedCity = (city: City) => {
    setSelectedCityState(city);
    if (typeof window !== "undefined") {
      localStorage.setItem('selectedCityValue', city.value); // Store ID in localStorage
    }
  };

  return (
    <CityContext.Provider value={{ selectedCity, setSelectedCity, availableCities, loadingCities }}>
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
