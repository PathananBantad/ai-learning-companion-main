import { Router, Request, Response } from 'express';
import { state } from '../data/lesson';

const router = Router();

// Get active class code
router.get('/class/code', (req: Request, res: Response) => {
  res.json({ activeClassCode: state.activeClassCode });
});

// Generate or set a custom class code
router.post('/class/generate', (req: Request, res: Response) => {
  const { customCode } = req.body;
  if (customCode && customCode.trim()) {
    state.activeClassCode = customCode.trim().toUpperCase();
  } else {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 4; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    state.activeClassCode = `AEG-${result}`;
  }
  res.json({ activeClassCode: state.activeClassCode });
});

// Verify entered class code from student join screen
router.post('/class/verify', (req: Request, res: Response) => {
  const { code } = req.body;
  if (!code) {
    res.status(400).json({ error: 'Code is required' });
    return;
  }
  const isCorrect = code.trim().toUpperCase() === state.activeClassCode.toUpperCase();
  res.json({ success: isCorrect, activeClassCode: state.activeClassCode });
});

export default router;