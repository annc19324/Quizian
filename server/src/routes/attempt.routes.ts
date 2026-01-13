import { Router } from 'express';
import { prisma } from '../utils/prisma';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

// Get Attempts
router.get('/', authenticate, async (req: AuthRequest, res) => {
    try {
        const attempts = await prisma.attempt.findMany({
            where: { userId: req.user!.userId },
            orderBy: { completedAt: 'desc' },
            take: 50,
            include: {
                quiz: { select: { title: true } }
            }
        });

        const transformed = attempts.map(a => ({
            ...a,
            _id: a.id,
            quizTitle: a.quiz.title
        }));

        res.json({ attempts: transformed });
    } catch (error) {
        res.status(500).json({ error: 'Error fetching attempts' });
    }
});

// Create Attempt
router.post('/', authenticate, async (req: AuthRequest, res) => {
    try {
        const { quizId, score, totalQuestions, questionResults, shuffleQuestions, shuffleAnswers } = req.body;

        // We need quiz title for history display, Prisma relation handles fetching, but let's store snapshot if needed or assume relation relies on live data.
        // The previous schema stored "quizTitle" string. Let's look up the quiz first.
        const quiz = await prisma.quiz.findUnique({ where: { id: Number(quizId) } });
        if (!quiz) return res.status(404).json({ error: 'Quiz not found' });

        const attempt = await prisma.attempt.create({
            data: {
                userId: req.user!.userId,
                quizId: Number(quizId),
                quizTitle: quiz.title,
                score,
                totalQuestions,
                questionResults, // JSON
                shuffleQuestions,
                shuffleAnswers
            }
        });

        res.json({ attempt });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error saving attempt' });
    }
});

export default router;
