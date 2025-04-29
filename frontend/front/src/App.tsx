import { useEffect, useRef, useState } from 'react';
import './App.css';
import L, { GeoJSON } from 'leaflet';
import 'leaflet/dist/leaflet.css'; // <-- Adicionado aqui
import { fetchGeoJson } from './services/fetchGeoJson';


// Tipagem para o mapa com suporte a geoJsonLayer
type MapWithGeoJson = L.Map & {
  geoJsonLayer?: GeoJSON;
};


const estados = [
  { sigla: '12', nome: 'Acre' },
  { sigla: '27', nome: 'Alagoas' },
  { sigla: '16', nome: 'Amapá' },
  { sigla: '13', nome: 'Amazonas' },
  { sigla: '29', nome: 'Bahia' },
  { sigla: '23', nome: 'Ceará' },
  { sigla: '53', nome: 'Distrito Federal' },
  { sigla: '32', nome: 'Espírito Santo' },
  { sigla: '52', nome: 'Goiás' },
  { sigla: '21', nome: 'Maranhão' },
  { sigla: '51', nome: 'Mato Grosso' },
  { sigla: '50', nome: 'Mato Grosso do Sul' },
  { sigla: '31', nome: 'Minas Gerais' },
  { sigla: '15', nome: 'Pará' },
  { sigla: '25', nome: 'Paraíba' },
  { sigla: '41', nome: 'Paraná' },
  { sigla: '26', nome: 'Pernambuco' },
  { sigla: '22', nome: 'Piauí' },
  { sigla: '33', nome: 'Rio de Janeiro' },
  { sigla: '24', nome: 'Rio Grande do Norte' },
  { sigla: '43', nome: 'Rio Grande do Sul' },
  { sigla: '11', nome: 'Rondônia' },
  { sigla: '14', nome: 'Roraima' },
  { sigla: '42', nome: 'Santa Catarina' },
  { sigla: '35', nome: 'São Paulo' },
  { sigla: '28', nome: 'Sergipe' },
  { sigla: '17', nome: 'Tocantins' },
];

const biomas = [
  { id: '1', nome: 'Amazônia' },
  { id: '2', nome: 'Caatinga' },
  { id: '3', nome: 'Cerrado' },
  { id: '4', nome: 'Mata Atlântica' },
  { id: '5', nome: 'Pantanal' },
  { id: '6', nome: 'Pampa' },
];

function App() {
  const [filtro, setFiltro] = useState<string>('focos-estado');
  const [valor, setValor] = useState<string>('');
  const [bioma, setBioma] = useState<string>('');

  const mapRef = useRef<MapWithGeoJson | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!mapRef.current && mapContainerRef.current) {
      mapRef.current = L.map(mapContainerRef.current).setView([-15, -55], 4);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(mapRef.current);
    }
  }, []);

  const fetchData = async () => {
    if (!valor && !bioma) {
      alert('Selecione um valor válido para estado ou bioma');
      return;
    }
  
    try {
      const data = await fetchGeoJson({ filtro, valor, bioma });
  
      if (mapRef.current?.geoJsonLayer) {
        mapRef.current.removeLayer(mapRef.current.geoJsonLayer);
      }
  
      const geoJsonLayer = L.geoJSON(data);
      geoJsonLayer.addTo(mapRef.current!);
      mapRef.current!.geoJsonLayer = geoJsonLayer;
    } catch (error) {
      console.error('Erro ao buscar dados', error);
    }
  };
  

  return (
    <div className="App">
      <h1>Mapa de Focos e Áreas Queimadas</h1>
      <div className="filtros">
        <select value={filtro} onChange={(e) => setFiltro(e.target.value)}>
          <option value="focos-estado">Foco por Estado</option>
          <option value="focos-bioma">Foco por Bioma</option>
          <option value="area-estado">Área Queimada por Estado</option>
          <option value="area-bioma">Área Queimada por Bioma</option>
        </select>

        {(filtro === 'focos-estado' || filtro === 'area-estado') && (
          <select value={valor} onChange={(e) => setValor(e.target.value)}>
            <option value="">Selecione um Estado</option>
            {estados.map((e) => (
              <option key={e.sigla} value={e.sigla}>
                {e.nome}
              </option>
            ))}
          </select>
        )}

        {(filtro === 'focos-bioma' || filtro === 'area-bioma') && (
          <select value={bioma} onChange={(e) => setBioma(e.target.value)}>
            <option value="">Selecione um Bioma</option>
            {biomas.map((b) => (
              <option key={b.id} value={b.id}>
                {b.nome}
              </option>
            ))}
          </select>
        )}

        <button onClick={fetchData}>Filtrar</button>
      </div>

      <div ref={mapContainerRef} id="map" style={{ height: '600px', width: '100%' }}></div>
    </div>
  );
}

export default App;