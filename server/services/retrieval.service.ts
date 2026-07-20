import { state } from "../data/lesson";

export interface RetrievalResult {
  source: string;
  content: string;
}

export async function retrieveContext(
  question: string,
): Promise<RetrievalResult[]> {
  const lesson = state.currentLesson;

  const contexts: RetrievalResult[] = [];

  contexts.push({
    source: "Lesson Topic",
    content: lesson.topic,
  });

  lesson.keyConcepts.forEach((concept) => {
    contexts.push({
      source: concept.title,
      content: concept.description,
    });
  });

  lesson.commonMisconceptions.forEach((item) => {
    contexts.push({
      source: item.title,
      content: item.explanation,
    });
  });

  return contexts;
}
