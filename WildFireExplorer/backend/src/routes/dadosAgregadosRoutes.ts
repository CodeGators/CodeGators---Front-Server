// src/routes/dadosAgregados/dadosAgregadosRoutes.ts
import { Router } from 'express';
import { getFocosAgregadosPorEstado, getFocosAgregadosPorBioma } from '../controllers/dadosAgregadosController'; // Caminho ajustado

const router = Router();

router.get('/focos-por-estado', getFocosAgregadosPorEstado);
router.get('/focos-por-bioma', getFocosAgregadosPorBioma);

export default router;