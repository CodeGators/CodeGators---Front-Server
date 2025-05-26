// src/routes/poligonos/poligonosRoutes.ts
import { Router } from 'express';
// Certifique-se de que a importação está desestruturada e apontando para o controller correto
import { getPoligonoEstado, getPoligonoBioma } from '../controllers/poligonosController'; // <<< Verifique este caminho e a desestruturação

const router = Router();

router.get('/poligono-estado', getPoligonoEstado); // <<< Linha onde o erro pode estar
router.get('/poligono-bioma', getPoligonoBioma);   // <<< Linha onde o erro foi reportado

export default router;