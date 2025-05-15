import styled from 'styled-components';
import { FaFire, FaMapMarkedAlt, FaChartBar } from 'react-icons/fa';
import { Link, useLocation } from 'react-router-dom';

const Container = styled.header`
  height: 60px;
  background-color: #209869;
  color: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
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
`;

const NavButton = styled(Link)<{ active?: boolean }>`
  background: ${({ active }) => (active ? 'rgb(18, 99, 32)' : '#209869')};
  color: white;
  border: none;
  padding: 0.5rem 0.5rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
  display: flex;
  align-items: center;
  gap: 0.3rem;
  height: 35px;
  width: 100px;
  font-size: 1rem;
  text-decoration: none;

  &:hover {
    background: rgb(18, 99, 32);
  }
`;

export default function Header() {
  const location = useLocation();

  return (
    <Container>
      <Left>
        <FaFire color="orange" /> WildFirExplorer
      </Left>
      <Right>
        <NavButton to="/" active={location.pathname === '/'}>
          <FaMapMarkedAlt style={{ fontSize: '150%' }} /> Mapa
        </NavButton>
        <NavButton to="/grafico" active={location.pathname === '/grafico'}>
          <FaChartBar style={{ fontSize: '150%' }} /> Gráfico
        </NavButton>
      </Right>
    </Container>
  );
}
