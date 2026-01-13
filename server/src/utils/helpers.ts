import { customAlphabet } from 'nanoid';

const nanoid = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', 10);

export function generateShareCode(): string {
    return nanoid();
}

export function parseQuizText(text: string): Array<{ question: string; answers: Array<{ text: string; isCorrect: boolean }> }> {
    // Keep empty lines to help with separation if needed, but primarily relying on detection is better.
    // However, the original code filtered empty lines. Let's keep filtering but improve regex.
    const lines = text.split('\n').map(line => line.trim()).filter(line => line);
    const questions: Array<{ question: string; answers: Array<{ text: string; isCorrect: boolean }> }> = [];

    let currentQuestion: { question: string; answers: Array<{ text: string; isCorrect: boolean }> } | null = null;

    // Regex for: "1.", "1 ", "Câu 1:", "Câu 1.", "câu 1 "
    const questionStartRegex = /^(?:Câu|Question)?\s*\d+[:\.\)]?\s+/i;
    // Regex for answer prefixes: "A.", "a)", "A "
    const answerPrefixRegex = /^[A-H][\.\)\s]\s*/i;

    for (const line of lines) {
        // Check if line starts with a number or "Câu <number>"
        if (questionStartRegex.test(line)) {
            if (currentQuestion && currentQuestion.answers.length > 0) {
                questions.push(currentQuestion);
            }

            currentQuestion = {
                question: line.replace(questionStartRegex, '').trim(),
                answers: [],
            };
        } else if (currentQuestion) {
            let isCorrect = false;
            let answerText = line;

            if (line.startsWith('@')) {
                isCorrect = true;
                answerText = line.substring(1).trim();
            }

            // Remove A., B., C. prefixes if present
            answerText = answerText.replace(answerPrefixRegex, '');

            currentQuestion.answers.push({
                text: answerText,
                isCorrect,
            });
        }
    }

    if (currentQuestion && currentQuestion.answers.length > 0) {
        questions.push(currentQuestion);
    }

    return questions;
}
