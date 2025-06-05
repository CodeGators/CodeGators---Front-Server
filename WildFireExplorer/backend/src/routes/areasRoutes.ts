// src/routes/areas/areasRoutes.ts
import { Router } from 'express';
import { getAreaPorEstado, getAreaPorBioma } from '../controllers/areasController'; // Caminho ajustado

const router = Router();

router.get('/area-estado', getAreaPorEstado);
router.get('/area-bioma', getAreaPorBioma);

export default router;