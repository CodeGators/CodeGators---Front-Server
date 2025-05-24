// src/components/SettingsPopup.tsx
import React from 'react';
import ReactDOM from 'react-dom'; // Importa ReactDOM para usar createPortal
import styled from 'styled-components';
import { type Filter } from '../contexts/FilterContext';

// Estilos para o overlay e o conteúdo do popup
const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000; /* Garante que o popup fique acima de tudo */
`;

const PopupContent = styled.div`
  background-color: #ffffff;
  padding: 1.5rem;
  border-radius: 1rem;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
  width: 90%;
  max-width: 300px;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  position: relative; /* Para o botão de fechar */
`;

const PopupTitle = styled.h4`
  color: #209869;
  font-size: 1.4rem;
  text-align: center;
  margin-bottom: 0.5rem;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #666;
  cursor: pointer;
  &:hover {
    color: #333;
  }
`;

const CheckboxContainer = styled.label`
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-weight: 600;
  color: #333;
  cursor: pointer;

  input[type="checkbox"] {
    width: 1.2rem;
    height: 1.2rem;
    accent-color: #209869;
    cursor: pointer;
  }
`;

interface SettingsPopupProps {
  localFilters: Filter;
  setLocalFilters: React.Dispatch<React.SetStateAction<Filter>>;
  onClose: () => void;
}

const SettingsPopup: React.FC<SettingsPopupProps> = ({ localFilters, setLocalFilters, onClose }) => {

  const onCheckboxChange = (k: keyof Filter) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setLocalFilters({ ...localFilters, [k]: e.target.checked });
  };

  // Garanta que o elemento raiz para o portal exista no seu index.html
  // Ex: <div id="portal-root"></div>
  const portalRoot = document.getElementById('portal-root');
  if (!portalRoot) {
    console.error("Elemento 'portal-root' não encontrado no HTML. O popup não será renderizado.");
    return null; // Não renderiza se o root não existe
  }

  return ReactDOM.createPortal(
    <Overlay onClick={onClose}> {/* Fecha o popup ao clicar fora */}
      <PopupContent onClick={(e) => e.stopPropagation()}> {/* Impede que o clique dentro do popup feche */}
        <CloseButton onClick={onClose}>&times;</CloseButton> {/* Botão X para fechar */}
        <PopupTitle>Configurações de Visualização</PopupTitle>

        <CheckboxContainer>
          <input
            type="checkbox"
            checked={localFilters.estadoPoligono}
            onChange={onCheckboxChange("estadoPoligono")}
            // REMOVIDO: disabled={!localFilters.estado || localFilters.estado === ""}
            // Checkbox agora está sempre livre
          />
          Mostrar polígono do estado
        </CheckboxContainer>

        <CheckboxContainer>
          <input
            type="checkbox"
            checked={localFilters.biomaPoligono}
            onChange={onCheckboxChange("biomaPoligono")}
            // REMOVIDO: disabled={!localFilters.bioma || localFilters.bioma === ""}
            // Checkbox agora está sempre livre
          />
          Mostrar polígono do bioma
        </CheckboxContainer>

        <CheckboxContainer>
          <input
            type="checkbox"
            checked={localFilters.enableClustering}
            onChange={onCheckboxChange("enableClustering")}
          />
          Agrupar focos (Clustering)
        </CheckboxContainer>
      </PopupContent>
    </Overlay>,
    portalRoot // Onde o popup será montado na árvore DOM
  );
};

export default SettingsPopup;