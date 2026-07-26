import { Router, Request, Response } from 'express';
import { state } from '../data/lesson';
import { getAnalytics } from "../services/analyticsService";
import { supabase } from '../lib/supabase';
import { getAIClient , AI_MODEL } from '../lib/ai';

const router = Router();

// Lightweight polling endpoint to check for new quiz submissions
router.get('/analytics/check-updates', async (req: Request, res: Response) => {
  try {
    const classCode = (req.query.classCode as string) || state.activeClassCode;
    const lastCount = parseInt(req.query.lastCount as string) || 0;

    const { count, error } = await supabase
      .from('quiz_results')
      .select('*', { count: 'exact', head: true })
      .eq('class_code', classCode);

    if (error) throw error;

    const currentCount = count || 0;
    res.json({
      hasUpdates: currentCount > lastCount,
      count: currentCount
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to check updates' });
  }
});

// Get teacher analytics
router.get('/analytics', async (req: Request, res: Response) => {
  try {
    let requestedClassCode =
      (req.query.classCode as string) || state.activeClassCode;

    if (requestedClassCode === 'AEGIS101') {
      const { data: latestClass } = await supabase
        .from('classes')
        .select('class_code')
        .order('created_at', { ascending: false })
        .limit(1);
      if (latestClass && latestClass.length > 0) {
        requestedClassCode = latestClass[0].class_code;
      }
    }

    const analytics = await getAnalytics(requestedClassCode);

    const refresh = req.query.refresh === 'true';
    const ai = getAIClient();

    if (ai && (refresh || !analytics.aiInsight)) {
      try {
        const prompt = `
You are an AI Learning Companion instructor assistant.

Average score: ${analytics.averageScore}%
Student submissions: ${analytics.studentSubmissionsCount}

Give the instructor a short recommendation in no more than 3 sentences.
`;

        const response = await ai.chat.completions.create({
          model: AI_MODEL,
          messages: [{ role: 'user', content: prompt }]
        });

        const content = response.choices[0].message.content;

        if (content) {
          analytics.aiInsight = content.trim();
        }
      } catch (err: any) {
        console.error(
          'Error generating AI analytics insights:',
          err.message || err
        );
      }
    }

    res.json(analytics);
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: 'Failed to load analytics',
    });
  }
});
// Generate individual student AI Insight

router.post('/student-insight', async (req: Request, res: Response) => {
  const { student } = req.body;
  if (!student) {
    res.status(400).json({ error: 'Missing student data' });
    return;
  }

  const ai = getAIClient();
  if (ai) {
    try {
      const prompt = `
        You are an expert AI Education Co-pilot.
        Analyze this student's learning profile and generate a highly personalized diagnostic insight report.

        Student Profile:
        - Name: ${student.name}
        - ID: ${student.id}
        - Quiz Score: ${student.quizScore}%
        - Course Progress: ${student.learningProgress}%
        - Strengths: ${JSON.stringify(student.strengths)}
        - Weaknesses: ${JSON.stringify(student.weaknesses)}
        - Common Misconceptions: ${JSON.stringify(student.commonMisconceptions)}
        - Historical Achievements: ${JSON.stringify(student.learningOutcomeAchievement)}

        Generate an insightful JSON report summarizing:
        1. "understandingLevel": (e.g. Master, Proficient, Developing, or Needs Support - with 1-2 sentences of explanation)
        2. "misconceptions": (List 1-2 specific conceptual mistakes they make, or explain they are clear)
        3. "strengths": (List 1-2 learning strengths with brief explanations)
        4. "weaknesses": (List 1-2 learning weaknesses with brief explanations)
        5. "recommendations": (List 2 actionable personalized learning tips)
        6. "nextActivities": (List 2 suggested concrete next learning activities to improve)

        Respond ONLY with a valid JSON object matching the keys above. Do not output any markdown code blocks (such as \`\`\`json) or external text.
      `;


      const response = await ai.chat.completions.create({
        model: AI_MODEL,
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' }
      });

      if (response.choices && response.choices[0].message) {
        const content = response.choices[0].message.content;
        if(content){
          const cleanJSON = content.trim().replace(/^```json\s*/, '').replace(/```$/, '').trim();
          const parsed = JSON.parse(cleanJSON);
          
          res.json(parsed);
          return;
        }
        
       
      }
    } catch (err: any) {
      console.error('Error generating student AI insight with AI:', err.message || err);
    }
  }

  // High fidelity fallback matching the precise keys, customized based on the student's actual metrics
  const score = student.quizScore;
  let understandingLevel = 'Developing understanding. Demonstrates basic familiarity with key concepts but requires structured practice on edge cases.';
  if (score >= 90) {
    understandingLevel = 'Advanced Mastery. Demonstrates exceptional depth of comprehension in web routing, HTTP protocols, and security structures.';
  } else if (score >= 75) {
    understandingLevel = 'Proficient. Shows robust understanding of mainstream concepts with minor inconsistencies in technical edge cases.';
  } else if (score < 60) {
    understandingLevel = 'Needs Targeted Support. Requires systematic instruction on fundamental REST architecture and request/response life cycles.';
  }

  const fallbacks = {
    understandingLevel,
    misconceptions: student.commonMisconceptions && student.commonMisconceptions[0] !== 'None'
      ? student.commonMisconceptions
      : (score >= 85 ? ['None identified'] : ['Assuming hidden parameters are cryptographically secure by default']),
    strengths: student.strengths && student.strengths[0] !== 'None'
      ? student.strengths.map((s: string) => `${s} - High score on corresponding questions.`)
      : ['Basic request lifecycle flow'],
    weaknesses: student.weaknesses && student.weaknesses[0] !== 'None'
      ? student.weaknesses.map((w: string) => `${w} - Showing slight hesitation on relevant questions.`)
      : (score >= 90 ? ['No major weaknesses identified'] : ['Technical definitions of PUT vs POST safety and idempotency']),
    recommendations: score >= 90
      ? ['Review RFC 7231 standards for future architectural designs.', 'Examine enterprise OAuth scopes and session management systems.']
      : ['Use the interactive sandbox to practice making GET and POST requests.', 'Verify resource state changes for PUT and PATCH requests.'],
    nextActivities: score >= 90
      ? ['Assist peers on the class discussion board.', 'Implement a lightweight backend router matching REST parameters.']
      : ['Complete the HTTP Verbs practice card deck.', 'Ask the AI tutor: "Give me an example of PUT vs POST idempotency".']
  };

  res.json(fallbacks);
});

export default router;