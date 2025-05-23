import { useContext, useEffect, useState } from 'react';
import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import styled from 'styled-components';
import { FilterContext } from '../contexts/FilterContext';

import fogoBaixo from './images/fogobaixo.png';
import fogoMedio from './images/fogomedio.png';
import fogoAlto from './images/fogoalto.png';
import fogoMuitoAlto from './images/fogomuitoalto.png';

type GeoJson = {
  type: 'FeatureCollection';
  features: Array<{
    type: 'Feature';
    geometry: {
      type: 'Point' | 'Polygon' | 'MultiPolygon';
      coordinates: any;
    };
    properties: Record<string, unknown>;
  }>;
};

const Wrapper = styled.div`
  width: 100%;
  height: calc(100vh - 60px);
`;

function getIconByFRP(frp: number | null | undefined) {
  let iconUrl = fogoBaixo;

  if (frp == null || isNaN(frp)) {
    iconUrl = fogoBaixo;
  } else if (frp < 10) {
    iconUrl = fogoBaixo;
  } else if (frp < 30) {
    iconUrl = fogoMedio;
  } else if (frp < 100) {
    iconUrl = fogoAlto;
  } else {
    iconUrl = fogoMuitoAlto;
  }

  return L.icon({
    iconUrl,
    iconSize: [40, 40],
    iconAnchor: [12, 12],
  });
}

function LayerControl({ geojson, tipo }: { geojson: GeoJson; tipo: 'Focos' | 'Queimadas' | 'Risco' | 'Áreas' }) {
  const map = useMap();
  const [layer] = useState(() => L.layerGroup().addTo(map));

  useEffect(() => {
    layer.clearLayers();
    if (!geojson || !geojson.features) return;

    if (tipo === 'Focos') {
      L.geoJSON(geojson, {
        pointToLayer: (feature, latlng) => {
          const rawFrp = feature.properties?.frp;
          const frp = typeof rawFrp === 'number' ? rawFrp : parseFloat(String(rawFrp));
          return L.marker(latlng, { icon: getIconByFRP(frp) });
        },
        
        onEachFeature: (feature, layer) => {
          const { frp, satelite, risco_fogo, data_hora } = feature.properties || {};
          const popup = `
            <strong>FRP:</strong> ${frp ?? 'N/A'}<br/>
            <strong>Satélite:</strong> ${satelite ?? 'N/A'}<br/>
            <strong>Risco de Fogo:</strong> ${risco_fogo ?? 'N/A'}<br/>
            <strong>Data:</strong> ${data_hora ? new Date(data_hora).toLocaleString() : 'N/A'}
          `;
          layer.bindPopup(popup);
        },
      }).addTo(layer);
    } else {
      L.geoJSON(geojson, {
        style: {
          color: '#b30000',     // Borda vermelha escura
          fillColor: '#ff0000', // Preenchimento vermelho forte
          fillOpacity: 0.8,     // Transparência do preenchimento
          weight: 2             // Espessura da borda
        }
      }).addTo(layer);
    }
  }, [geojson, tipo, layer]);

  return null;
}

export default function Map() {
  const { filters } = useContext(FilterContext)!;
  const [geojson, setGeojson] = useState<GeoJson | null>(null);
  const [estadoPoligono, setEstadoPoligono] = useState<GeoJson | null>(null);


  useEffect(() => {
    if (!filters?.mes) return;

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

   // buscar polígono do estado, se checkbox estiver ativo
   useEffect(() => {
       if (!filters.estado || !filters.estadoPoligono) {
           setEstadoPoligono(null);
           return;
         }
   // Limpa o polígono antigo imediatamente
       setEstadoPoligono(null);
    
        fetch(`http://localhost:4000/api/poligono-estado?estado=${filters.estado}`)
          .then(res => {
            if (!res.ok) throw new Error(`Status ${res.status}`);
            return res.json();
          })
          .then((data: GeoJson) => {
            data.features = data.features ?? [];
            setEstadoPoligono(data);
          })
          .catch((err) => {
            console.error('Erro ao carregar polígono do estado:', err);
            setEstadoPoligono(null);
          });
      }, [filters.estado, filters.estadoPoligono]);
    
      const [biomaPoligonoGeo, setBiomaPoligonoGeo] = useState<GeoJson | null>(null);
                                    //BIOMA
      // buscar polígono do bioma, se checkbox estiver ativo
      useEffect(() => {
        if (!filters.bioma || !filters.biomaPoligono) {
          setBiomaPoligonoGeo(null);
          return;
        }
    
        // limpa imediatamente o polígono anterior
        setBiomaPoligonoGeo(null);
    
        fetch(`http://localhost:4000/api/poligono-bioma?bioma=${filters.bioma}`)
          .then(res => {
            if (!res.ok) throw new Error(`Status ${res.status}`);
            return res.json();
          })
          .then((data: GeoJson) => {
            data.features = data.features ?? [];
            setBiomaPoligonoGeo(data);
          })
          .catch(err => {
            console.error('Erro ao carregar polígono do bioma:', err);
            setBiomaPoligonoGeo(null);
          });
      }, [filters.bioma, filters.biomaPoligono]);

      return (
        <Wrapper>
          <MapContainer center={[-15, -55]} zoom={5} style={{ width: '100%', height: '100%' }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
    
            {geojson && <LayerControl geojson={geojson} tipo={filters.tipo} />}
    
            {estadoPoligono?.type === 'FeatureCollection' &&
             Array.isArray(estadoPoligono.features) && (
              <GeoJSON
                key={`pol-est-${filters.estado}`}
                data={estadoPoligono}
                style={{ color: 'blue', weight: 2 }}
              />
            )}
    
            {biomaPoligonoGeo?.type === 'FeatureCollection' &&
             Array.isArray(biomaPoligonoGeo.features) && (
              <GeoJSON
                key={`pol-bio-${filters.bioma}`}
                data={biomaPoligonoGeo}
                style={{ color: 'green', weight: 2, fillOpacity: 0.1 }}
              />
            )}
          </MapContainer>
        </Wrapper>
      );
    }