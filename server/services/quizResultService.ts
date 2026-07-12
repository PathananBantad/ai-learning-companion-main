import { supabase } from "../lib/supabase";

export async function saveQuizResult({
                                         name,
                                         classCode,
                                         score,
                                         totalQuestions,
                                         aiFeedback,
                                     }: {
    name: string;
    classCode: string;
    score: number;
    totalQuestions: number;
    aiFeedback: any;
}) {
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

    if (error) throw error;

    return data;
}