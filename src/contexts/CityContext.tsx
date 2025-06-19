
"use client";
import type { City } from '@/types';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy, DocumentData } from 'firebase/firestore';
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
    const fetchCities = async () => {
      setLoadingCities(true);
      try {
        const citiesColRef = collection(db, "cities");
        const q = query(citiesColRef, orderBy("order", "asc"), orderBy("name", "asc"));
        const snapshot = await getDocs(q);
        
        const fetchedCities: City[] = snapshot.docs.map(doc => {
          const data = doc.data() as DocumentData;
          return {
            id: doc.id,
            value: data.name, // Using Mongolian name as the value for filtering entries by data.khot
            label: data.name,
            label_cn: data.nameCN,
            isMajor: data.cityType === 'major', // isMajor is true if cityType is 'major'
            order: data.order,
            cityType: data.cityType as 'major' | 'other', // Explicitly type cityType
          } as City;
        });

        const allOption: City = {
          id: 'all',
          value: 'all',
          label: t('allCities', undefined, 'Бүгд'), // Use translation for "All"
          label_cn: t('allCities', undefined, '全部'), // Use translation for "All" in Chinese
          isMajor: true, // "All" can be considered major for UI grouping if needed
          order: -1, // Ensure "All" is first
          cityType: 'all',
        };

        const citiesWithAll = [allOption, ...fetchedCities];
        setAvailableCities(citiesWithAll);

        // Set initial selected city
        const savedCityValue = typeof window !== "undefined" ? localStorage.getItem('selectedCity') : null;
        if (savedCityValue) {
          const city = citiesWithAll.find(c => c.value === savedCityValue);
          setSelectedCityState(city || allOption);
        } else {
          setSelectedCityState(allOption);
        }

      } catch (error) {
        console.error("Error fetching cities from Firestore:", error);
        // Fallback to a minimal list with "All" if fetch fails
        const allOptionFallback: City = {
          id: 'all',
          value: 'all',
          label: t('allCities', undefined, 'Бүгд'),
          label_cn: t('allCities', undefined, '全部'),
          isMajor: true,
          order: -1,
          cityType: 'all',
        };
        setAvailableCities([allOptionFallback]);
        setSelectedCityState(allOptionFallback);
      } finally {
        setLoadingCities(false);
      }
    };

    fetchCities();
  }, [t]); // Add t to dependency array

  const setSelectedCity = (city: City) => {
    setSelectedCityState(city);
    if (typeof window !== "undefined") {
      localStorage.setItem('selectedCity', city.value);
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
