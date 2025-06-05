import styled from 'styled-components';
import { FaFire, FaMapMarkedAlt, FaChartBar } from 'react-icons/fa';
import { Link, useLocation } from 'react-router-dom';
import codegators from "./images/codegators.png";

const Container = styled.header`
  height: 80px;
  background: linear-gradient(135deg, #0d4a2a, #209869);
  color: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 2rem;
  font-size: 1.8rem;
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.2);
  position: relative;
  z-index: 100;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);

  &::before {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 3px;
    background: linear-gradient(90deg, #ff8a00, #f1c40f, #2ecc71);
  }
`;

const Left = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.75rem;
  font-weight: bold;

  svg {
    font-size: 2rem;
    animation: pulse 2s infinite;
    color: orange;
  }

  @keyframes pulse {
    0%, 100% {
      transform: scale(1);
      opacity: 1;
    }
    50% {
      transform: scale(1.1);
      opacity: 0.8;
    }
  }

  a img {
    transition: transform 0.3s ease;
  }

  a:hover img {
    transform: scale(1.05);
  }
`;

const Right = styled.nav`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const NavButton = styled(Link)<{ active?: boolean }>`
  background: ${({ active }) => (active ? '#146c42' : '#ffffff22')};
  color: white;
  border: 2px solid transparent;
  padding: 0.6rem 1rem;
  border-radius: 12px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1rem;
  text-decoration: none;
  transition: all 0.25s ease;

  svg {
    font-size: 1.25rem;
    transition: transform 0.2s ease;
  }

  &:hover {
    background: #15784b;
    box-shadow: 0 0 8px rgba(255, 255, 255, 0.3);
    svg {
      transform: scale(1.2);
    }
  }

  ${({ active }) =>
    active &&
    `
    border: 2px solid white;
    box-shadow: 0 0 10px rgba(255, 255, 255, 0.4);
  `}
`;

const LogoText = styled.span`
  background: linear-gradient(to right, #f1c40f, #ffffff);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  font-size: 1.8rem;
`;

export default function Header() {
  const location = useLocation();

  return (
    <Container>
      <Left>
        <FaFire />
        <LogoText>WildFireExplorer</LogoText>
        <a href="https://github.com/CodeGators" target="_blank" rel="noopener noreferrer">
          <img src={codegators} alt="gordozilla" width={100} />
        </a>
      </Left>
      <Right>
        <NavButton to="/" active={location.pathname === '/'}>
          <FaMapMarkedAlt /> Mapa
        </NavButton>
        <NavButton to="/grafico" active={location.pathname === '/grafico'}>
          <FaChartBar /> Gráfico
        </NavButton>
      </Right>
    </Container>
  );
}
