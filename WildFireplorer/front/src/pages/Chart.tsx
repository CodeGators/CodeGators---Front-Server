import { useContext } from "react";
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

// Tipagem para os dados de estado e bioma
type StateDataType = {
  month: string; // estado
  count: number;
};

type BiomeDataType = {
  bioma: string;
  count: number;
};

// Estilos reutilizados da página Dashboard
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

export default function ChartPage() {
  // Use o contexto inteiro ou remova se não estiver usando nada agora
  const filterContext = useContext(FilterContext);

  // Dados mockados com bioma para agregação depois
  const data = [
    { month: "AC", count: 30, bioma: "Amazônia" },
    { month: "AL", count: 45, bioma: "Caatinga" },
    { month: "AM", count: 50, bioma: "Amazônia" },
    { month: "BA", count: 40, bioma: "Caatinga" },
    { month: "DF", count: 80, bioma: "Cerrado" },
    { month: "GO", count: 65, bioma: "Cerrado" },
    { month: "MG", count: 30, bioma: "Mata Atlântica" },
    { month: "PA", count: 45, bioma: "Amazônia" },
    { month: "RJ", count: 80, bioma: "Mata Atlântica" },
    { month: "RS", count: 65, bioma: "Pampa" },
    { month: "RO", count: 75, bioma: "Amazônia" },
    { month: "SC", count: 60, bioma: "Mata Atlântica" },
    { month: "SP", count: 30, bioma: "Mata Atlântica" },
    { month: "TO", count: 60, bioma: "Cerrado" },
  ];

  const sorter = new Sort<StateDataType | BiomeDataType>();

  // Prepara dados para gráfico por estado (somente month e count)
  const stateDataUnsorted: StateDataType[] = data.map(({ month, count }) => ({
    month,
    count,
  }));

  // Prepara dados para gráfico por bioma, somando counts por bioma
  const biomeDataUnsorted: BiomeDataType[] = data.reduce(
    (acc: BiomeDataType[], curr) => {
      const found = acc.find((item) => item.bioma === curr.bioma);
      if (found) {
        found.count += curr.count;
      } else {
        acc.push({ bioma: curr.bioma, count: curr.count });
      }
      return acc;
    },
    []
  );

  // Ordena os dados por count crescente
  const stateData = sorter.bubbleSort(stateDataUnsorted, "count");
  const biomeData = sorter.bubbleSort(biomeDataUnsorted, "count");

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
            <h2 className="text-lg font-semibold mb-2">Gráfico por Estado</h2>
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
            <h2 className="text-lg font-semibold mb-2">Gráfico por Bioma</h2>
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
