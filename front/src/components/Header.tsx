import styled from 'styled-components';
import { FaFire } from 'react-icons/fa';
import { FaMapMarkedAlt, FaChartBar } from 'react-icons/fa'; // Ícones para mapa e gráfico

const Container = styled.header`
  height: 60px;
  background-color: #209869;
  color: white;
  display: flex;
  align-items: center;
  justify-content: space-between; /* Alinha os itens nas extremidades */
  padding: 0 1rem;
  font-size: 1.5rem;
`;

const Left = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const Right = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;

  button {
    background: #209869;
    color: white;
    border: none;
    padding: 0.5rem 0.5rem;
    border-radius: 8px;
    cursor: pointer;
    font-weight: bold;
    display: flex;
    align-items: center;
    gap: 0.3rem;
    transition: background 0.2s ease;
    height: 35px; /* Altura do botão */
    width: 100px; /* Largura do botão */
    font-size: 1rem; /* Tamanho da fonte do botão */
   
    &:hover {
      background:rgb(18, 99, 32);
    }
  }
`;

export default function Header() {
  return (
    <Container>
      <Left>
        <FaFire color="orange" /> WildFirExplorer
      </Left>
      <Right>
        <button><FaMapMarkedAlt style={{ fontSize: '150%'}} /> Mapa</button>
        <button><FaChartBar style={{ fontSize: '150%'}} /> Gráfico</button>
      </Right>
    </Container>
  );
}
