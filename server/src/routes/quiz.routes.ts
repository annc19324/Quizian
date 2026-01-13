import { Router } from 'express';
import { prisma } from '../utils/prisma';
import { authenticate, AuthRequest } from '../middleware/auth';
import { generateShareCode, parseQuizText } from '../utils/helpers';

const router = Router();

// Get Quizzes
router.get('/', async (req, res) => {
    const { search, my } = req.query;
    const token = req.header('Authorization')?.replace('Bearer ', '');
    let userId: number | undefined;

    if (my === 'true' && token) {
        // Decode manually just for this check if header exists
        try {
            const decoded = require('jsonwebtoken').decode(token);
            if (decoded) userId = decoded.userId;
        } catch (e) { }
    }

    const where: any = {};
    if (my === 'true' && userId) {
        where.userId = userId;
    } else {
        where.isPublic = true;
    }

    if (search) {
        where.OR = [
            { title: { contains: String(search), mode: 'insensitive' } },
            { description: { contains: String(search), mode: 'insensitive' } }
        ];
    }

    try {
        const quizzes = await prisma.quiz.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            include: { user: { select: { username: true } } }
        });

        // Map to match frontend expectations
        const mapped = quizzes.map(q => ({
            ...q,
            _id: q.id, // FE expects _id
            username: q.user.username
        }));

        res.json({ quizzes: mapped });
    } catch (error) {
        res.status(500).json({ error: 'Error fetching quizzes' });
    }
});

// Create Quiz
router.post('/', authenticate, async (req: AuthRequest, res) => {
    try {
        const { title, description, questions, pasteMode, pasteText, tags } = req.body;
        let finalQuestions = questions;

        if (pasteMode && pasteText) {
            finalQuestions = parseQuizText(pasteText);
        }

        const quiz = await prisma.quiz.create({
            data: {
                title,
                description,
                userId: req.user!.userId,
                shareCode: generateShareCode(),
                tags: tags || [],
                questions: {
                    create: finalQuestions.map((q: any) => ({
                        text: q.question,
                        answers: {
                            create: q.answers.map((a: any) => ({
                                text: a.text,
                                isCorrect: a.isCorrect
                            }))
                        }
                    }))
                }
            }
        });

        res.json({ quiz });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error creating quiz' });
    }
});

// Get Quiz by Code (Public) with questions hidden logic if needed, but for "Take Quiz" we need questions
router.get('/share/:code', async (req, res) => {
    try {
        const quiz = await prisma.quiz.findUnique({
            where: { shareCode: req.params.code },
            include: {
                questions: {
                    include: { answers: true }
                },
                user: { select: { username: true } }
            }
        });

        if (!quiz) return res.status(404).json({ error: 'Quiz not found' });

        // Transform for FE
        const transformed = {
            _id: quiz.id,
            title: quiz.title,
            description: quiz.description,
            shareCode: quiz.shareCode,
            username: quiz.user.username,
            questions: quiz.questions.map(q => ({
                question: q.text,
                answers: q.answers.map(a => ({
                    text: a.text,
                    isCorrect: a.isCorrect
                }))
            }))
        };

        res.json({ quiz: transformed });
    } catch (error) {
        res.status(500).json({ error: 'Error fetching quiz' });
    }
});

export default router;
