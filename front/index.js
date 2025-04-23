require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');

const app = express();
app.use(cors());
app.use(express.static('public'));

// Configuração do banco de dados (use variáveis de ambiente)
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'focos_calor'
};

// Rota para obter focos de calor
app.get('/api/focos', async (req, res) => {
  try {
    const { estado } = req.query;
    const connection = await mysql.createConnection(dbConfig);
    
    let query = 'SELECT id, latitude, longitude, estado FROM focos';
    const params = [];
    
    if (estado) {
      query += ' WHERE estado = ?';
      params.push(estado);
    }

    const [rows] = await connection.execute(query, params);
    connection.end();

    // Converter para GeoJSON
    const geojson = {
      type: 'FeatureCollection',
      features: rows.map(item => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [parseFloat(item.longitude), parseFloat(item.latitude)]
        },
        properties: {
          id: item.id,
          estado: item.estado
        }
      }))
    };

    res.json(geojson);
  } catch (error) {
    console.error('Erro ao buscar dados:', error);
    res.status(500).json({ error: 'Erro ao buscar dados' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});