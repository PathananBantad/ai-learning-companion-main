import { Router, Request, Response } from 'express';
import { state } from '../data/lesson';
import { submitCourseFeedback, getCourseFeedback } from '../services/courseFeedbackService';
import { saveProfile } from '../services/profileService';

const router = Router();

// Student: submit a course comment (optionally anonymous)
router.post('/course-feedback', async (req: Request, res: Response) => {
  const { classCode, comment, isAnonymous, studentName, studentId } = req.body;

  if (!comment || !comment.trim()) {
    return res.status(400).json({ error: 'Comment is required' });
  }

  try {
    // course_feedback.student_id is a uuid FK -> profiles.id, but the frontend
    // only ever knows the human-entered student code (e.g. "6709650244"), not
    // the Supabase profile uuid. Resolve it here the same way quiz.ts already
    // does before /quiz/submit, otherwise the insert fails with
    // "invalid input syntax for type uuid".
    let resolvedStudentId: string | undefined = undefined;

    if (!isAnonymous && studentName && studentId) {
      try {
        const profile = await saveProfile(studentName, studentId, 'student');
        resolvedStudentId = profile?.id;
      } catch (err) {
        console.error('Failed to resolve profile for course feedback:', err);
        // Fall through and save the comment without a linked student_id
        // rather than failing the whole submission.
      }
    }

    const saved = await submitCourseFeedback({
      classCode: classCode || state.activeClassCode,
      comment: comment.trim(),
      isAnonymous: !!isAnonymous,
      studentName,
      studentId: resolvedStudentId,
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