import { useContext, useEffect, useState } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import styled from 'styled-components';
import { FilterContext } from '../contexts/FilterContext';
import fogoIconUrl from './fogo.png';

// ✅ Tipagem precisa para o GeoJson
type GeoJson = {
  type: 'FeatureCollection';
  features: Array<{
    type: 'Feature';
    geometry: {
      type: 'Point' | 'Polygon' | 'MultiPolygon';  // Tipagem para tipos específicos de geometria
      coordinates: [number, number] | number[][][];  // Tipagem para pontos e polígonos
    };
    properties: Record<string, unknown>;  // Usando Record<string, unknown> para evitar o uso de 'any'
  }>;
};


// ✅ Tipagem clara para as props do LayerControl
interface LayerControlProps {
  geojson: GeoJson;
  tipo: 'Focos' | 'Áreas';  // Tipagem restrita para o tipo de dado
}

// Use this to wrap the map
const Wrapper = styled.div`
  width: 100%;
  height: calc(100vh - 60px);
`;

function LayerControl({ geojson, tipo }: LayerControlProps) {
  const map = useMap();
  const [layer] = useState(() => L.layerGroup().addTo(map));

  useEffect(() => {
    layer.clearLayers();
    if (!geojson || !geojson.features) return;

    if (tipo === 'Focos') {
      const fireIcon = L.icon({
        iconUrl: fogoIconUrl,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      L.geoJSON(geojson, {
        pointToLayer: (_, latlng) => L.marker(latlng, { icon: fireIcon }),
      }).addTo(layer);
    } else {
      L.geoJSON(geojson).addTo(layer);
    }
  }, [geojson, tipo, layer]);

  return null;
}

type FilterContextType = {
  filters: {
    tipo: 'Focos' | 'Áreas';  // Restrito para dois tipos
    estado?: string;
    bioma?: string;
    mes?: string;
    satelite?: string;
  };
};

export default function Map() {
  const { filters } = useContext(FilterContext) as FilterContextType;  // Tipando corretamente o contexto
  const [geojson, setGeojson] = useState<GeoJson | null>(null);

  useEffect(() => {
    if (!filters?.mes) return; // Garantir que mes esteja definido

    const { tipo, estado, bioma, mes, satelite } = filters;

    const rota =
      tipo === 'Focos'
        ? bioma
          ? 'focos-bioma'
          : 'focos-estado'
        : bioma
        ? 'area-bioma'
        : 'area-estado';

    const params = new URLSearchParams();
    if (estado) params.set('estado', estado);
    if (bioma) params.set('bioma', bioma);
    params.set('mes', mes);
    if (tipo === 'Focos' && satelite) params.set('satelite', satelite);

    fetch(`http://localhost:4000/api/${rota}?${params}`)
      .then((r) => r.json())
      .then((data: GeoJson) => setGeojson(data))
      .catch((err) => {
        console.error('Erro ao carregar GeoJSON:', err);
        setGeojson(null);
      });
  }, [filters]);

  return (
    <Wrapper>
      <MapContainer center={[-15, -55]} zoom={5} style={{ width: '100%', height: '100%' }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {geojson && <LayerControl geojson={geojson} tipo={filters.tipo} />}
      </MapContainer>
    </Wrapper>
  );
}
