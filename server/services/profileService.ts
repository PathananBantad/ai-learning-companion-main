import { supabase } from "../lib/supabase";

export async function saveProfile(
    name: string,
    studentCode: string,
    role: "student" | "teacher"
) {
    const { data, error } = await supabase
        .from("profiles")
        .upsert(
            {
                name,
                role,
                student_code: studentCode,
                created_at: new Date().toISOString(),
            },
            {
                onConflict: "student_code",
            }
        )
        .select()
        .single();

    if (error) {
        console.error("Save profile error:", error);
        throw error;
    }

    return data;
}