import { createContext, useState, type ReactNode, useContext } from 'react';

// Definindo o tipo do filtro
export type Filter = {
  estado?: string;
  bioma?: string;
  tipo: 'Focos' | 'Queimadas' | 'Risco';
  mes?: string;   // Mes no formato YYYY-MM
  satelite?: string;
};

type FilterContextType = {
  filters: Filter;
  setFilters: (f: Filter) => void;
};

// Aqui fornecemos um valor inicial válido para garantir que o contexto nunca seja undefined
const defaultFilter: Filter = {
  estado: '',
  bioma: '',
  tipo: 'Focos',
  mes: '',
  satelite: ''
};

export const FilterContext = createContext<FilterContextType>({
  filters: defaultFilter,
  setFilters: () => {}, // uma função vazia
});

export function FilterProvider({ children }: { children: ReactNode }) {
  const [filters, setFilters] = useState<Filter>(defaultFilter);

  return (
    <FilterContext.Provider value={{ filters, setFilters }}>
      {children}
    </FilterContext.Provider>
  );
}

// Hook para consumir o contexto de filtro de maneira segura
export function useFilter() {
  const context = useContext(FilterContext);
  
  // Garantindo que o contexto sempre retornará um valor não undefined
  if (!context) {
    throw new Error('useFilter must be used within a FilterProvider');
  }

  return context;
}
