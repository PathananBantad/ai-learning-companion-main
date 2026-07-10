import express from 'express';
import { validateClassCode } from '../services/class.service';

const router = express.Router();

router.post('/validate', async (req, res) => {
    const { code } = req.body;

    if (!code) {
        return res.status(400).json({ error: 'Please provide a class code' });
    }

    const result = await validateClassCode(code);

    if (!result.success) {
        return res.status(404).json(result);
    }

    res.status(200).json(result);
});

export default router;