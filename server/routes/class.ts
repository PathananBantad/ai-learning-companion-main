import { Router, Request, Response } from 'express';
import { state } from '../data/lesson';
import {
  createClass,
  validateClassCode,
  getLatestClassCode
} from '../services/class.service';
import { saveProfile } from "../services/profileService";

const router = Router();

// Get active class code (อ่านจาก Supabase)
router.get('/class/code', async (req: Request, res: Response) => {
  const activeClassCode = await getLatestClassCode();

  res.json({
    activeClassCode
  });
});

// Generate or set a custom class code
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

  await createClass(
      state.activeClassCode,
      state.currentLesson?.topic
  );

  res.json({
    activeClassCode: state.activeClassCode
  });
});

// Verify entered class code
router.post('/class/verify', async (req: Request, res: Response) => {

  const { code, name, studentId } = req.body;

  if (!code) {
    return res.status(400).json({
      error: 'Code is required'
    });
  }

  const normalizedCode = code.trim().toUpperCase();

  let result = await validateClassCode(normalizedCode);

  // Fallback
  if (!result.success && normalizedCode === state.activeClassCode) {
    result = {
      success: true,
      data: {
        class_code: normalizedCode
      }
    };

    await createClass(
        normalizedCode,
        state.currentLesson?.topic
    ).catch(() => {});
  }

  if (result.success) {

    // Sync memory
    state.activeClassCode = normalizedCode;

    // บันทึกข้อมูลนักศึกษาลง profiles
    if (name && studentId) {
      try {
        await saveProfile(
            name,
            studentId,
            "student"
        );
      } catch (err) {
        console.error("Save profile failed:", err);
      }
    }
  }

  res.json({
    success: result.success,
    activeClassCode: normalizedCode
  });

});

export default router;