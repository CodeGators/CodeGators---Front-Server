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
} from "recharts";
import { Sort } from "../services/bubble_sort";



const Layout = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
`;

const Content = styled.div`
  display: flex;
  flex: 1;
  overflow: hidden;
`;

const SidebarArea = styled.div`
  width: 300px;
  padding: 1rem;
  background-color: #f0f0f0;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  border-right: 1px solid #ccc;
`;

const MainArea = styled.div`
  flex: 1;
  padding: 1.5rem;
  overflow-y: auto;
`;

type StateDataType = {
  month: string; // estado
  count: number;
};

type BiomeDataType = {
  bioma: string;
  count: number;
};
export default function ChartPage() {
  const { filters } = useContext(FilterContext);
  const [stateData, setStateData] = useState<StateDataType[]>([]);
  const [biomeData, setBiomeData] = useState<BiomeDataType[]>([]);

  useEffect(() => {
    if (!filters.mes) return;

    const params = new URLSearchParams({ mes: filters.mes });
    if (filters.satelite) params.set("satelite", filters.satelite);

    const fetchData = async () => {
      try {
        const [resEstados, resBiomas] = await Promise.all([
          fetch(`http://localhost:4000/api/dados/focos-por-estado?${params}`),
          fetch(`http://localhost:4000/api/dados/focos-por-bioma?${params}`),
        ]);
        

        const dadosEstado = await resEstados.json();
        const dadosBioma = await resBiomas.json();

        const estados = dadosEstado.map((item: any) => ({
          month: item.estado,
          count: parseInt(item.total), // ESSENCIAL
        }));
        
        const biomas = dadosBioma.map((item: any) => ({
          bioma: item.bioma,
          count: parseInt(item.total), // ESSENCIAL
        }));
        

        const sorterEstados = new Sort<StateDataType>();
const sorterBiomas = new Sort<BiomeDataType>();

setStateData(sorterEstados.bubbleSort(estados, "count"));
setBiomeData(sorterBiomas.bubbleSort(biomas, "count"));
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
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
          <h1 className="text-2xl font-bold mb-4">Gráficos:</h1>

          {/* Gráfico por Estado */}
          <div className="mb-10">
            <h2 className="text-lg font-semibold mb-2">Gráfico Focos por Estado</h2>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={stateData}>
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Gráfico por Bioma */}
          <div>
            <h2 className="text-lg font-semibold mb-2">Gráfico Focos por Bioma</h2>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={biomeData}>
                <XAxis dataKey="bioma" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </MainArea>
      </Content>
    </Layout>
  );
}
