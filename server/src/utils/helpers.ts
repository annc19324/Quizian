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
        if (/^\d+/.test(line)) {
            if (currentQuestion && currentQuestion.answers.length > 0) {
                questions.push(currentQuestion);
            }

            currentQuestion = {
                question: line.replace(/^\d+[\.\s]*/, ''),
                answers: [],
            };
        } else if (currentQuestion) {
            let isCorrect = false;
            let answerText = line;

            if (line.startsWith('@')) {
                isCorrect = true;
                answerText = line.substring(1).trim();
            }

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
