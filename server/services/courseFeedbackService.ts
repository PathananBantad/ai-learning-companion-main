import { supabase } from "../lib/supabase";

interface SubmitCourseFeedbackParams {
    classCode: string;
    comment: string;
    isAnonymous: boolean;
    studentName?: string;
    studentId?: string;
}

export async function submitCourseFeedback({
    classCode,
    comment,
    isAnonymous,
    studentName,
    studentId,
}: SubmitCourseFeedbackParams) {
    const { data, error } = await supabase
        .from("course_feedback")
        .insert([
            {
                class_code: classCode,
                comment,
                is_anonymous: isAnonymous,
                // Never persist identity fields when the student chose to post anonymously
                student_name: isAnonymous ? null : studentName || null,
                student_id: isAnonymous ? null : studentId || null,
            },
        ])
        .select()
        .single();

    if (error) {
        console.error("Error saving course feedback:", error);
        throw error;
    }

    return data;
}

export async function getCourseFeedback(classCode?: string) {
    let query = supabase
        .from("course_feedback")
        .select("*")
        .order("created_at", { ascending: false });

    if (classCode) {
        query = query.eq("class_code", classCode);
    }

    const { data, error } = await query;

    if (error) {
        console.error("Error fetching course feedback:", error);
        throw error;
    }

    return data;
}
