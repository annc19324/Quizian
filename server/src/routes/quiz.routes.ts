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

        if (!finalQuestions || finalQuestions.length === 0) {
            return res.status(400).json({ error: 'Bài trắc nghiệm phải có ít nhất 1 câu hỏi hợp lệ.' });
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
                        image: q.image, // Add image field
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
                    orderBy: { id: 'asc' },
                    include: {
                        answers: { orderBy: { id: 'asc' } }
                    }
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
                image: q.image,
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

// Get Quiz by ID (Private - for editing)
router.get('/:id', authenticate, async (req: AuthRequest, res) => {
    try {
        const quiz = await prisma.quiz.findUnique({
            where: { id: Number(req.params.id) },
            include: {
                questions: {
                    orderBy: { id: 'asc' },
                    include: {
                        answers: { orderBy: { id: 'asc' } }
                    }
                }
            }
        });

        if (!quiz) return res.status(404).json({ error: 'Quiz not found' });
        if (quiz.userId !== req.user!.userId) return res.status(403).json({ error: 'Unauthorized' });

        // Transform for FE (similar to share route but simpler structure match)
        // Actually the FE expects specific shape. Let's return raw or transformed?
        // The Create page uses clean state. Let's return mapped nicely.
        const mapped = {
            ...quiz,
            questions: quiz.questions.map((q) => ({
                question: q.text,
                image: q.image,
                answers: q.answers.map((a) => ({
                    text: a.text,
                    isCorrect: a.isCorrect
                }))
            }))
        };

        res.json({ quiz: mapped });
    } catch (error) {
        res.status(500).json({ error: 'Error fetching quiz' });
    }
});

// Update Quiz
router.put('/:id', authenticate, async (req: AuthRequest, res) => {
    try {
        const { title, description, questions, tags } = req.body;
        const quizId = Number(req.params.id);

        const quiz = await prisma.quiz.findUnique({ where: { id: quizId } });
        if (!quiz) return res.status(404).json({ error: 'Quiz not found' });
        if (quiz.userId !== req.user!.userId) return res.status(403).json({ error: 'Unauthorized' });

        if (!questions || questions.length === 0) {
            return res.status(400).json({ error: 'Quiz must have at least 1 question' });
        }

        // Use transaction to delete old questions and create new ones
        await prisma.$transaction([
            prisma.question.deleteMany({ where: { quizId } }),
            prisma.quiz.update({
                where: { id: quizId },
                data: {
                    title,
                    description,
                    tags: tags || [],
                    questions: {
                        create: questions.map((q: any) => ({
                            text: q.question,
                            image: q.image, // Add image
                            answers: {
                                create: q.answers.map((a: any) => ({
                                    text: a.text,
                                    isCorrect: a.isCorrect
                                }))
                            }
                        }))
                    }
                }
            })
        ]);

        res.json({ message: 'Quiz updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error updating quiz' });
    }
});

// Delete Quiz
router.delete('/:id', authenticate, async (req: AuthRequest, res) => {
    try {
        const quizId = Number(req.params.id);
        const quiz = await prisma.quiz.findUnique({ where: { id: quizId } });

        if (!quiz) return res.status(404).json({ error: 'Quiz not found' });
        if (quiz.userId !== req.user!.userId) return res.status(403).json({ error: 'Unauthorized' });

        // Delete attempts first (since no cascade on attempts)
        await prisma.attempt.deleteMany({ where: { quizId } });
        // Delete quiz (cascades to questions/answers)
        await prisma.quiz.delete({ where: { id: quizId } });

        res.json({ message: 'Quiz deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error deleting quiz' });
    }
});

export default router;
