import { useContext, useState } from "react";
import styled from "styled-components";
import { FilterContext } from "../contexts/FilterContext";

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

const Button = styled.button`
  padding: 0.5rem;
  background: #209869;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: bold;
  cursor: pointer;

  &:hover {
    background: #197a52;
  }
`;

export default function Sidebar() {
  const { setFilters } = useContext(FilterContext)!;

  const [estado, setEstado] = useState("");
  const [bioma, setBioma] = useState("");
  const [tipo, setTipo] = useState("Focos");

  const aplicarFiltros = () => {
    setFilters({ estado, bioma, tipo });
  };

  return (
    <>
      <h3>Filtros</h3>
      <Label>
        Estado:
        <Select value={estado} onChange={(e) => setEstado(e.target.value)}>
          <option value="">Todos os Estados</option>
          <option value="AC">Acre (AC)</option>
          <option value="AL">Alagoas (AL)</option>
          <option value="AP">Amapá (AP)</option>
          <option value="AM">Amazonas (AM)</option>
          <option value="BA">Bahia (BA)</option>
          <option value="CE">Ceará (CE)</option>
          <option value="DF">Distrito Federal (DF)</option>
          <option value="ES">Espírito Santo (ES)</option>
          <option value="GO">Goiás (GO)</option>
          <option value="MA">Maranhão (MA)</option>
          <option value="MT">Mato Grosso (MT)</option>
          <option value="MS">Mato Grosso do Sul (MS)</option>
          <option value="MG">Minas Gerais (MG)</option>
          <option value="PA">Pará (PA)</option>
          <option value="PB">Paraíba (PB)</option>
          <option value="PR">Paraná (PR)</option>
          <option value="PE">Pernambuco (PE)</option>
          <option value="PI">Piauí (PI)</option>
          <option value="RJ">Rio de Janeiro (RJ)</option>
          <option value="RN">Rio Grande do Norte (RN)</option>
          <option value="RS">Rio Grande do Sul (RS)</option>
          <option value="RO">Rondônia (RO)</option>
          <option value="RR">Roraima (RR)</option>
          <option value="SC">Santa Catarina (SC)</option>
          <option value="SP">São Paulo (SP)</option>
          <option value="SE">Sergipe (SE)</option>
          <option value="TO">Tocantins (TO)</option>
        </Select>
      </Label>
      <Label>
        Bioma:
        <Select value={bioma} onChange={(e) => setBioma(e.target.value)}>
          <option value="">Todos os Biomas</option>
          <option value="Amazônia">Amazônia</option>
          <option value="Cerrado">Cerrado</option>
          <option value="Mata Atlântica">Mata Atlântica</option>
          <option value="Caatinga">Caatinga</option>
          <option value="Pampa">Pampa</option>
          <option value="Pantanal">Pantanal</option>
        </Select>
      </Label>
      <Label>
        Tipo:
        <Select value={tipo} onChange={(e) => setTipo(e.target.value)}>
          <option value="Focos">Focos de Calor</option>
          <option value="Queimadas">Áreas Queimadas</option>
          <option value="Queimadas">Risco de Fogo</option>
        </Select>
      </Label>

      <Button onClick={aplicarFiltros}>Aplicar Filtros</Button>
    </>
  );
}
