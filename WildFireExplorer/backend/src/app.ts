// src/app.ts
import express from 'express';
import cors from 'cors';

// Importa os roteadores modularizados (estes são instâncias de Router, não controladores)
import focosRoutes from './routes/focosRoutes'; // Corrigido para ser focosRoutes
import areasRoutes from './routes/areasRoutes'; // Corrigido para ser areasRoutes
import dadosAgregadosRoutes from './routes/dadosAgregadosRoutes'; // Corrigido para ser dadosAgregadosRoutes
import poligonosRoutes from './routes/poligonosRoutes'; // Corrigido para ser poligonosRoutes
import riscoMapRoutes from './routes/riscoMapRoutes';

const app = express();

app.use(cors());
// app.use(express.json()); // Descomente se for usar req.body em futuras rotas POST/PUT

// Usa os roteadores modularizados
app.use('/api', focosRoutes);
app.use('/api', areasRoutes);
app.use('/api/dados', dadosAgregadosRoutes);
app.use('/api', poligonosRoutes);
app.use('/api', riscoMapRoutes);

// Middleware para lidar com rotas não encontradas (404)
app.use((req, res, next) => {
  res.status(404).send('Rota não encontrada.');
});

// Middleware para lidar com erros gerais
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).send('Ocorreu um erro no servidor!');
});

export default app;