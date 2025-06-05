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
// Tipos de dados (Ajustado para clareza e flexibilidade)
type AggregatedDataType = {
  estado?: string;
  bioma?: string;
  count?: number; // Para contagem de focos
  area_total_km2?: number; // Para área queimada
  total_eventos?: number; // Para contagem de eventos de área
  risco_medio?: number; // NOVO: Para risco de fogo
  [key: string]: any;
};

type StateDataType = AggregatedDataType;
type BiomeDataType = AggregatedDataType;

const renderCustomTooltip = ({ active, payload, label }: any, unit: string) => {
  if (active && payload && payload.length) {
    const value = payload[0].value;
    // Se a unidade for 'risco', formata com 2 casas decimais
    const formattedValue = unit === 'risco' ? value.toFixed(2) : value;
    return (
      <CustomTooltip>
        <div className="label">{label}</div>
        <div className="value">{formattedValue} {unit}</div>
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
    // Para gráficos, se o tipo é Focos/Queimadas/Risco, mas MES é obrigatório para Focos/Queimadas
    // Risco NÃO precisa de MES.
    if ( (filters.tipo === 'Focos' || filters.tipo === 'Queimadas') && !filters.mes ) {
        setStateData([]);
        setBiomeData([]);
        return;
    }

    // Se o tipo não é nenhum dos que têm gráfico, limpa e sai
    if (filters.tipo !== 'Focos' && filters.tipo !== 'Queimadas' && filters.tipo !== 'Risco') {
        setStateData([]);
        setBiomeData([]);
        return;
    }


    const params = new URLSearchParams();
    
    // MES é adicionado aos params APENAS se o tipo for Focos ou Queimadas
    if (filters.tipo === 'Focos' || filters.tipo === 'Queimadas') {
      // Garante que filters.mes é uma string, ou uma string vazia
      params.set("mes", filters.mes || ''); 
    }
    
    // Satélite é adicionado aos params APENAS se o tipo for Focos
    if (filters.tipo === 'Focos' && filters.satelite) {
      params.set("satelite", filters.satelite);
    }

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        let stateApiUrl = '';
        let biomaApiUrl = '';

        if (filters.tipo === 'Focos') {
          stateApiUrl = `http://localhost:4000/api/dados/focos-por-estado?${params}`;
          biomaApiUrl = `http://localhost:4000/api/dados/focos-por-bioma?${params}`;
        } else if (filters.tipo === 'Queimadas') {
          stateApiUrl = `http://localhost:4000/api/dados/area-por-estado?${params}`;
          biomaApiUrl = `http://localhost:4000/api/dados/area-por-bioma?${params}`;
        } else if (filters.tipo === 'Risco') {
          stateApiUrl = `http://localhost:4000/api/dados/risco-por-estado?${params}`; // Sem mes/satelite
          biomaApiUrl = `http://localhost:4000/api/dados/risco-por-bioma?${params}`;   // Sem mes/satelite
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

        let sortKey: keyof AggregatedDataType;
        let mapDataFunction: (item: any) => AggregatedDataType;

        if (filters.tipo === 'Focos') {
            sortKey = "count";
            mapDataFunction = (item: any) => ({
                estado: item.estado,
                bioma: item.bioma,
                count: parseInt(item.total),
            });
        } else if (filters.tipo === 'Queimadas') {
            sortKey = "area_total_km2";
            mapDataFunction = (item: any) => ({
                estado: item.estado,
                bioma: item.bioma,
                area_total_km2: parseFloat(item.area_total_km2),
                total_eventos: parseInt(item.total_eventos),
            });
        } else { // filters.tipo === 'Risco'
            sortKey = "risco_medio";
            mapDataFunction = (item: any) => ({
                estado: item.estado,
                bioma: item.bioma,
                risco_medio: parseFloat(item.risco_medio),
            });
        }

        const sorterEstados = new Sort<StateDataType>();
        const sorterBiomas = new Sort<BiomeDataType>();

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

  // Determinar a unidade para o gráfico (focos, km² ou risco)
  let chartUnit: string;
  let dataKeyForChart: keyof AggregatedDataType;
  let chartTitlePrefix: string;

  if (filters.tipo === 'Focos') {
    chartUnit = 'focos';
    dataKeyForChart = 'count';
    chartTitlePrefix = 'Focos';
  } else if (filters.tipo === 'Queimadas') {
    chartUnit = 'km²';
    dataKeyForChart = 'area_total_km2';
    chartTitlePrefix = 'Área Queimada';
  } else { // filters.tipo === 'Risco'
    chartUnit = 'risco'; // NOVO: Unidade para risco
    dataKeyForChart = 'risco_medio'; // NOVO: DataKey para risco
    chartTitlePrefix = 'Risco de Fogo'; // NOVO: Prefixo do título
  }

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
              {chartTitlePrefix} por Estado
            </ChartTitle>

            {loading ? (
              <EmptyState>Carregando...</EmptyState>
            ) : error ? (
              <EmptyState>{error}</EmptyState>
            ) : stateData.length === 0 ? (
              <EmptyState>Nenhum dado disponível para o mês/filtros selecionados</EmptyState>
            ) : (
              <ResponsiveContainer width="100%" height={450}>
                <BarChart
                  data={stateData}
                  margin={{ top: 20, right: 30, left: 40, bottom: 80 }}
                >
                  <XAxis 
                    dataKey="estado"
                    tick={{ fill: '#64748b' }}
                    axisLine={{ stroke: '#cbd5e1' }}
                    tickLine={{ stroke: '#cbd5e1' }}
                    interval={0}
                    angle={-45}
                    textAnchor="end"
                    height={100}
                  />
                  <YAxis 
                    dataKey={dataKeyForChart}
                    tickFormatter={(value: number) => {
                      if (chartUnit === 'km²') return `${value.toFixed(0)} km²`; // km² sem decimais na escala
                      if (chartUnit === 'risco') return value.toFixed(2); // Risco com 2 decimais
                      return `${value}`; // Focos sem unidade
                    }}
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
                    name={chartTitlePrefix}
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
                      formatter={(value: number) => {
                        if (chartUnit === 'km²') return value.toFixed(0); // Rótulo sem unidade km²
                        if (chartUnit === 'risco') return value.toFixed(2); // Risco com 2 decimais
                        return value; // Focos
                      }}
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
              {chartTitlePrefix} por Bioma
            </ChartTitle>
            
            {loading ? (
              <EmptyState>Carregando...</EmptyState>
            ) : error ? (
              <EmptyState>{error}</EmptyState>
            ) : biomeData.length === 0 ? (
              <EmptyState>Nenhum dado disponível para o mês/filtros selecionados</EmptyState>
            ) : (
              <ResponsiveContainer width="100%" height={350}>
                <BarChart 
                  data={biomeData} 
                  margin={{ top: 5, right: 30, left: 20, bottom: 80 }}
                >
                  <XAxis 
                    dataKey="bioma"
                    tick={{ fill: '#64748b' }}
                    axisLine={{ stroke: '#cbd5e1' }}
                    tickLine={{ stroke: '#cbd5e1' }}
                  />
                  <YAxis 
                    dataKey={dataKeyForChart}
                    tickFormatter={(value: number) => {
                      if (chartUnit === 'km²') return `${value.toFixed(0)} km²`;
                      if (chartUnit === 'risco') return value.toFixed(2);
                      return `${value}`;
                    }}
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
                    name={chartTitlePrefix}
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
                      formatter={(value: number) => {
                        if (chartUnit === 'km²') return value.toFixed(0);
                        if (chartUnit === 'risco') return value.toFixed(2);
                        return value;
                      }}
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