// src/routes/dadosAgregados/dadosAgregadosRoutes.ts

import { Router } from 'express';
import {
  getFocosAgregadosPorEstado,
  getFocosAgregadosPorBioma,
  getAreasAgregadasPorEstado, // NOVO
  getAreasAgregadasPorBioma,  // NOVO
  getRiscoAgregadoPorEstado,
  getRiscoAgregadoPorBioma 
} from '../controllers/dadosAgregadosController';

const router = Router();

router.get('/focos-por-estado', getFocosAgregadosPorEstado);
router.get('/focos-por-bioma', getFocosAgregadosPorBioma);
router.get('/area-por-estado', getAreasAgregadasPorEstado); 
router.get('/area-por-bioma', getAreasAgregadasPorBioma);  
router.get('/risco-por-estado', getRiscoAgregadoPorEstado); // NOVO
router.get('/risco-por-bioma', getRiscoAgregadoPorBioma);   // NOVO

export default router;