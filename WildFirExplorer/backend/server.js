// backend/server.js
const express = require('express');
const cors = require('cors');
const dadosRoutes = require('./routes/dados');

const app = express();

app.use(cors());
app.use('/api', dadosRoutes);

app.listen(4000, () => console.log('Servidor rodando na porta 4000'));

