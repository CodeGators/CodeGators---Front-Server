// src/routes/riscoMapRoutes.ts
import { Router } from 'express';
import { getRiscoPontosPorEstado, getRiscoPontosPorBioma } from '../controllers/riscoMapController'

const router = Router();

router.get('/risco-mapa-estado', getRiscoPontosPorEstado);
router.get('/risco-mapa-bioma', getRiscoPontosPorBioma);

export default router;