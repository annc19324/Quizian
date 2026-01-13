import { customAlphabet } from 'nanoid';

const nanoid = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', 10);

export function generateShareCode(): string {
    return nanoid();
}

export function parseQuizText(text: string): Array<{ question: string; answers: Array<{ text: string; isCorrect: boolean }> }> {
    const lines = text.split('\n').map(line => line.trim()).filter(line => line);
    const questions: Array<{ question: string; answers: Array<{ text: string; isCorrect: boolean }> }> = [];

    let currentQuestion: { question: string; answers: Array<{ text: string; isCorrect: boolean }> } | null = null;

    for (const line of lines) {
        // Check if line starts with a digit (new question)
        if (/^\d+/.test(line)) {
            if (currentQuestion && currentQuestion.answers.length > 0) {
                questions.push(currentQuestion);
            }

            currentQuestion = {
                question: line.replace(/^\d+[\.\s]*/, ''), // Remove leading digit and dots
                answers: [],
            };
        } else if (currentQuestion) {
            // This is an answer
            let isCorrect = false;
            let answerText = line;

            if (line.startsWith('*')) {
                isCorrect = true;
                answerText = line.substring(1).trim();
            }

            currentQuestion.answers.push({
                text: answerText,
                isCorrect,
            });
        }
    }

    // Add last question
    if (currentQuestion && currentQuestion.answers.length > 0) {
        questions.push(currentQuestion);
    }

    return questions;
}

export function shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}
