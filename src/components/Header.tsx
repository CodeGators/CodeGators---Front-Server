import styled from 'styled-components';

const Container = styled.header`
  height: 60px;
  background-color: #209869;
  color: white;
  display: flex;
  align-items: center;
  padding: 0 1rem;
`;

export default function Header() {
  return <Container>🔥 WildFirExplorer</Container>;
}
