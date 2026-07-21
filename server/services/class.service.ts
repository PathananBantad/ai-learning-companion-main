import { supabase } from "../lib/supabase";

export const validateClassCode = async (code: string) => {
  const { data, error } = await supabase
    .from("classes")
    .select("*")
    .eq("class_code", code)
    .single();

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
