import { useContext } from "react";
import styled from "styled-components";
import { FilterContext, type Filter } from "../contexts/FilterContext";

const Label = styled.label`
  display: flex;
  flex-direction: column;
  font-weight: bold;
  gap: 0.25rem;
`;

const Select = styled.select`
  padding: 0.5rem;
  border-radius: 6px;
  border: 1px solid #ccc;
`;

const InputMonth = styled.input`
  padding: 0.5rem;
  border-radius: 6px;
  border: 1px solid #ccc;
  background-color: rgb(255, 255, 255);
  color: black;
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
  { value: "2", label: "Cerrado" },
  { value: "3", label: "Mata Atlântica" },
  { value: "4", label: "Caatinga" },
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

  const onChange = (k: keyof Filter) => (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    setFilters({ ...filters, [k]: e.target.value });
  };

  return (
    <>
      <h3
        style={{
          color: "#209869",
          marginBottom: "0.5rem",
          textAlign: "center",
          fontSize: "1.5rem",
        }}
      >
        Filtros
      </h3>

      <Label>
        Tipo:
        <Select value={filters.tipo} onChange={onChange("tipo")}>
          <option value="Focos">Focos de Calor</option>
          <option value="Queimadas">Áreas Queimadas</option>
          <option value="Risco">Risco de Fogo</option>
        </Select>
      </Label>

      <Label>
        Estado:
        <Select
          value={filters.estado}
          onChange={onChange("estado")}
          disabled={!!filters.bioma}
        >
          {estados.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </Select>
      </Label>

      <Label>
        <input
          type="checkbox"
          checked={filters.estadoPoligono}
          onChange={(e) =>
            setFilters({ ...filters, estadoPoligono: e.target.checked })
          }
        />
        Mostrar polígono do estado
      </Label>

      <Label>
        Bioma:
        <Select
          value={filters.bioma}
          onChange={onChange("bioma")}
          disabled={!!filters.estado}
        >
          {biomas.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </Select>
      </Label>

      <Label>
        Mês:
        <InputMonth type="month" value={filters.mes} onChange={onChange("mes")} />
      </Label>

      {filters.tipo === "Focos" && (
        <Label>
          Satélite:
          <Select value={filters.satelite} onChange={onChange("satelite")}>
            {satelites.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </Select>
        </Label>
      )}
    </>
  );
}
