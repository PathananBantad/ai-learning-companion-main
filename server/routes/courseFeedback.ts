import { Router, Request, Response } from 'express';
import { state } from '../data/lesson';
import { submitCourseFeedback, getCourseFeedback } from '../services/courseFeedbackService';

const router = Router();

// Student: submit a course comment (optionally anonymous)
router.post('/course-feedback', async (req: Request, res: Response) => {
  const { classCode, comment, isAnonymous, studentName, studentId } = req.body;

  if (!comment || !comment.trim()) {
    return res.status(400).json({ error: 'Comment is required' });
  }

  try {
    const saved = await submitCourseFeedback({
      classCode: classCode || state.activeClassCode,
      comment: comment.trim(),
      isAnonymous: !!isAnonymous,
      studentName,
      studentId,
    });

    res.json({ success: true, feedback: saved });
  } catch (err) {
    console.error('Error submitting course feedback:', err);
    res.status(500).json({ error: 'Failed to submit comment' });
  }
});

// Teacher: list course comments, optionally filtered by class code
router.get('/course-feedback', async (req: Request, res: Response) => {
  try {
    const classCode = (req.query.classCode as string) || undefined;
    const feedback = await getCourseFeedback(classCode);

    res.json({ success: true, feedback });
  } catch (err) {
    console.error('Error fetching course feedback:', err);
    res.status(500).json({ error: 'Failed to load comments' });
  }
});

export default router;
