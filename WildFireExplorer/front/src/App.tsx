import { useState } from 'react';
import { ThemeProvider } from 'styled-components';
import { lightTheme, darkTheme } from './styles/themes';
import { GlobalStyle } from './styles/global';
import { FilterProvider } from './contexts/FilterContext';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import ChartsPage from './pages/Chart';

function App() {
  const [theme] = useState<'light' | 'dark'>('light');

  return (
    <ThemeProvider theme={theme === 'light' ? lightTheme : darkTheme}>
      <GlobalStyle />
      <FilterProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/grafico" element={<ChartsPage />} />
          </Routes>
        </Router>
      </FilterProvider>
    </ThemeProvider>
  );
}

export default App;
