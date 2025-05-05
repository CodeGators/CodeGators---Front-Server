import { useState } from 'react';
import { ThemeProvider } from 'styled-components';
import { lightTheme, darkTheme } from './styles/themes';
import { GlobalStyle } from './styles/global';
import Dashboard from './pages/Dashboard';
import { FilterProvider } from './contexts/FilterContext';

function App() {
  const [theme] = useState<'light' | 'dark'>('light');

  return (
    <ThemeProvider theme={theme === 'light' ? lightTheme : darkTheme}>
      <GlobalStyle />
      <FilterProvider>
        <Dashboard />
      </FilterProvider>
    </ThemeProvider>
  );
}

export default App;