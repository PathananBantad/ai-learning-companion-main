import { supabase } from "../lib/supabase";

export interface QuizFeedback {
    level: string;
    summary: string;
    strengths: string[];
    weaknesses: string[];
    recommendations: string[];
    encouragement: string;
}

interface SaveQuizResultParams {
    name: string;
    studentId: string;
    classCode: string;
    score: number;
    totalQuestions: number;
    aiFeedback: QuizFeedback;
    misconceptionsTriggered: string[];
}

export async function saveQuizResult({
                                         name,
                                         studentId,
                                         classCode,
                                         score,
                                         totalQuestions,
                                         aiFeedback,
                                         misconceptionsTriggered,
                                     }: SaveQuizResultParams) {

    console.log("===== saveQuizResult =====");
    console.log({
        name,
        studentId,
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
                student_id: studentId,
                class_code: classCode,
                score,
                total_questions: totalQuestions,
                ai_feedback: aiFeedback,
                misconceptions_triggered: misconceptionsTriggered,
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