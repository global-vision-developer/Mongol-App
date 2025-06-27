
"use client";

import type React from 'react';
import { createContext, useContext, useState } from 'react';

// SearchContext-ийн төрлийг тодорхойлох
interface SearchContextType {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

// Апп даяар хайлтын утгыг (searchTerm) хадгалах, дамжуулах Provider компонент.
export const SearchProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <SearchContext.Provider value={{ searchTerm, setSearchTerm }}>
      {children}
    </SearchContext.Provider>
  );
};

// `useSearch` hook нь context-ийг хялбар ашиглах боломжийг олгоно.
export const useSearch = (): SearchContextType => {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
};
