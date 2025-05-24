
// src/config/db.ts
import { Pool } from 'pg'; // Usamos import/export pois o tsconfig.json está configurado para esModuleInterop

// Configuração do pool de conexão com o banco de dados
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'abp',
  password: '123',
  port: 5432,
});

export default pool; // Usamos export default para um único ponto de exportação