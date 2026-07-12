import { supabase } from "../lib/supabase";

export interface QuizFeedback {
    strengths: string[];
    weaknesses: string[];
    misconceptionsTriggered: string[];
    recommendations: string[];
}

interface SaveQuizResultParams {
    name: string;
    classCode: string;
    score: number;
    totalQuestions: number;
    aiFeedback: QuizFeedback;
}

export async function saveQuizResult({
                                         name,
                                         classCode,
                                         score,
                                         totalQuestions,
                                         aiFeedback,
                                     }: SaveQuizResultParams) {
    const { data, error } = await supabase
        .from("quiz_results")
        .insert([
            {
                name,
                class_code: classCode,
                score,
                total_questions: totalQuestions,
                ai_feedback: aiFeedback,
            },
        ])
        .select()
        .single();

    if (error) {
        console.error("Error saving quiz result:", error.message);
        throw error;
    }

    return data;
}