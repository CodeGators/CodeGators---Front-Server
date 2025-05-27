// src/server.ts
import app from './app';

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  console.log(`Acesse exemplos:`);
  console.log(`- Focos por Estado: http://localhost:${PORT}/api/focos-estado?estado=11`);
  console.log(`- Área por Bioma: http://localhost:${PORT}/api/area-bioma?bioma=1`);
  console.log(`- Dados Agregados: http://localhost:${PORT}/api/dados/focos-por-estado?estado=11`);
  console.log(`- Polígono Estado: http://localhost:${PORT}/api/poligono-estado?estado=11`);
});