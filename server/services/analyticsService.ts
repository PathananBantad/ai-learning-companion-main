import { supabase } from "../lib/supabase";

export async function getAnalytics(classCode: string) {
    const { data, error } = await supabase
        .from("quiz_results")
        .select("*")
        .eq("class_code", classCode);

    if (error) {
        throw error;
    }

    const quizResults = data ?? [];
    const totalStudents = quizResults.length;

    // =========================
    // Basic Statistics
    // =========================
    const averageScore =
        totalStudents > 0
            ? Math.round(
                quizResults.reduce(
                    (sum: number, item: any) => sum + Number(item.score),
                    0
                ) / totalStudents
            )
            : 0;

    const highestScore =
        totalStudents > 0
            ? Math.max(...quizResults.map((item: any) => Number(item.score)))
            : 0;

    const lowestScore =
        totalStudents > 0
            ? Math.min(...quizResults.map((item: any) => Number(item.score)))
            : 0;

    // =========================
    // Outcome Achievement
    // =========================
    const outcomeMap = new Map<string, number>();

    quizResults.forEach((row: any) => {
        (row.ai_feedback?.strengths ?? []).forEach((topic: string) => {
            outcomeMap.set(topic, (outcomeMap.get(topic) ?? 0) + 1);
        });
    });

    const outcomeAchievement = [...outcomeMap.entries()].map(
        ([name, count]) => ({
            name,
            score:
                totalStudents > 0
                    ? Math.round((count / totalStudents) * 100)
                    : 0,
        })
    );

    // =========================
    // Common Misconceptions
    // =========================
    const misconceptionMap = new Map<string, number>();

    quizResults.forEach((row: any) => {
        (row.ai_feedback?.misconceptionsTriggered ?? []).forEach(
            (topic: string) => {
                misconceptionMap.set(
                    topic,
                    (misconceptionMap.get(topic) ?? 0) + 1
                );
            }
        );
    });

    const commonMisconceptions = [...misconceptionMap.entries()].map(
        ([topic, count]) => ({
            topic,
            count,
            description: `This misconception appeared in ${count} submission(s).`,
        })
    );

    // =========================
    // Most Incorrect Topic
    // =========================
    const sortedMisconceptions = [...commonMisconceptions].sort(
        (a, b) => b.count - a.count
    );

    const mostIncorrectTopic =
        sortedMisconceptions.length > 0
            ? sortedMisconceptions[0].topic
            : "";

    // =========================
    // Weekly Trend
    // =========================
    const weeklyMap = new Map<
        string,
        {
            totalScore: number;
            students: number;
        }
    >();

    quizResults.forEach((row: any) => {
        // ใช้วันที่จริง เช่น 2026-07-15
        const day = new Date(row.created_at).toISOString().split("T")[0];

        if (!weeklyMap.has(day)) {
            weeklyMap.set(day, {
                totalScore: 0,
                students: 0,
            });
        }

        const current = weeklyMap.get(day)!;

        current.totalScore += Number(row.score);
        current.students += 1;
    });

    const weeklyTrend = [...weeklyMap.entries()].map(([day, value]) => ({
        day,
        averageScore: Math.round(value.totalScore / value.students),
        activeStudents: value.students,
    }));

    // =========================
    // Students
    // =========================
    const students = quizResults.map((item: any) => ({
        student_id: item.student_id,
        name: item.name,

        quizScore: Number(item.score),

        // score เป็นเปอร์เซ็นต์อยู่แล้ว
        learningProgress: Math.min(Number(item.score), 100),

        learningOutcomeAchievement: outcomeAchievement,

        strengths: item.ai_feedback?.strengths ?? [],

        weaknesses: item.ai_feedback?.weaknesses ?? [],

        commonMisconceptions:
            item.ai_feedback?.misconceptionsTriggered ?? [],

        aiFeedbackSummary:
            item.ai_feedback?.recommendations?.join(" ") ?? "",

        recommendedTopics:
            item.ai_feedback?.recommendations ?? [],

        lastActivity: item.created_at,
    }));

    return {
        averageScore,
        studentSubmissionsCount: totalStudents,

        highestScore,
        lowestScore,

        students,

        outcomeAchievement,

        mostIncorrectTopic,

        mostAskedQuestions: [],

        commonMisconceptions,

        weeklyTrend,

        aiInsight: "",
    };
}