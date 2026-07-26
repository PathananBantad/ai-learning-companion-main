import { supabase } from "../lib/supabase";

export const validateClassCode = async (code: string) => {
  console.log("Searching class:", code);

  const { data, error } = await supabase
      .from("classes")
      .select("*")
      .eq("class_code", code)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

  console.log("Result:", data);
  console.log("Error:", error);

  if (error || !data) {
    return {
      success: false,
      message: "Class not found",
    };
  }

  return {
    success: true,
    data,
  };
};

export const createClass = async (classCode: string, className?: string) => {
  const { data, error } = await supabase
      .from("classes")
      .insert({
        class_code: classCode,
        class_name: className || "Untitled Class",
      })
      .select()
      .single();

  if (error) {
    console.error("Error creating class in Supabase:", error.message);
    return null;
  }

  return data;
};

// Create a row in student_sessions so we have a sessionId to attach to
// conversation_logs (which requires a valid session_id foreign key).
// NOTE: student_sessions.student_id and .class_id are uuid foreign keys
// (to profiles.id and classes.id respectively) — the old text columns
// `name` and `class_code` were dropped in 20260717092517_remote_schema.sql.
export const createStudentSession = async (
    profileId: string,
    classId: string,
): Promise<number | null> => {
  const { data, error } = await supabase
      .from("student_sessions")
      .insert({
        student_id: profileId,
        class_id: classId,
        activity_type: "chat",
      })
      .select("id")
      .single();

  if (error) {
    console.error("Error creating student session:", error.message);
    return null;
  }

  return data?.id ?? null;
};

export const enrollStudent = async (classCode: string, name: string) => {
  const { error } = await supabase.from("enrollments").insert({
    class_code: classCode,
    name,
  });

  if (error) {
    console.error("Error enrolling student in Supabase:", error.message);
  }
};

export const getLatestClassCode = async () => {
  const { data, error } = await supabase
      .from("classes")
      .select("class_code")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

  if (error || !data) {
    console.error("Error getting latest class code:", error?.message);
    return null;
  }

  return data.class_code;
};

export const getAllClasses = async () => {
  const { data, error } = await supabase
      .from("classes")
      .select("*")
      .order("created_at", { ascending: false });

  if (error) {
    console.error("Error getting all classes:", error?.message);
    return [];
  }

  return data;
};