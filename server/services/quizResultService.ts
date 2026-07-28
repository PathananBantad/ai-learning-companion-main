import { supabaseAdmin as supabase } from "../lib/supabase";

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
    answers: { [key: string]: number };
    strengths: string[];
    weaknesses: string[];
    recommendations: string[];
}

export async function saveQuizResult({
                                         name,
                                         studentId,
                                         classCode,
                                         score,
                                         totalQuestions,
                                         aiFeedback,
                                         misconceptionsTriggered,
                                         answers,
                                         strengths,
                                         weaknesses,
                                         recommendations,
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
                answers,
                // strengths, weaknesses, and recommendations are already stored inside ai_feedback JSON
                // but we include them here if we ever add native columns for them later
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

// ดึงผล Quiz ล่าสุดของนักเรียนคนหนึ่งในคลาสที่ระบุ
export async function getLatestQuizResultForStudent(
    studentCode: string,
    classCode: string,
) {
    const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id")
        .eq("student_code", studentCode)
        .maybeSingle();

    if (profileError) {
        console.error("Error looking up profile for quiz result:", profileError);
        throw profileError;
    }

    if (!profile) {
        return null;
    }

    const { data, error } = await supabase
        .from("quiz_results")
        .select("*")
        .eq("student_id", profile.id)
        .eq("class_code", classCode)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

    if (error) {
        console.error("Error fetching latest quiz result:", error);
        throw error;
    }

    // Fallback to reading them from ai_feedback if native columns don't exist
    if (data && data.ai_feedback) {
        data.strengths = data.strengths || data.ai_feedback.strengths;
        data.weaknesses = data.weaknesses || data.ai_feedback.weaknesses;
        data.recommendations = data.recommendations || data.ai_feedback.recommendations;
    }

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