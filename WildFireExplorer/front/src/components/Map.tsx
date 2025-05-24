// src/components/Map.tsx
import { useContext, useEffect, useState } from 'react';
import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import styled from 'styled-components';
import { FilterContext } from '../contexts/FilterContext';

// Importar os componentes de clustering
import MarkerClusterGroup from 'react-leaflet-markercluster';
// Lembre-se de importar os estilos CSS para o MarkerClusterGroup no seu App.css ou index.css!
// Ex:
// @import 'leaflet.markercluster/dist/MarkerCluster.css';
// @import 'leaflet.markercluster/dist/MarkerCluster.Default.css';

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

// Componente para controlar a camada GeoJSON de tipos que NÃO USAM CLUSTERING (ex: Queimadas)
function LayerControl({ geojson, tipo }: { geojson: GeoJson; tipo: 'Focos' | 'Queimadas' | 'Risco' | 'Áreas' }) {
  const map = useMap(); // Obtém a instância do mapa Leaflet

  useEffect(() => {
    let geoJsonLayer: L.GeoJSON; // Declara a variável para a camada GeoJSON

    if (!geojson || !geojson.features || geojson.features.length === 0) {
      // Se não há dados ou a coleção está vazia, não adiciona camada
      return;
    }

    // Este LayerControl é específico para 'Queimadas' (Polígonos)
    if (tipo === 'Queimadas') {
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
    // ou quando as dependências do useEffect mudam
    return () => {
      // Garante que a camada seja removida apenas se ela foi adicionada por este effect
      if (tipo === 'Queimadas' && geoJsonLayer) {
         map.removeLayer(geoJsonLayer);
      }
      // Os marcadores de foco são gerenciados pelo MarkerClusterGroup/GeoJSON diretamente no Map.
    };
  }, [geojson, tipo, map]);

  return null; // LayerControl não renderiza nada diretamente, só manipula o mapa via effect.
}

export default function Map() {
  const { filters } = useContext(FilterContext)!;
  const [geojson, setGeojson] = useState<GeoJson | null>(null);
  const [estadoPoligono, setEstadoPoligono] = useState<GeoJson | null>(null);
  const [biomaPoligonoGeo, setBiomaPoligonoGeo] = useState<GeoJson | null>(null);

  // Efeito principal para buscar Focos de Calor ou Áreas Queimadas
  useEffect(() => {
    // SEMPRE LIMPA OS DADOS NO INÍCIO DA EXECUÇÃO DO EFFECT, ANTES DE QUALQUER BUSCA.
    setGeojson(null);

    // Validação básica: 'mes' é sempre obrigatório para qualquer busca
    if (!filters?.mes) {
      return; // Sai se não tem mês, o geojson já foi limpo.
    }

    const { tipo, estado, bioma, mes, satelite } = filters;

    let rota: string = ''; // Inicialize para satisfazer o TypeScript
    const params = new URLSearchParams();
    let shouldFetch = true; // Flag para controlar se a requisição deve ser feita

    if (tipo === 'Focos') {
      if (bioma && !isNaN(Number(bioma))) { // Garante que bioma é um ID numérico válido
        rota = 'focos-bioma';
        params.set('bioma', bioma);
      } else if (estado && !isNaN(Number(estado))) { // Garante que estado é um ID numérico válido
        rota = 'focos-estado';
        params.set('estado', estado);
      } else {
        // Se tipo é 'Focos' e nem bioma nem estado (válido) estão selecionados, não faz requisição.
        shouldFetch = false;
      }
      params.set('mes', mes);
      if (satelite) params.set('satelite', satelite);
    } else if (tipo === 'Queimadas') {
      if (bioma && !isNaN(Number(bioma))) {
        rota = 'area-bioma';
        params.set('bioma', bioma);
      } else if (estado && !isNaN(Number(estado))) {
        rota = 'area-estado';
        params.set('estado', estado);
      } else {
        // Se tipo é 'Queimadas' e nem bioma nem estado (válido) estão selecionados, não faz requisição.
        shouldFetch = false;
      }
      params.set('mes', mes);
    } else {
      // Se tipo é 'Risco' ou outro tipo não tratado, não faz requisição para focos/áreas.
      shouldFetch = false;
    }

    if (!shouldFetch) {
      // Se não deve fazer requisição, o geojson já foi limpo no início do effect.
      return;
    }

    fetch(`http://localhost:4000/api/${rota}?${params}`)
      .then((r) => {
        if (!r.ok) { // Verifica se a resposta foi bem-sucedida (status 2xx)
          throw new Error(`HTTP error! status: ${r.status}`);
        }
        return r.json();
      })
      .then((data: GeoJson) => {
        // Garante que features é um array mesmo que venha como null/undefined
        data.features = data.features ?? [];
        // Filtra features por tipo de geometria (segurança extra, backend já deve fazer)
        data.features = data.features.filter(f => {
            if (tipo === 'Focos') return f.geometry.type === 'Point';
            if (tipo === 'Queimadas') return f.geometry.type === 'Polygon' || f.geometry.type === 'MultiPolygon';
            return true;
        });
        setGeojson(data);
      })
      .catch((err) => {
        console.error(`Erro ao carregar GeoJSON para ${rota}:`, err);
        setGeojson(null); // Garante a limpeza em caso de falha na requisição/resposta
      });
  }, [filters]); // Dependência do useEffect

  // Efeito para buscar polígono do estado
  useEffect(() => {
    setEstadoPoligono(null); // Limpa o polígono antigo imediatamente
    if (!filters.estado || !filters.estadoPoligono || isNaN(Number(filters.estado))) { // Validação para ID numérico
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
    setBiomaPoligonoGeo(null); // limpa imediatamente o polígono anterior
    if (!filters.bioma || !filters.biomaPoligono || isNaN(Number(filters.bioma))) { // Validação para ID numérico
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

        {/* Condicional para Focos: se enableClustering for TRUE, usa MarkerClusterGroup */}
        {filters.tipo === 'Focos' && filters.enableClustering && geojson && geojson.features.length > 0 && (
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
        )}
        
        {/* Renderiza focos SEM clustering se tipo=Focos e enableClustering=FALSE */}
        {filters.tipo === 'Focos' && !filters.enableClustering && geojson && geojson.features.length > 0 && (
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
        )}

        {/* Renderiza LayerControl APENAS para Queimadas, pois Focos usa MarkerClusterGroup ou GeoJSON direto */}
        {filters.tipo === 'Queimadas' && geojson && geojson.features.length > 0 && (
          <LayerControl geojson={geojson} tipo={filters.tipo} />
        )}

        {/* Renderiza polígono do estado apenas se houver dados e features */}
        {estadoPoligono?.type === 'FeatureCollection' &&
         Array.isArray(estadoPoligono.features) &&
         estadoPoligono.features.length > 0 && (
          <GeoJSON
            key={`pol-est-${filters.estado}`} // Chave dinâmica para forçar re-renderização se o estado mudar
            data={estadoPoligono}
            style={{ color: 'blue', weight: 2 }}
          />
        )}

        {/* Renderiza polígono do bioma apenas se houver dados e features */}
        {biomaPoligonoGeo?.type === 'FeatureCollection' &&
         Array.isArray(biomaPoligonoGeo.features) &&
         biomaPoligonoGeo.features.length > 0 && (
          <GeoJSON
            key={`pol-bio-${filters.bioma}`} // Chave dinâmica para forçar re-renderização se o bioma mudar
            data={biomaPoligonoGeo}
            style={{ color: 'green', weight: 2, fillOpacity: 0.1 }}
          />
        )}
      </MapContainer>
    </Wrapper>
  );
}