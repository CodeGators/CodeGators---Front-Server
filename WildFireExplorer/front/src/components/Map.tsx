// src/components/Map.tsx
import { useContext, useEffect, useState } from 'react';
import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import styled from 'styled-components';
import { FilterContext } from '../contexts/FilterContext';

import MarkerClusterGroup from 'react-leaflet-markercluster';

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

// Função de interpolação de cores
function interpolateColor(color1: string, color2: string, factor: number): string {
  const hexToRgb = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return [r, g, b];
  };

  const rgbToHex = (r: number, g: number, b: number) => {
    return '#' + [r, g, b].map(x => {
      const hex = Math.round(x).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('');
  };

  const c1 = hexToRgb(color1);
  const c2 = hexToRgb(color2);

  const r = c1[0] + factor * (c2[0] - c1[0]);
  const g = c1[1] + factor * (c2[1] - c1[1]);
  const b = c1[2] + factor * (c2[2] - c1[2]);

  return rgbToHex(r, g, b);
}

// Função para obter a cor com base na intensidade do risco (0 a 1)
function getColorByRiskIntensity(risk: number | null | undefined): string {
  if (risk == null || isNaN(risk)) {
    return '#cccccc'; // Cinza para N/A
  }
  const clampedRisk = Math.max(0, Math.min(1, risk)); // Garante que o valor esteja entre 0 e 1

  const startColor = '#ffff00'; // Amarelo (risco baixo)
  const endColor = '#ff0000';   // Vermelho (risco alto)

  return interpolateColor(startColor, endColor, clampedRisk);
}

// Componente para controlar a camada GeoJSON de tipos que NÃO USAM CLUSTERING (ex: Queimadas)
function LayerControl({ geojson, tipo }: { geojson: GeoJson; tipo: 'Focos' | 'Queimadas' | 'Risco' | 'Áreas' }) {
  const map = useMap();

  useEffect(() => {
    let geoJsonLayer: L.GeoJSON;

    if (!geojson || !geojson.features || geojson.features.length === 0) {
      return;
    }

    if (tipo === 'Queimadas') {
      geoJsonLayer = L.geoJSON(geojson, {
        style: {
          color: '#b30000',
          fillColor: '#ff0000',
          fillOpacity: 0.8,
          weight: 2
        }
      }).addTo(map);
    }

    return () => {
      if (tipo === 'Queimadas' && geoJsonLayer) {
         map.removeLayer(geoJsonLayer);
      }
    };
  }, [geojson, tipo, map]);

  return null;
}

export default function Map() {
  const { filters } = useContext(FilterContext)!;
  const [geojson, setGeojson] = useState<GeoJson | null>(null);
  const [estadoPoligono, setEstadoPoligono] = useState<GeoJson | null>(null);
  const [biomaPoligonoGeo, setBiomaPoligonoGeo] = useState<GeoJson | null>(null);

  // Efeito principal para buscar Focos de Calor ou Áreas Queimadas
  useEffect(() => {
    setGeojson(null);

    if (!filters?.mes) {
      return;
    }

    const { tipo, estado, bioma, mes, satelite } = filters;

    let rota: string = '';
    const params = new URLSearchParams();
    let shouldFetch = true;

    // Lógica MODIFICADA para incluir 'Risco' na busca de dados de foco
    if (tipo === 'Focos' || tipo === 'Risco') {
      if (bioma && !isNaN(Number(bioma))) {
        rota = 'focos-bioma';
        params.set('bioma', bioma);
      } else if (estado && !isNaN(Number(estado))) {
        rota = 'focos-estado';
        params.set('estado', estado);
      } else {
        shouldFetch = false;
      }
      params.set('mes', mes);
      if (tipo === 'Focos' && satelite) { // Satélite só é relevante para 'Focos'
        params.set('satelite', satelite);
      }
    } else if (tipo === 'Queimadas') {
      if (bioma && !isNaN(Number(bioma))) {
        rota = 'area-bioma';
        params.set('bioma', bioma);
      } else if (estado && !isNaN(Number(estado))) {
        rota = 'area-estado';
        params.set('estado', estado);
      } else {
        shouldFetch = false;
      }
      params.set('mes', mes);
    } else {
      shouldFetch = false;
    }

    if (!shouldFetch) {
      return;
    }

    fetch(`http://localhost:4000/api/${rota}?${params}`)
      .then((r) => {
        if (!r.ok) {
          throw new Error(`HTTP error! status: ${r.status}`);
        }
        return r.json();
      })
      .then((data: GeoJson) => {
        data.features = data.features ?? [];
        data.features = data.features.filter(f => {
            // Garante que para Focos ou Risco, só apareçam pontos
            if (tipo === 'Focos' || tipo === 'Risco') return f.geometry.type === 'Point';
            // Para Queimadas, garanta que apareçam polígonos
            if (tipo === 'Queimadas') return f.geometry.type === 'Polygon' || f.geometry.type === 'MultiPolygon';
            return true;
        });
        setGeojson(data);
      })
      .catch((err) => {
        console.error(`Erro ao carregar GeoJSON para ${rota}:`, err);
        setGeojson(null);
      });
  }, [filters]);

  // Efeito para buscar polígono do estado
  useEffect(() => {
    setEstadoPoligono(null);
    if (!filters.estado || !filters.estadoPoligono || isNaN(Number(filters.estado))) {
      return;
    }

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

  // Efeito para buscar polígono do bioma
  useEffect(() => {
    setBiomaPoligonoGeo(null);
    if (!filters.bioma || !filters.biomaPoligono || isNaN(Number(filters.bioma))) {
      return;
    }

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

        {/* --- Renderização para Focos --- */}
        {filters.tipo === 'Focos' && geojson && geojson.features.length > 0 && (
          filters.enableClustering ? ( // Se clustering ativado
            <MarkerClusterGroup chunkedLoading>
              <GeoJSON
                data={geojson}
                pointToLayer={(feature, latlng) => {
                  const rawFrp = feature.properties?.frp;
                  const frp = typeof rawFrp === 'number' ? rawFrp : parseFloat(String(rawFrp));
                  return L.marker(latlng, { icon: getIconByFRP(frp) });
                }}
                onEachFeature={(feature, layer) => {
                  const { frp, satelite, risco_fogo, data_hora } = feature.properties || {};
                  const popup = `
                    <strong>FRP:</strong> ${frp ?? 'N/A'}<br/>
                    <strong>Satélite:</strong> ${satelite ?? 'N/A'}<br/>
                    <strong>Risco de Fogo:</strong> ${risco_fogo ?? 'N/A'}<br/>
                    <strong>Data:</strong> ${data_hora ? new Date(data_hora).toLocaleString() : 'N/A'}
                  `;
                  layer.bindPopup(popup);
                }}
              />
            </MarkerClusterGroup>
          ) : ( // Se clustering desativado
            <GeoJSON
              data={geojson}
              pointToLayer={(feature, latlng) => {
                const rawFrp = feature.properties?.frp;
                const frp = typeof rawFrp === 'number' ? rawFrp : parseFloat(String(rawFrp));
                return L.marker(latlng, { icon: getIconByFRP(frp) });
              }}
              onEachFeature={(feature, layer) => {
                const { frp, satelite, risco_fogo, data_hora } = feature.properties || {};
                const popup = `
                  <strong>FRP:</strong> ${frp ?? 'N/A'}<br/>
                  <strong>Satélite:</strong> ${satelite ?? 'N/A'}<br/>
                  <strong>Risco de Fogo:</strong> ${risco_fogo ?? 'N/A'}<br/>
                  <strong>Data:</strong> ${data_hora ? new Date(data_hora).toLocaleString() : 'N/A'}
                `;
                layer.bindPopup(popup);
              }}
            />
          )
        )}

        {/* --- Renderização para Risco de Fogo --- */}
        {filters.tipo === 'Risco' && geojson && geojson.features.length > 0 && (
          filters.enableClustering ? ( // Se clustering ativado para Risco
            <MarkerClusterGroup chunkedLoading>
              <GeoJSON
                data={geojson}
                pointToLayer={(feature, latlng) => {
                  const rawRisco = feature.properties?.risco_fogo;
                  const risco = typeof rawRisco === 'number' ? rawRisco : parseFloat(String(rawRisco));
                  console.log("Risco para ponto:", risco, "Cor:", getColorByRiskIntensity(risco)); // Log de depuração
                  return L.circleMarker(latlng, {
                    radius: 6, // Ajuste o tamanho do círculo conforme necessário
                    fillColor: getColorByRiskIntensity(risco),
                    color: '#000', // Borda do círculo
                    weight: 1,
                    opacity: 1,
                    fillOpacity: 0.8
                  });
                }}
                onEachFeature={(feature, layer) => {
                  const { frp, satelite, risco_fogo, data_hora } = feature.properties || {};
                  const popup = `
                    <strong>Risco de Fogo:</strong> ${risco_fogo ?? 'N/A'}<br/>
                    <strong>FRP:</strong> ${frp ?? 'N/A'}<br/>
                    <strong>Satélite:</strong> ${satelite ?? 'N/A'}<br/>
                    <strong>Data:</strong> ${data_hora ? new Date(data_hora).toLocaleString() : 'N/A'}
                  `;
                  layer.bindPopup(popup);
                }}
              />
            </MarkerClusterGroup>
          ) : ( // Se clustering desativado para Risco
            <GeoJSON
              data={geojson}
              pointToLayer={(feature, latlng) => {
                const rawRisco = feature.properties?.risco_fogo;
                const risco = typeof rawRisco === 'number' ? rawRisco : parseFloat(String(rawRisco));
                console.log("Risco para ponto (sem cluster):", risco, "Cor:", getColorByRiskIntensity(risco)); // Log de depuração
                return L.circleMarker(latlng, {
                  radius: 6,
                  fillColor: getColorByRiskIntensity(risco),
                  color: '#000',
                  weight: 1,
                  opacity: 1,
                  fillOpacity: 0.8
                });
              }}
              onEachFeature={(feature, layer) => {
                const { frp, satelite, risco_fogo, data_hora } = feature.properties || {};
                const popup = `
                  <strong>Risco de Fogo:</strong> ${risco_fogo ?? 'N/A'}<br/>
                  <strong>FRP:</strong> ${frp ?? 'N/A'}<br/>
                  <strong>Satélite:</strong> ${satelite ?? 'N/A'}<br/>
                  <strong>Data:</strong> ${data_hora ? new Date(data_hora).toLocaleString() : 'N/A'}
                `;
                layer.bindPopup(popup);
              }}
            />
          )
        )}

        {/* --- Renderização para Queimadas --- */}
        {filters.tipo === 'Queimadas' && geojson && geojson.features.length > 0 && (
          <LayerControl geojson={geojson} tipo={filters.tipo} />
        )}

        {/* --- Renderização de Polígonos de Estado e Bioma --- */}
        {estadoPoligono?.type === 'FeatureCollection' &&
         Array.isArray(estadoPoligono.features) &&
         estadoPoligono.features.length > 0 && (
          <GeoJSON
            key={`pol-est-${filters.estado}`}
            data={estadoPoligono}
            style={{ color: 'blue', weight: 2 }}
          />
        )}

        {biomaPoligonoGeo?.type === 'FeatureCollection' &&
         Array.isArray(biomaPoligonoGeo.features) &&
         biomaPoligonoGeo.features.length > 0 && (
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