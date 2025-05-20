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
import { Sort } from "../services/bubble_sort";

// Tipos de dados
type StateDataType = {
  month: string;
  count: number;
};

type BiomeDataType = {
  bioma: string;
  count: number;
};

// Estilos premium
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

// Componente Tooltip personalizado
const renderCustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <CustomTooltip>
        <div className="label">{label}</div>
        <div className="value">{payload[0].value} focos</div>
      </CustomTooltip>
    );
  }
  return null;
};

export default function ChartPage() {
  const { filters } = useContext(FilterContext);
  const [stateData, setStateData] = useState<StateDataType[]>([]);
  const [biomeData, setBiomeData] = useState<BiomeDataType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!filters.mes) {
      setStateData([]);
      setBiomeData([]);
      return;
    }

    const params = new URLSearchParams({ mes: filters.mes });
    if (filters.satelite) params.set("satelite", filters.satelite);

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const [resEstados, resBiomas] = await Promise.all([
          fetch(`http://localhost:4000/api/dados/focos-por-estado?${params}`),
          fetch(`http://localhost:4000/api/dados/focos-por-bioma?${params}`),
        ]);

        if (!resEstados.ok || !resBiomas.ok) {
          throw new Error("Erro ao buscar dados");
        }

        const dadosEstado = await resEstados.json();
        const dadosBioma = await resBiomas.json();

        const estados = dadosEstado.map((item: any) => ({
          month: item.estado,
          count: parseInt(item.total),
        }));
        
        const biomas = dadosBioma.map((item: any) => ({
          bioma: item.bioma,
          count: parseInt(item.total),
        }));

        const sorterEstados = new Sort<StateDataType>();
        const sorterBiomas = new Sort<BiomeDataType>();

        setStateData(sorterEstados.bubbleSort(estados, "count"));
        setBiomeData(sorterBiomas.bubbleSort(biomas, "count"));
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
        setError("Não foi possível carregar os dados. Tente novamente mais tarde.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [filters]);

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
              Focos por Estado
            </ChartTitle>

            {loading ? (
              <EmptyState>Carregando...</EmptyState>
            ) : error ? (
              <EmptyState>{error}</EmptyState>
            ) : stateData.length === 0 ? (
              <EmptyState>Nenhum dado disponível</EmptyState>
            ) : (
              <ResponsiveContainer width="100%" height={400}>
                <BarChart
                  data={stateData}
                  margin={{ top: 20, right: 30, left: 40, bottom: 60 }}
                >
                  <XAxis 
                    dataKey="month"
                    tick={{ fill: '#64748b' }}
                    axisLine={{ stroke: '#cbd5e1' }}
                    tickLine={{ stroke: '#cbd5e1' }}
                    interval={0}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis 
                    dataKey="count"
                    tick={{ fill: '#64748b' }}
                    axisLine={{ stroke: '#cbd5e1' }}
                    tickLine={{ stroke: '#cbd5e1' }}
                  />
                  <Tooltip 
                    content={renderCustomTooltip}
                    cursor={{ fill: 'rgba(32, 152, 105, 0.1)' }}
                  />
                  <Bar 
                    dataKey="count"
                    name="Focos"
                    fill="#209869"
                    radius={[4, 4, 0, 0]}
                    animationDuration={1500}
                  >
                    <LabelList 
                      dataKey="count" 
                      position="top" 
                      fill="#1e293b"
                      fontSize={12}
                      fontWeight={600}
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
              Focos por Bioma
            </ChartTitle>
            
            {loading ? (
              <EmptyState>Carregando...</EmptyState>
            ) : error ? (
              <EmptyState>{error}</EmptyState>
            ) : biomeData.length === 0 ? (
              <EmptyState>Nenhum dado disponível</EmptyState>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart 
                  data={biomeData} 
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <XAxis 
                    dataKey="bioma"
                    tick={{ fill: '#64748b' }}
                    axisLine={{ stroke: '#cbd5e1' }}
                  />
                  <YAxis 
                    tick={{ fill: '#64748b' }}
                    axisLine={{ stroke: '#cbd5e1' }}
                  />
                  <Tooltip 
                    content={renderCustomTooltip} 
                    cursor={{ fill: 'rgba(136, 132, 216, 0.1)' }}
                  />
                  <Bar 
                    dataKey="count" 
                    fill="#8884d8"
                    radius={[4, 4, 0, 0]}
                    animationDuration={1500}
                  >
                    <LabelList 
                      dataKey="count" 
                      position="top" 
                      fill="#1e293b"
                      fontSize={12}
                      fontWeight={600}
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