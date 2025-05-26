// src/pages/Chart.tsx
import { useContext, useEffect, useState } from "react";
import styled from "styled-components";
import { FilterContext } from "../contexts/FilterContext";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LabelList
} from "recharts";
import { Sort } from "../services/quick_sort";

// Tipos de dados (Ajustado para clareza e flexibilidade)
type AggregatedDataType = {
  // A propriedade usada como dataKey no XAxis
  estado?: string;
  bioma?: string;
  // Métricas
  count?: number; // Para contagem de focos
  area_total_km2?: number; // Para área queimada
  total_eventos?: number; // Para contagem de eventos de área
  // Index signature para permitir acesso dinâmico na ordenação
  [key: string]: any;
};

type StateDataType = AggregatedDataType; // Estado usará 'estado' como dataKey
type BiomeDataType = AggregatedDataType; // Bioma usará 'bioma' como dataKey


// Estilos (mantidos iguais)
const Layout = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #f8fafc;
`;

const Content = styled.div`
  display: flex;
  flex: 1;
  overflow: hidden;
  background: linear-gradient(to bottom right, #f8fafc, #e2e8f0);
`;

const SidebarArea = styled.div`
  width: 320px;
  padding: 1.5rem;
  background: white;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  border-right: 1px solid #e2e8f0;
  box-shadow: 4px 0 15px rgba(0, 0, 0, 0.03);
  z-index: 10;
`;

const MainArea = styled.div`
  flex: 1;
  padding: 2rem;
  overflow-y: auto;
  background: transparent;
`;

const ChartContainer = styled.div`
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(0, 0, 0, 0.03);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 15px 30px rgba(0, 0, 0, 0.1);
  }
`;

const ChartTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: linear-gradient(to right, #64748b, transparent);
    margin-left: 1rem;
  }
`;

const CustomTooltip = styled.div`
  background: white;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
  
  .label {
    font-weight: 600;
    color: #64748b;
    margin-bottom: 0.25rem;
    text-transform: capitalize;
  }
  
  .value {
    font-weight: 700;
    color: #1e293b;
    font-size: 1.1rem;
  }
`;

const PageTitle = styled.h1`
  font-size: 1.75rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 2rem;
  position: relative;
  display: inline-block;
  
  &::after {
    content: '';
    position: absolute;
    bottom: -8px;
    left: 0;
    width: 60px;
    height: 4px;
    background: linear-gradient(to right, #f59e0b, #ef4444);
    border-radius: 2px;
  }
`;

const ChartIcon = styled.div<{ color: string }>`
  width: 24px;
  height: 24px;
  border-radius: 6px;
  background: ${props => props.color};
  display: flex;
  align-items: center;
  justify-content: center;
  
  svg {
    width: 16px;
    height: 16px;
    fill: white;
  }
`;

const EmptyState = styled.div`
  height: 300px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  color: #64748b;
  
  svg {
    width: 48px;
    height: 48px;
    opacity: 0.5;
  }
  
  p {
    font-size: 1.1rem;
    text-align: center;
    max-width: 300px;
  }
`;

// Componente Tooltip personalizado - AGORA RECEBE A UNIDADE DINAMICAMENTE
const renderCustomTooltip = ({ active, payload, label }: any, unit: string) => {
  if (active && payload && payload.length) {
    const value = payload[0].value;
    return (
      <CustomTooltip>
        <div className="label">{label}</div>
        <div className="value">{value} {unit}</div>
      </CustomTooltip>
    );
  }
  return null;
};

export default function ChartPage() {
  const { filters } = useContext(FilterContext)!;
  const [stateData, setStateData] = useState<StateDataType[]>([]);
  const [biomeData, setBiomeData] = useState<BiomeDataType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!filters.mes || (filters.tipo !== 'Focos' && filters.tipo !== 'Queimadas' && filters.tipo !== 'Risco')) {
      setStateData([]);
      setBiomeData([]);
      return;
    }

    const params = new URLSearchParams();
    params.set("mes", filters.mes);
    
    if (filters.tipo === 'Focos' && filters.satelite) {
      params.set("satelite", filters.satelite);
    }

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        let stateApiUrl = '';
        let biomaApiUrl = '';

        if (filters.tipo === 'Focos' || filters.tipo === 'Risco') {
          stateApiUrl = `http://localhost:4000/api/dados/focos-por-estado?${params}`;
          biomaApiUrl = `http://localhost:4000/api/dados/focos-por-bioma?${params}`;
        } else if (filters.tipo === 'Queimadas') {
          stateApiUrl = `http://localhost:4000/api/dados/area-por-estado?${params}`;
          biomaApiUrl = `http://localhost:4000/api/dados/area-por-bioma?${params}`;
        }

        const [resEstados, resBiomas] = await Promise.all([
          fetch(stateApiUrl),
          fetch(biomaApiUrl),
        ]);

        if (!resEstados.ok || !resBiomas.ok) {
          throw new Error("Erro ao buscar dados agregados");
        }

        const dadosEstado = await resEstados.json();
        const dadosBioma = await resBiomas.json();

        // Determinar a chave de ordenação e o mapeamento de dados
        let sortKey: keyof AggregatedDataType;
        let mapDataFunction: (item: any) => AggregatedDataType;

        if (filters.tipo === 'Focos' || filters.tipo === 'Risco') {
            sortKey = "count";
            mapDataFunction = (item: any) => ({
                estado: item.estado,
                bioma: item.bioma, // Incluir bioma para o caso do gráfico de bioma
                count: parseInt(item.total),
            });
        } else { // filters.tipo === 'Queimadas'
            sortKey = "area_total_km2"; // Ou "total_eventos" se preferir contar eventos
            mapDataFunction = (item: any) => ({
                estado: item.estado,
                bioma: item.bioma,
                area_total_km2: parseFloat(item.area_total_km2),
                total_eventos: parseInt(item.total_eventos),
            });
        }

        const sorterEstados = new Sort<StateDataType>();
        const sorterBiomas = new Sort<BiomeDataType>();

        // Mapear e ordenar os dados
        const mappedEstados = dadosEstado.map(mapDataFunction);
        const mappedBiomas = dadosBioma.map(mapDataFunction);

        setStateData(sorterEstados.quickSort(mappedEstados, sortKey));
        setBiomeData(sorterBiomas.quickSort(mappedBiomas, sortKey));

      } catch (error) {
        console.error("Erro ao buscar dados agregados:", error);
        setError("Não foi possível carregar os dados. Tente novamente mais tarde.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [filters]);

  // Determinar a unidade para o gráfico (focos ou km²)
  const chartUnit = filters.tipo === 'Focos' || filters.tipo === 'Risco' ? 'focos' : 'km²';
  const dataKeyForChart = filters.tipo === 'Focos' || filters.tipo === 'Risco' ? 'count' : 'area_total_km2';

  return (
    <Layout>
      <Header />
      <Content>
        <SidebarArea>
          <Sidebar />
        </SidebarArea>
        <MainArea>
          <PageTitle>Análise de Dados</PageTitle>

          {/* Gráfico por Estado */}
          <ChartContainer>
            <ChartTitle>
              <ChartIcon color="#209869">
                <svg viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM16 15H8V13H16V15ZM16 11H8V9H16V11Z" />
                </svg>
              </ChartIcon>
              {filters.tipo === 'Focos' || filters.tipo === 'Risco' ? 'Focos por Estado' : 'Área Queimada por Estado'}
            </ChartTitle>

            {loading ? (
              <EmptyState>Carregando...</EmptyState>
            ) : error ? (
              <EmptyState>{error}</EmptyState>
            ) : stateData.length === 0 ? (
              <EmptyState>Nenhum dado disponível para o mês/filtros selecionados</EmptyState>
            ) : (
              <ResponsiveContainer width="100%" height={400}>
                <BarChart
                  data={stateData}
                  margin={{ top: 20, right: 30, left: 40, bottom: 60 }}
                >
                  <XAxis 
                    dataKey="estado"
                    tick={{ fill: '#64748b' }}
                    axisLine={{ stroke: '#cbd5e1' }}
                    tickLine={{ stroke: '#cbd5e1' }}
                    interval={0}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis 
                    dataKey={dataKeyForChart}
                    tickFormatter={(value) => `${value} ${chartUnit === 'km²' ? 'km²' : ''}`}
                    tick={{ fill: '#64748b' }}
                    axisLine={{ stroke: '#cbd5e1' }}
                    tickLine={{ stroke: '#cbd5e1' }}
                  />
                  <Tooltip 
                    content={(props) => renderCustomTooltip(props, chartUnit)}
                    cursor={{ fill: 'rgba(32, 152, 105, 0.1)' }}
                  />
                  <Bar 
                    dataKey={dataKeyForChart}
                    name={filters.tipo === 'Focos' || filters.tipo === 'Risco' ? 'Focos' : 'Área Queimada'}
                    fill="#209869"
                    radius={[4, 4, 0, 0]}
                    animationDuration={1500}
                  >
                    <LabelList 
                      dataKey={dataKeyForChart}
                      position="top" 
                      fill="#1e293b"
                      fontSize={12}
                      fontWeight={600}
                      formatter={(value: number) => chartUnit === 'km²' ? value.toFixed(2) : value}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </ChartContainer>

          {/* Gráfico por Bioma */}
          <ChartContainer>
            <ChartTitle>
              <ChartIcon color="#8884d8">
                <svg viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM16 15H8V13H16V15ZM16 11H8V9H16V11Z" />
                </svg>
              </ChartIcon>
              {filters.tipo === 'Focos' || filters.tipo === 'Risco' ? 'Focos por Bioma' : 'Área Queimada por Bioma'}
            </ChartTitle>
            
            {loading ? (
              <EmptyState>Carregando...</EmptyState>
            ) : error ? (
              <EmptyState>{error}</EmptyState>
            ) : biomeData.length === 0 ? (
              <EmptyState>Nenhum dado disponível para o mês/filtros selecionados</EmptyState>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart 
                  data={biomeData} 
                  margin={{ top: 50, right: 30, left: 20, bottom: 5 }}
                >
                  <XAxis 
                    dataKey="bioma"
                    tick={{ fill: '#64748b' }}
                    axisLine={{ stroke: '#cbd5e1' }}
                    tickLine={{ stroke: '#cbd5e1' }}
                  />
                  <YAxis 
                    dataKey={dataKeyForChart}
                    tickFormatter={(value) => `${value} ${chartUnit === 'km²' ? 'km²' : ''}`}
                    tick={{ fill: '#64748b' }}
                    axisLine={{ stroke: '#cbd5e1' }}
                    tickLine={{ stroke: '#cbd5e1' }}
                  />
                  <Tooltip 
                    content={(props) => renderCustomTooltip(props, chartUnit)}
                    cursor={{ fill: 'rgba(136, 132, 216, 0.1)' }}
                  />
                  <Bar 
                    dataKey={dataKeyForChart} 
                    name={filters.tipo === 'Focos' || filters.tipo === 'Risco' ? 'Focos' : 'Área Queimada'}
                    fill="#8884d8"
                    radius={[4, 4, 0, 0]}
                    animationDuration={1500}
                  >
                    <LabelList 
                      dataKey={dataKeyForChart}
                      position="top" 
                      fill="#1e293b"
                      fontSize={12}
                      fontWeight={600}
                      formatter={(value: number) => chartUnit === 'km²' ? value.toFixed(2) : value}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </ChartContainer>
        </MainArea>
      </Content>
    </Layout>
  );
}