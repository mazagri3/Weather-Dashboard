import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Router, type Request, type Response } from 'express';
import express from 'express';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const router = Router();

// Serve static files from the public directory
router.use(express.static(path.join(__dirname, '../../public')));

// Serve index.html for the root route
router.get('/', (_req: Request, res: Response): void => {
  res.sendFile(path.join(__dirname, '../../public/index.html'));
});

export default router;
