
import { Router } from 'express';
import { prisma } from '../utils/prisma';
import { authenticate, AuthRequest, isAdmin } from '../middleware/auth';

const router = Router();

// Dashboard Stats
router.get('/stats', authenticate, isAdmin, async (req, res) => {
    try {
        const userCount = await prisma.user.count();
        const quizCount = await prisma.quiz.count();
        const attemptCount = await prisma.attempt.count();
        const reportCount = await prisma.report.count();

        res.json({
            users: userCount,
            quizzes: quizCount,
            attempts: attemptCount,
            reports: reportCount
        });
    } catch (error) {
        res.status(500).json({ error: 'Error fetching stats' });
    }
});

// Manage Users
router.get('/users', authenticate, isAdmin, async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                username: true,
                fullName: true,
                email: true,
                role: true,
                createdAt: true,
                _count: {
                    select: { quizzes: true, attempts: true }
                }
            }
        });
        res.json({ users });
    } catch (error) {
        res.status(500).json({ error: 'Error fetching users' });
    }
});

router.delete('/users/:id', authenticate, isAdmin, async (req, res) => {
    try {
        const id = Number(req.params.id);
        if (id === req.user!.userId) {
            return res.status(400).json({ error: 'Cannot delete yourself' });
        }
        await prisma.user.delete({ where: { id } });
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Error deleting user' });
    }
});

// Manage Quizzes
router.get('/quizzes', authenticate, isAdmin, async (req, res) => {
    try {
        const quizzes = await prisma.quiz.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                user: { select: { username: true } },
                _count: { select: { reports: true, attempts: true } }
            }
        });
        res.json({ quizzes });
    } catch (error) {
        res.status(500).json({ error: 'Error fetching quizzes' });
    }
});

router.delete('/quizzes/:id', authenticate, isAdmin, async (req, res) => {
    try {
        const id = Number(req.params.id);
        await prisma.quiz.delete({ where: { id } });
        res.json({ message: 'Quiz deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Error deleting quiz' });
    }
});

// Manage Reports
router.get('/reports', authenticate, isAdmin, async (req, res) => {
    try {
        const reports = await prisma.report.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                user: { select: { username: true } },
                quiz: {
                    include: {
                        user: { select: { username: true } }
                    }
                }
            }
        });
        res.json({ reports });
    } catch (error) {
        res.status(500).json({ error: 'Error fetching reports' });
    }
});

router.delete('/reports/:id', authenticate, isAdmin, async (req, res) => {
    try {
        const id = Number(req.params.id);
        await prisma.report.delete({ where: { id } });
        res.json({ message: 'Report dismissed' });
    } catch (error) {
        res.status(500).json({ error: 'Error deleting report' });
    }
});

export default router;
