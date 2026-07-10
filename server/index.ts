import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';

import classRouter from './routes/class';
import quizRouter from './routes/quiz';
import analyticsRouter from './routes/analytics';
import chatRouter from './routes/chat';
import classRoutes from './routes/class.routes';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Endpoints
  app.use('/api', classRouter);
  app.use('/api', quizRouter);
  app.use('/api', analyticsRouter);
  app.use('/api', chatRouter);

  // Serve static client files in production, use Vite middleware in development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`AI Learning Companion Server running on http://localhost:${PORT}`);
  });
}

startServer();