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
                strengths,
                weaknesses,
                recommendations,
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

// ดึงผล Quiz ล่าสุดของนักเรียนคนหนึ่งในคลาสที่ระบุ (ใช้ตอนรีเฟรชหน้า Personalized Feedback)
export async function getLatestQuizResultForStudent(
    studentCode: string,
    classCode: string,
) {
    // profiles.student_code is the human-entered student ID (e.g. university code),
    // while quiz_results.student_id references profiles.id (uuid) — so look up the
    // profile first, then find that profile's latest attempt for this class.
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