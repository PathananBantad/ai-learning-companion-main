import { supabaseAdmin as supabase } from "../lib/supabase";

export async function getAnalytics(classCode: string) {
    const { data, error } = await supabase
        .from("quiz_results")
        .select(`
            *,
            profiles ( student_code )
        `)
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
        (row.misconceptions_triggered ?? []).forEach((topic: string) => {
            misconceptionMap.set(
                topic,
                (misconceptionMap.get(topic) ?? 0) + 1
            );
        });
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
    const studentMap = new Map<string, any[]>();
    quizResults.forEach((item: any) => {
        const sid = item.profiles?.student_code || item.student_id;
        if (!studentMap.has(sid)) {
            studentMap.set(sid, []);
        }
        studentMap.get(sid)!.push(item);
    });

    const students = Array.from(studentMap.entries()).map(([sid, attempts]) => {
        // Sort attempts by created_at descending (latest first)
        attempts.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        
        const latest = attempts[0];

        // Aggregate unique strengths, weaknesses, misconceptions across all attempts
        const strengthsSet = new Set<string>();
        const weaknessesSet = new Set<string>();
        const misconceptionsSet = new Set<string>();

        attempts.forEach(attempt => {
            (attempt.ai_feedback?.strengths ?? []).forEach((s: string) => strengthsSet.add(s));
            (attempt.ai_feedback?.weaknesses ?? []).forEach((w: string) => weaknessesSet.add(w));
            (attempt.misconceptions_triggered ?? []).forEach((m: string) => misconceptionsSet.add(m));
        });

        return {
            student_id: sid,
            name: latest.name,
            quizScore: Number(latest.score),
            learningProgress: Math.min(Number(latest.score), 100),
            learningOutcomeAchievement: outcomeAchievement,
            strengths: Array.from(strengthsSet),
            weaknesses: Array.from(weaknessesSet),
            commonMisconceptions: Array.from(misconceptionsSet),
            aiFeedbackSummary: latest.ai_feedback?.summary ?? "",
            recommendedTopics: latest.ai_feedback?.recommendations ?? [],
            lastActivity: latest.created_at,
            attemptsCount: attempts.length,
            attempts: attempts.map(attempt => ({
                score: Number(attempt.score),
                strengths: attempt.ai_feedback?.strengths ?? [],
                weaknesses: attempt.ai_feedback?.weaknesses ?? [],
                commonMisconceptions: attempt.misconceptions_triggered ?? [],
                aiFeedbackSummary: attempt.ai_feedback?.summary ?? "",
                lastActivity: attempt.created_at
            }))
        };
    });

    return {
        classCode,
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