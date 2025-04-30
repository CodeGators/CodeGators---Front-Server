import { createContext, useState, ReactNode } from 'react';

type FilterContextType = {
  filters: {
    estado: string;
    bioma: string;
    tipo: string;
  };
  setFilters: (filters: { estado: string; bioma: string; tipo: string }) => void;
};

export const FilterContext = createContext<FilterContextType | undefined>(undefined);

export function FilterProvider({ children }: { children: ReactNode }) {
  const [filters, setFilters] = useState({ estado: '', bioma: '', tipo: '' });

  return (
    <FilterContext.Provider value={{ filters, setFilters }}>
      {children}
    </FilterContext.Provider>
  );
}