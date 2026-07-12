import { supabase } from "../lib/supabase";

export async function getAnalytics() {
    const { data, error } = await supabase
        .from("quiz_results")
        .select("*");

    if (error) {
        throw error;
    }

    const totalStudents = data?.length ?? 0;

    const averageScore =
        totalStudents > 0
            ? Math.round(
                data.reduce(
                    (sum: number, item: any) => sum + Number(item.score),
                    0
                ) / totalStudents
            )
            : 0;

    const highestScore =
        totalStudents > 0
            ? Math.max(...data.map((item: any) => Number(item.score)))
            : 0;

    const lowestScore =
        totalStudents > 0
            ? Math.min(...data.map((item: any) => Number(item.score)))
            : 0;

    return {
        averageScore,
        studentSubmissionsCount: totalStudents,
        highestScore,
        lowestScore,
        quizResults: data,
        aiInsight: ""
    };
}