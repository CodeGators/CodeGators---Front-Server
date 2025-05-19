import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import Map from '../components/Map';
import styled from 'styled-components';

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
  position: relative;
`;

export default function Dashboard() {
  return (
    <Layout>
      <Header />
      <Content>
        <SidebarArea>
          <Sidebar />
        </SidebarArea>
        <MainArea>
          <Map />
        </MainArea>
      </Content>
    </Layout>
  );
}
