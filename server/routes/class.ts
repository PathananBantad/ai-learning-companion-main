import { Router, Request, Response } from "express";
import { state } from "../data/lesson";
import {
  createClass,
  validateClassCode,
  getLatestClassCode,
  getAllClasses,
  createStudentSession,
} from "../services/class.service";
import { saveProfile } from "../services/profileService";

const router = Router();

// Get active class code (อ่านจาก Supabase)
router.get("/class/code", async (req: Request, res: Response) => {
  const activeClassCode = await getLatestClassCode();

  res.json({
    activeClassCode,
  });
});

// Generate or set a custom class code
router.post("/class/generate", async (req: Request, res: Response) => {
  const { customCode } = req.body;

  if (customCode && customCode.trim()) {
    state.activeClassCode = customCode.trim().toUpperCase();
  } else {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "";

    for (let i = 0; i < 4; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    state.activeClassCode = `AEG-${result}`;
  }

  await createClass(state.activeClassCode, state.currentLesson?.topic);

  res.json({
    activeClassCode: state.activeClassCode,
  });
});

// Verify entered class code
router.post("/class/verify", async (req: Request, res: Response) => {
  const { code, name, studentId } = req.body;

  if (!code) {
    return res.status(400).json({
      error: "Code is required",
    });
  }

  const normalizedCode = code.trim().toUpperCase();

  let result = await validateClassCode(normalizedCode);

  // Fallback
  if (!result.success && normalizedCode === state.activeClassCode) {
    const createdClass = await createClass(
      normalizedCode,
      state.currentLesson?.topic,
    ).catch(() => null);

    result = {
      success: true,
      data: createdClass ?? {
        class_code: normalizedCode,
      },
    };
  }

  let sessionId: string | null = null;

  if (result.success) {
    // Do not sync memory here, as it changes the active class globally for the instructor dashboard
    // state.activeClassCode = normalizedCode;

    const classId: string | undefined = (result.data as any)?.id;

    // บันทึกข้อมูลนักศึกษาลง profiles
    if (name && studentId) {
      let profile: { id: string } | null = null;

      try {
        profile = await saveProfile(name, studentId, "student");
      } catch (err) {
        console.error("Save profile failed:", err);
      }

      // สร้าง session ผูก Student (profiles.id) + Class (classes.id) เพื่อใช้บันทึก
      // conversation_logs ตอนแชทกับ AI ภายหลัง
      if (profile?.id && classId) {
        sessionId = await createStudentSession(profile.id, classId);
      } else {
        console.error(
          "[CLASS VERIFY] Skipped creating student session — missing profile.id or class.id",
          { profileId: profile?.id, classId },
        );
      }
    }
  }

  res.json({
    success: result.success,
    activeClassCode: normalizedCode,
    sessionId,
  });
});

// Get all classes
router.get("/classes", async (req: Request, res: Response) => {
  const classes = await getAllClasses();
  res.json({ classes });
});

export default router;
