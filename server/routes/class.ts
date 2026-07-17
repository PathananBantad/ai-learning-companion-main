import { Router, Request, Response } from 'express';
import { state } from '../data/lesson';
import { createClass, validateClassCode, enrollStudent } from '../services/class.service';

const router = Router();

// Get active class code
router.get('/class/code', (req: Request, res: Response) => {
  res.json({ activeClassCode: state.activeClassCode });
});

// Generate or set a custom class code — now also persisted to Supabase
router.post('/class/generate', async (req: Request, res: Response) => {
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

  await createClass(state.activeClassCode, state.currentLesson?.topic);

  res.json({ activeClassCode: state.activeClassCode });
});

// Verify entered class code from student join screen — now checks Supabase
router.post('/class/verify', async (req: Request, res: Response) => {
  const { code, name } = req.body;
  if (!code) {
    res.status(400).json({ error: 'Code is required' });
    return;
  }

  const normalizedCode = code.trim().toUpperCase();
  let result = await validateClassCode(normalizedCode);

  // Fallback: If DB check fails but the code matches the active session state
  if (!result.success && normalizedCode === state.activeClassCode) {
    result = { success: true, data: { class_code: normalizedCode } };
    // Ensure the class exists in the DB for future queries
    await createClass(normalizedCode, state.currentLesson?.topic).catch(() => { });
  }

  if (result.success && name) {
    // ไม่ await ให้บล็อก response — ยิงบันทึก enrollment ไปพร้อมกัน
    enrollStudent(normalizedCode, name).catch(() => { });
  }

  res.json({ success: result.success, activeClassCode: normalizedCode });
});

export default router;