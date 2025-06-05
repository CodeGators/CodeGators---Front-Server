// src/components/Map.tsx
import { useContext, useEffect, useState } from 'react';
import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import styled from 'styled-components';
import { FilterContext } from '../contexts/FilterContext';

import MarkerClusterGroup from 'react-leaflet-markercluster'; // Certifique-se de que está importado e CSS também

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

// Função de interpolação de cores (para Risco de Fogo)
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

// Componente LayerControl reescrito para gerenciamento robusto da camada Leaflet
function LayerControl({ geojson, tipo }: { geojson: GeoJson; tipo: 'Focos' | 'Queimadas' | 'Risco' | 'Áreas' }) {
  const map = useMap(); // Obtém a instância do mapa Leaflet

  useEffect(() => {
    let geoJsonLayer: L.GeoJSON | null = null; // Inicialize como null

    // Apenas Queimadas são gerenciadas por este LayerControl
    if (tipo === 'Queimadas' && geojson && geojson.features && geojson.features.length > 0) {
      geoJsonLayer = L.geoJSON(geojson, {
        style: {
          color: '#b30000',
          fillColor: '#ff0000',
          fillOpacity: 0.8,
          weight: 2
        }
      }).addTo(map); // Adiciona a camada diretamente ao mapa
    }

    // Função de limpeza: remove a camada do mapa quando o componente é desmontado
    // ou quando as dependências do useEffect mudam (ou seja, quando geojson ou tipo muda)
    return () => {
      if (geoJsonLayer) { // Garante que a camada existe antes de tentar remover
         map.removeLayer(geoJsonLayer);
         geoJsonLayer = null; // Limpa a referência
      }
    };
  }, [geojson, tipo, map]); // Dependências

  return null; // Este componente não renderiza nada no DOM, apenas manipula o mapa
}

export default function Map() {
  const { filters } = useContext(FilterContext)!;
  const [geojson, setGeojson] = useState<GeoJson | null>(null);
  const [estadoPoligono, setEstadoPoligono] = useState<GeoJson | null>(null);
  const [biomaPoligonoGeo, setBiomaPoligonoGeo] = useState<GeoJson | null>(null);

  useEffect(() => {
    // SEMPRE LIMPA OS DADOS NO INÍCIO DA EXECUÇÃO DO EFFECT
    // Isso garante que o geojson anterior seja removido ANTES da nova busca.
    setGeojson(null); 

    const { tipo, estado, bioma, mes, satelite } = filters;

    let rota: string | null = null; // Inicialize rota como null (nenhuma rota válida por padrão)
    const params = new URLSearchParams();
    let isDataFetchNecessary = true; // Flag para controlar se a busca de dados é necessária

    // Lógica para determinar a rota e os parâmetros com base no tipo de filtro
    if (tipo === 'Focos') {
      // 'mes' é obrigatório para Focos
      if (!mes) { isDataFetchNecessary = false; }
      else if (bioma && !isNaN(Number(bioma))) {
        rota = 'focos-bioma';
        params.set('bioma', bioma);
      } else if (estado && !isNaN(Number(estado))) {
        rota = 'focos-estado';
        params.set('estado', estado);
      } else {
        isDataFetchNecessary = false; // Nenhuma seleção válida de bioma/estado para Focos
      }
      // Se a busca for necessária para Focos, adicione 'mes' e 'satelite'
      if (isDataFetchNecessary) {
          params.set('mes', mes || ''); // Garante que mes é string
          if (satelite) { params.set('satelite', satelite); }
      }
    } else if (tipo === 'Risco') {
      // 'Risco' não depende de 'mes' nem 'satelite'
      if (bioma && !isNaN(Number(bioma))) {
        rota = 'risco-mapa-bioma'; // Rota para o mapa de risco por bioma
        params.set('bioma', bioma);
      } else if (estado && !isNaN(Number(estado))) {
        rota = 'risco-mapa-estado'; // Rota para o mapa de risco por estado
        params.set('estado', estado);
      } else {
        isDataFetchNecessary = false; // Nenhuma seleção válida de bioma/estado para Risco
      }
      // Não adiciona 'mes' ou 'satelite' aos params para 'Risco'
    } else if (tipo === 'Queimadas') {
      // 'mes' é obrigatório para Queimadas
      if (!mes) { isDataFetchNecessary = false; }
      else if (bioma && !isNaN(Number(bioma))) {
        rota = 'area-bioma';
        params.set('bioma', bioma);
      } else if (estado && !isNaN(Number(estado))) {
        rota = 'area-estado';
        params.set('estado', estado);
      } else {
        isDataFetchNecessary = false; // Nenhuma seleção válida de bioma/estado para Queimadas
      }
      // Se a busca for necessária para Queimadas, adicione 'mes'
      if (isDataFetchNecessary) {
          params.set('mes', mes || ''); // Garante que mes é string
      }
    } else {
      // Tipo desconhecido ou não configurado para busca de GeoJSON
      isDataFetchNecessary = false;
    }

    // Só faz a requisição se for realmente necessário e uma rota válida foi definida
    if (!isDataFetchNecessary || rota === null) {
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
        // Filtra features por tipo de geometria (segurança extra)
        data.features = data.features.filter(f => {
            if (tipo === 'Focos' || tipo === 'Risco') return f.geometry.type === 'Point';
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

  // Efeito para buscar polígono do estado (mantido como está)
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

  // Efeito para buscar polígono do bioma (mantido como está)
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
            <MarkerClusterGroup key="focos-cluster" chunkedLoading>
              <GeoJSON
                key={`focos-geojson-clustered`} // Chave dinâmica para forçar remontagem
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
              key={`focos-geojson-non-clustered`} // Chave dinâmica para forçar remontagem
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
            <MarkerClusterGroup key="risco-cluster" chunkedLoading>
              <GeoJSON
                key={`risco-geojson-clustered`} // Chave dinâmica para forçar remontagem
                data={geojson}
                pointToLayer={(feature, latlng) => {
                  const rawRisco = feature.properties?.valor_risco_fogo;
                  const risco = typeof rawRisco === 'number' ? rawRisco : parseFloat(String(rawRisco));
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
                  const { valor_risco_fogo, longitude, latitude, data } = feature.properties || {};
                  const popup = `
                    <strong>Risco de Fogo:</strong> ${valor_risco_fogo ?? 'N/A'}<br/>
                    <strong>Longitude:</strong> ${longitude ?? 'N/A'}<br/>
                    <strong>Latitude:</strong> ${latitude ?? 'N/A'}<br/>
                    <strong>Data:</strong> ${data ? new Date(data).toLocaleString() : 'N/A'}
                  `;
                  layer.bindPopup(popup);
                }}
              />
            </MarkerClusterGroup>
          ) : ( // Se clustering desativado para Risco
            <GeoJSON
              key={`risco-geojson-non-clustered`} // Chave dinâmica para forçar remontagem
              data={geojson}
              pointToLayer={(feature, latlng) => {
                const rawRisco = feature.properties?.valor_risco_fogo;
                const risco = typeof rawRisco === 'number' ? rawRisco : parseFloat(String(rawRisco));
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
                const { valor_risco_fogo, longitude, latitude, data } = feature.properties || {};
                const popup = `
                  <strong>Risco de Fogo:</strong> ${valor_risco_fogo ?? 'N/A'}<br/>
                  <strong>Longitude:</strong> ${longitude ?? 'N/A'}<br/>
                  <strong>Latitude:</strong> ${latitude ?? 'N/A'}<br/>
                  <strong>Data:</strong> ${data ? new Date(data).toLocaleString() : 'N/A'}
                `;
                layer.bindPopup(popup);
              }}
            />
          )
        )}

        {/* --- Renderização para Queimadas --- */}
        {filters.tipo === 'Queimadas' && geojson && geojson.features.length > 0 && (
          <LayerControl key={`queimadas-layer`} geojson={geojson} tipo={filters.tipo} /> 
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