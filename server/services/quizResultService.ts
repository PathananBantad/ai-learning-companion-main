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

    console.log("===== saveQuizResult =====");
    console.log({
        name,
        classCode,
        score,
        totalQuestions,
        aiFeedback,
    });

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

    console.log("===== Supabase Insert Result =====");
    console.log({
        data,
        error,
    });

    if (error) {
        console.error("Error saving quiz result:", error);
        throw error;
    }

    console.log("Quiz result saved successfully.");

    return data;
}

// ดึงผล Quiz ทั้งหมดจากฐานข้อมูล
export async function getQuizResults() {
    const { data, error } = await supabase
        .from("quiz_results")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Error fetching quiz results:", error);
        throw error;
    }

    return data;
}