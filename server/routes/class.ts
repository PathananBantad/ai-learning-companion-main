import { Router, Request, Response } from 'express';
import { validateClassCode } from '../services/class.service';

const router = Router();

// Verify entered class code from student join screen
router.post('/class/verify', async (req: Request, res: Response) => {
  const { code } = req.body;

  if (!code) {
    return res.status(400).json({
      success: false,
      error: 'Code is required'
    });
  }

  try {
    const result = await validateClassCode(code);

    if (!result.success) {
      return res.status(404).json(result);
    }

    return res.status(200).json({
      success: true,
      class: result.data
    });
  } catch (error) {
    console.error('Error validating class code:', error);

    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

export default router;