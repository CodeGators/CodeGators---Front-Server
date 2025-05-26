// src/contexts/FilterContext.tsx
import { createContext, useState, type ReactNode, useContext } from 'react';

// Definindo o tipo do filtro (adicionando enableClustering)
export type Filter = {
  estado?: string;
  bioma?: string;
  tipo: 'Focos' | 'Queimadas' | 'Risco';
  mes?: string;
  satelite?: string;
  estadoPoligono?: boolean;
  biomaPoligono?: boolean;
  enableClustering?: boolean; // Novo filtro para clustering
};


type FilterContextType = {
  filters: Filter;
  setFilters: (f: Filter) => void;
};

const defaultFilter: Filter = {
  estado: '',
  bioma: '',
  tipo: 'Focos',
  mes: '',
  satelite: '',
  estadoPoligono: true,
  biomaPoligono: true,
  enableClustering: true, // Começa com clustering ativado por padrão
};

export const FilterContext = createContext<FilterContextType>({
  filters: defaultFilter,
  setFilters: () => {},
});

export function FilterProvider({ children }: { children: ReactNode }) {
  const [filters, setFilters] = useState<Filter>(defaultFilter);

  return (
    <FilterContext.Provider value={{ filters, setFilters }}>
      {children}
    </FilterContext.Provider>
  );
}

export function useFilter() {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error('useFilter must be used within a FilterProvider');
  }
  return context;
}