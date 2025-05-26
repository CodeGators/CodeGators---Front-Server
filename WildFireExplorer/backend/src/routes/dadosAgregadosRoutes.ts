// src/routes/dadosAgregados/dadosAgregadosRoutes.ts

import { Router } from 'express';
import {
  getFocosAgregadosPorEstado,
  getFocosAgregadosPorBioma,
  getAreasAgregadasPorEstado, // NOVO
  getAreasAgregadasPorBioma   // NOVO
} from '../controllers/dadosAgregadosController';

const router = Router();

router.get('/focos-por-estado', getFocosAgregadosPorEstado);
router.get('/focos-por-bioma', getFocosAgregadosPorBioma);
router.get('/area-por-estado', getAreasAgregadasPorEstado); 
router.get('/area-por-bioma', getAreasAgregadasPorBioma);  

export default router;