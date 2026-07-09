// server/services/feedbackService.ts

export interface FeedbackResult {
  level: string;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
}

export function generateFeedback(
  score: number,
  strengths: string[],
  weaknesses: string[],
  misconceptions: string[]
): FeedbackResult {
  if (score >= 90) {
    return {
      level: "Excellent",
      summary: "คุณมีความเข้าใจบทเรียนในระดับดีมาก",
      strengths,
      weaknesses,
      recommendations: [
        "ลองศึกษาเนื้อหาระดับสูงเพิ่มเติม",
        "ช่วยอธิบายเพื่อนในห้อง"
      ]
    };
  }

  if (score >= 70) {
    return {
      level: "Good",
      summary: "คุณเข้าใจเนื้อหาส่วนใหญ่ แต่ยังมีบางหัวข้อที่ควรทบทวน",
      strengths,
      weaknesses,
      recommendations: [
        "กลับไปทบทวนหัวข้อที่ตอบผิด",
        "ลองทำ Quiz อีกครั้ง"
      ]
    };
  }

  return {
    level: "Need Improvement",
    summary: "คุณควรกลับไปทบทวนบทเรียนอีกครั้ง",
    strengths,
    weaknesses,
    recommendations: [
      "อ่าน Summary ของบทเรียน",
      "ถาม AI Tutor",
      "ลองทำ Quiz ใหม่"
    ]
  };
}
