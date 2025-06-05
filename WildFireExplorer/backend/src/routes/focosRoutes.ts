// src/routes/focos/focosRoutes.ts
import { Router } from 'express';
import { getFocosPorEstado, getFocosPorBioma } from '../controllers/focosController'; // Caminho ajustado

const router = Router();

router.get('/focos-estado', getFocosPorEstado);
router.get('/focos-bioma', getFocosPorBioma);

export default router;