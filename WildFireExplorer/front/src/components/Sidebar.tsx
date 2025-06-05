// src/components/Sidebar.tsx
import { useContext, useState, useEffect } from "react";
import styled from "styled-components";
import { FilterContext, type Filter } from "../contexts/FilterContext";
import fogoBaixo from "./images/fogobaixo.png";
import fogoMedio from "./images/fogomedio.png";
import fogoAlto from "./images/fogoalto.png";
import fogoMuitoAlto from "./images/fogomuitoalto.png";
import SettingsPopup from "./SettingsPopup";
import { FaCogs } from 'react-icons/fa';

const SidebarContainer = styled.div`
  background-color: #ffffff;

  border-radius: 1rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 320px;
  display: flex;
  flex-direction: column;
  height: calc(100vh - 80px);
`;

const ScrollableContent = styled.div`
  flex-grow: 1;
  overflow-y: auto;
  padding-right: 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  &::-webkit-scrollbar {
    width: 8px;
  }
  &::-webkit-scrollbar-thumb {
    background-color: #ccc;
    border-radius: 4px;
  }
  &::-webkit-scrollbar-track {
    background-color: #f1f1f1;
  }
`;

const FilterHeader = styled.div`
  display: flex;
  align-items: center; /* Alinha verticalmente no centro */
  position: relative; /* Permite posicionar o botão de forma absoluta */
  margin-bottom: 0.5rem; /* Espaço abaixo do cabeçalho */
  justify-content: center; /* Centraliza o conteúdo principal (neste caso, o título) */
`;

const Title = styled.h3`
  color: #209869;
  font-size: 1.75rem;
`;

const Label = styled.label`
  display: flex;
  flex-direction: column;
  font-weight: 600;
  gap: 0.4rem;
  font-size: 0.95rem;
  color: #333;
`;

const Select = styled.select`
  padding: 0.6rem;
  border-radius: 0.5rem;
  border: 1px solid #ccc;
  background-color: #f9f9f9;
  font-size: 1rem;
  transition: border-color 0.2s ease;

  &:hover,
  &:focus {
    border-color: #209869;
    outline: none;
  }
  &:disabled {
    background-color: #e0e0e0;
    cursor: not-allowed;
    color: #666;
  }
`;

const InputMonth = styled.input`
  padding: 0.6rem;
  border-radius: 0.5rem;
  border: 1px solid #ccc;
  background-color: #f9f9f9;
  color: #333;
  font-size: 1rem;

  &:hover,
  &:focus {
    border-color: #209869;
    outline: none;
  }
`;


const Button = styled.button`
  background-color: #209869;
  color: white;
  padding: 0.8rem 1.2rem;
  border: none;
  border-radius: 0.5rem;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: background-color 0.2s ease;
  margin-top: 1rem;
  width: 100%;
`;

const SettingsButton = styled.button`
  background: none;
  border: none;
  color: #000000;
  padding: 0.5rem;
  font-size: 3rem;
  cursor: pointer;
  position: absolute; /* POSICIONAMENTO ABSOLUTO PARA O BOTÃO */
  right: 0; /* Alinha à direita do FilterHeader */
  top: 50%; /* Centraliza verticalmente */
  transform: translateY(-40%); /* Ajusta para centralização exata vertical */
  &:hover {
    color: #B22222;
    background: none;
  }
`;

const InfoMessage = styled.p`
  font-size: 0.85rem;
  color: #777;
  margin-top: 0.5rem;
  margin-bottom: 0.5rem;
  padding: 0;
`;

const LegendContainer = styled.div`
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid #ddd;
`;

const LegendTitle = styled.h4`
  font-size: 1.2rem;
  color: #209869;
  margin-bottom: 0.75rem;
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;

  img {
    width: 24px;
    height: 24px;
  }

  span {
    font-size: 0.95rem;
    color: #333;
  }
`;

const GradientBar = styled.div`
  width: 100px; /* Largura da barra de gradiente */
  height: 20px; /* Altura da barra */
  background: linear-gradient(to right, #ffff00, #ff0000); /* Gradiente de amarelo para vermelho */
  border-radius: 4px;
`;

const estados = [
  { value: "", label: "Nenhum Estado" },
  { value: "11", label: "Rondônia (RO)" },
  { value: "12", label: "Acre (AC)" },
  { value: "13", label: "Amazonas (AM)" },
  { value: "14", label: "Roraima (RR)" },
  { value: "15", label: "Pará (PA)" },
  { value: "16", label: "Amapá (AP)" },
  { value: "17", label: "Tocantins (TO)" },
  { value: "21", label: "Maranhão (MA)" },
  { value: "22", label: "Piauí (PI)" },
  { value: "23", label: "Ceará (CE)" },
  { value: "24", label: "Rio Grande do Norte (RN)" },
  { value: "25", label: "Paraíba (PB)" },
  { value: "26", label: "Pernambuco (PE)" },
  { value: "27", label: "Alagoas (AL)" },
  { value: "28", label: "Sergipe (SE)" },
  { value: "29", label: "Bahia (BA)" },
  { value: "31", label: "Minas Gerais (MG)" },
  { value: "32", label: "Espírito Santo (ES)" },
  { value: "33", label: "Rio de Janeiro (RJ)" },
  { value: "35", label: "São Paulo (SP)" },
  { value: "41", label: "Paraná (PR)" },
  { value: "42", label: "Santa Catarina (SC)" },
  { value: "43", label: "Rio Grande do Sul (RS)" },
  { value: "50", label: "Mato Grosso do Sul (MS)" },
  { value: "51", label: "Mato Grosso (MT)" },
  { value: "52", label: "Goiás (GO)" },
  { value: "53", label: "Distrito Federal (DF)" },
];

const biomas = [
  { value: "", label: "Nenhum Bioma" },
  { value: "1", label: "Amazônia" },
  { value: "3", label: "Cerrado" },
  { value: "4", label: "Mata Atlântica" },
  { value: "2", label: "Caatinga" },
  { value: "5", label: "Pampa" },
  { value: "6", label: "Pantanal" },
];

const satelites = [
  { value: "", label: "Todos" },
  { value: "AQUA_M-M", label: "AQUA_M-M" },
  { value: "AQUA_M-T", label: "AQUA_M-T" },
  { value: "GOES-16", label: "GOES-16" },
  { value: "GOES-19", label: "GOES-19" },
  { value: "METOP-B", label: "METOP-B" },
  { value: "METOP-C", label: "METOP-C" },
  { value: "NOAA-20", label: "NOAA-20" },
  { value: "NOAA-21", label: "NOAA-21" },
  { value: "NPP-375", label: "NPP-375" },
  { value: "NPP-375D", label: "NPP-375D" },
  { value: "TERRA_M-M", label: "TERRA_M-M" },
  { value: "TERRA_M-T", label: "TERRA_M-T" },
];

export default function Sidebar() {
  const { filters, setFilters } = useContext(FilterContext)!;
  const [localFilters, setLocalFilters] = useState<Filter>(filters);
  const [showSettingsPopup, setShowSettingsPopup] = useState(false); // Novo estado para o popup

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const onChange = (k: keyof Filter) => (
    e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>
  ) => {
    const newValue = e.target.value;
    setLocalFilters({ ...localFilters, [k]: newValue });
  };


  const handleApplyFilters = () => {
    setFilters(localFilters);
  };

  const isEstadoDisabled = !!localFilters.bioma && localFilters.bioma !== "";
  const isBiomaDisabled = !!localFilters.estado && localFilters.estado !== "";

  return (
    <SidebarContainer>
      <FilterHeader>
        <Title>Filtros</Title>
        <SettingsButton onClick={() => setShowSettingsPopup(true)}>
        <FaCogs />
</SettingsButton>
      </FilterHeader>



      <ScrollableContent>
        <Label>
          Tipo:
          <Select value={localFilters.tipo} onChange={onChange("tipo")}>
            <option value="Focos">Focos de Calor</option>
            <option value="Queimadas">Áreas Queimadas</option>
            <option value="Risco">Risco de Fogo</option>
          </Select>
        </Label>

        <div>
          <Label>
            Estado:
            <Select
              value={localFilters.estado}
              onChange={onChange("estado")}
              disabled={isEstadoDisabled}
            >
              {estados.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </Select>
          </Label>
          {isEstadoDisabled && (
            <InfoMessage>
              Desabilitado: Selecione "Nenhum Bioma" para habilitar.
            </InfoMessage>
          )}
        </div>

        {/* Removidos os Checkboxes de poligono do sidebar */}
        {/* <CheckboxContainer>...</CheckboxContainer> */}

        <div>
          <Label>
            Bioma:
            <Select
              value={localFilters.bioma}
              onChange={onChange("bioma")}
              disabled={isBiomaDisabled}
            >
              {biomas.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </Select>
          </Label>
          {isBiomaDisabled && (
            <InfoMessage>
              Desabilitado: Selecione "Nenhum Estado" para habilitar.
            </InfoMessage>
          )}
        </div>

        <Label>
          Mês:
          <InputMonth
            type="month"
            value={localFilters.mes}
            onChange={onChange("mes")}
          />
        </Label>

        {localFilters.tipo === "Focos" && (
          <>
            <Label>
              Satélite:
              <Select value={localFilters.satelite} onChange={onChange("satelite")}>
                {satelites.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </Select>
            </Label>

            <Button onClick={handleApplyFilters}>Aplicar Filtros</Button>

            <LegendContainer>
              <LegendTitle>Legenda de Potência Radioativa do Fogo</LegendTitle>
              <LegendItem>
                <img src={fogoBaixo} alt="Baixo" width={24} />
                <span>Baixo (FRP &lt; 10)</span>
              </LegendItem>
              <LegendItem>
                <img src={fogoMedio} alt="Médio" width={24} />
                <span>Médio (FRP &lt; 30)</span>
              </LegendItem>
              <LegendItem>
                <img src={fogoAlto} alt="Alto" width={24} />
                <span>Alto (FRP &lt; 100)</span>
              </LegendItem>
              <LegendItem>
                <img src={fogoMuitoAlto} alt="Muito Alto" width={24} />
                <span>Muito Alto (FRP &gt; 100)</span>
              </LegendItem>
            </LegendContainer>
          </>
        )}

        {/* NOVA LEGENDA PARA TIPO === 'Risco' */}
        {localFilters.tipo === "Risco" && (
          <>
            <Button onClick={handleApplyFilters}>Aplicar Filtros</Button> {/* Botão aqui também */}
            <LegendContainer>
              <LegendTitle>Legenda de Risco de Fogo</LegendTitle>
              <LegendItem>
                <GradientBar /> {/* Barra de gradiente */}
                <span>0.01 (Baixo) &mdash; 1.00 (Muito Alto)</span>
              </LegendItem>
              <LegendItem>
                <span>Círculos representam a intensidade do risco.</span>
              </LegendItem>
            </LegendContainer>
          </>
        )}

        {/* Renderiza o botão "Aplicar Filtros" se não estiver dentro de Focos ou Risco (e Queimadas não tem sua própria seção) */}
        {localFilters.tipo !== "Focos" && localFilters.tipo !== "Risco" && (
          <Button onClick={handleApplyFilters}>Aplicar Filtros</Button>
        )}
      </ScrollableContent>

      {showSettingsPopup && (
        <SettingsPopup
          localFilters={localFilters}
          setLocalFilters={setLocalFilters}
          onClose={() => setShowSettingsPopup(false)}
        />
      )}
    </SidebarContainer>
  );
}