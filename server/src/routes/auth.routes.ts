import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../utils/prisma';
import { authenticate, AuthRequest } from '../middleware/auth';
import { validateUsername, validateFullName, validatePassword, validateEmail } from '../utils/validation';

const router = Router();

router.post('/register', async (req, res) => {
    try {
        const { username, fullName, password, email } = req.body;

        if (!validateUsername(username)) {
            return res.status(400).json({ error: 'Tên đăng nhập phải có ít nhất 6 ký tự, chỉ chứa chữ cái, số và dấu chấm' });
        }
        if (!validateFullName(fullName)) {
            return res.status(400).json({ error: 'Họ tên phải từ 2-50 ký tự' });
        }
        if (!validatePassword(password)) {
            return res.status(400).json({ error: 'Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt' });
        }
        if (email && !validateEmail(email)) {
            return res.status(400).json({ error: 'Email không hợp lệ' });
        }

        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [
                    { username: username.toLowerCase() },
                    { email: email?.toLowerCase() }
                ]
            }
        });

        if (existingUser) {
            return res.status(400).json({ error: 'Tên đăng nhập hoặc Email đã tồn tại' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: {
                username: username.toLowerCase(),
                email: email?.toLowerCase(),
                fullName,
                password: hashedPassword,
                role: 'USER' // Default role
            },
        });

        const token = jwt.sign({ userId: user.id, username: user.username, role: user.role }, process.env.JWT_SECRET || 'secret');
        res.json({ user: { id: user.id, username: user.username, fullName: user.fullName, email: user.email, role: user.role }, token });
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
            return res.status(401).json({ error: 'Tên đăng nhập hoặc mật khẩu không đúng' });
        }

        const token = jwt.sign({ userId: user.id, username: user.username, role: user.role }, process.env.JWT_SECRET || 'secret');
        res.json({ user: { id: user.id, username: user.username, fullName: user.fullName, email: user.email, role: user.role }, token });
    } catch (error: any) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Lỗi đăng nhập', details: error.message });
    }
});

router.get('/me', authenticate, async (req: AuthRequest, res) => {
    try {
        const user = await prisma.user.findUnique({ where: { id: req.user?.userId } });
        if (!user) return res.status(404).json({ error: 'User not found' });

        res.json({ user: { id: user.id, username: user.username, fullName: user.fullName, email: user.email, role: user.role } });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

router.put('/profile', authenticate, async (req: AuthRequest, res) => {
    try {
        const { username, fullName, password, email } = req.body;
        const userId = req.user!.userId;

        const data: any = {};

        if (username) {
            if (!validateUsername(username)) {
                return res.status(400).json({ error: 'Username must be at least 6 characters and contain only a-z, A-Z, 0-9, and dot (.)' });
            }
            const existing = await prisma.user.findFirst({
                where: { username: username.toLowerCase(), id: { not: userId } }
            });
            if (existing) return res.status(400).json({ error: 'Username already taken' });
            data.username = username.toLowerCase();
        }

        if (fullName) {
            if (!validateFullName(fullName)) {
                return res.status(400).json({ error: 'Full name invalid' });
            }
            data.fullName = fullName;
        }

        if (email) {
            if (!validateEmail(email)) {
                return res.status(400).json({ error: 'Invalid email format' });
            }
            const existing = await prisma.user.findFirst({
                where: { email: email.toLowerCase(), id: { not: userId } }
            });
            if (existing) return res.status(400).json({ error: 'Email already taken' });
            data.email = email.toLowerCase();
        }

        if (password) {
            if (!validatePassword(password)) {
                return res.status(400).json({ error: 'Password does not meet requirements' });
            }
            data.password = await bcrypt.hash(password, 10);
        }

        if (Object.keys(data).length === 0) {
            return res.status(400).json({ error: 'No data to update' });
        }

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data
        });

        res.json({ user: { id: updatedUser.id, username: updatedUser.username, fullName: updatedUser.fullName, email: updatedUser.email, role: updatedUser.role } });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ error: 'Error updating profile' });
    }
});

export default router;
