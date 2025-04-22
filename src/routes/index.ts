import { Router } from 'express';
const router = Router();

import apiRoutes from './api/index.ts';
import htmlRoutes from './htmlRoutes.ts';

router.use('/api', apiRoutes);
router.use('/', htmlRoutes);

export default router;
