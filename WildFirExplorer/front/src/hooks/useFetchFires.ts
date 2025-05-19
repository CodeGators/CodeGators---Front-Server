import { useEffect, useState } from 'react';
import { getFireData } from '../services/fireData';

interface FireData {
  id: string;
  estado: string;
  bioma: string;
  data: string;
  latitude: number;
  longitude: number;
  tipo: string;
}

export function useFetchFires(filters: { estado: string; bioma: string; tipo: string }) {
  const [data, setData] = useState<FireData[]>([]);

  useEffect(() => {
    async function fetchData() {
      const result = await getFireData(filters);
      setData(result);
    }
    fetchData();
  }, [filters]);

  return data;
}