import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../utils/prisma';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

router.post('/register', async (req, res) => {
    try {
        const { username, fullName, password } = req.body;

        const existingUser = await prisma.user.findUnique({ where: { username } });
        if (existingUser) {
            return res.status(400).json({ error: 'Username already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: {
                username: username.toLowerCase(),
                fullName,
                password: hashedPassword,
            },
        });

        const token = jwt.sign({ userId: user.id, username: user.username }, process.env.JWT_SECRET || 'secret');
        res.json({ user: { id: user.id, username: user.username, fullName: user.fullName }, token });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ error: 'Error creating user' });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await prisma.user.findUnique({ where: { username: username.toLowerCase() } });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign({ userId: user.id, username: user.username }, process.env.JWT_SECRET || 'secret');
        res.json({ user: { id: user.id, username: user.username, fullName: user.fullName }, token });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Error logging in' });
    }
});

router.get('/me', authenticate, async (req: AuthRequest, res) => {
    try {
        const user = await prisma.user.findUnique({ where: { id: req.user?.userId } });
        if (!user) return res.status(404).json({ error: 'User not found' });

        res.json({ user: { id: user.id, username: user.username, fullName: user.fullName } });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

export default router;
