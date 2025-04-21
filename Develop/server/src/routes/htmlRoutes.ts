import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Router, Request, Response } from 'express';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const router = Router();

// Define route to serve index.html
// This route catches all paths and serves the React application
router.get('*', (_req: Request, res: Response) => {
  // Send the index.html file from the client's dist directory
  res.sendFile(path.join(__dirname, '../../../../client/dist/index.html'));
});

export default router;
