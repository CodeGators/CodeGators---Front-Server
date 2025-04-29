import axios from 'axios';
import type { GeoJsonObject } from 'geojson';

interface FetchParams {
  filtro: string;
  valor?: string;
  bioma?: string;
}

export async function fetchGeoJson({ filtro, valor, bioma }: FetchParams): Promise<GeoJsonObject> {
  const params = filtro.includes('estado') ? { estado: valor } : { bioma };
  const response = await axios.get<GeoJsonObject>(`http://localhost:4000/api/${filtro}`, {
    params,
  });
  return response.data;
}
