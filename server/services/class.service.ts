import { supabase } from '../lib/supabase';

export const validateClassCode = async (code: string) => {
    const { data, error } = await supabase
        .from('classes')
        .select('*')
        .eq('class_code', code)
        .maybeSingle(); // ใช้ maybeSingle แทน single เพื่อไม่ให้ throw ตอนไม่เจอแถว

    if (error || !data) {
        return { success: false, message: 'Class not found' };
    }

    return { success: true, data };
};

export const createClass = async (classCode: string, className?: string) => {
    const { data, error } = await supabase
        .from('classes')
        .insert({ class_code: classCode, class_name: className || 'Untitled Class' })
        .select()
        .single();

    if (error) {
        console.error('Error creating class in Supabase:', error.message);
        return null;
    }
    return data;
};

export const enrollStudent = async (classCode: string, name: string) => {
    const { error } = await supabase
        .from('enrollments')
        .insert({ class_code: classCode, name });

    if (error) {
        console.error('Error enrolling student in Supabase:', error.message);
    }
};