'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import { UserPlus, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function RegisterPage() {
    const [username, setUsername] = useState('');
    const [fullName, setFullName] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            alert('Mật khẩu xác nhận không khớp!');
            return;
        }

        setLoading(true);
        try {
            await register(username, fullName, password);
        } catch (error) {
            // Error handled in context
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 pt-32 md:pt-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card max-w-md w-full"
            >
                <Link href="/" className="inline-flex items-center text-white/70 hover:text-white mb-6 transition">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Quay lại
                </Link>

                <div className="flex items-center justify-center mb-8">
                    <div className="p-4 rounded-full bg-gradient-to-br from-primary-400 to-primary-600">
                        <UserPlus className="w-8 h-8 text-white" />
                    </div>
                </div>

                <h1 className="text-3xl font-bold text-white text-center mb-8">
                    Đăng Ký
                </h1>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-white/80 mb-2 font-medium">
                            Tên đăng nhập
                        </label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="input-field"
                            placeholder="Nhập tên đăng nhập"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-white/80 mb-2 font-medium">
                            Họ và tên
                        </label>
                        <input
                            type="text"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className="input-field"
                            placeholder="Nhập họ và tên"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-white/80 mb-2 font-medium">
                            Mật khẩu
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="input-field"
                            placeholder="Nhập mật khẩu"
                            required
                            minLength={6}
                        />
                    </div>

                    <div>
                        <label className="block text-white/80 mb-2 font-medium">
                            Xác nhận mật khẩu
                        </label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="input-field"
                            placeholder="Nhập lại mật khẩu"
                            required
                            minLength={6}
                        />
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        disabled={loading}
                        className="w-full btn-primary"
                    >
                        {loading ? 'Đang đăng ký...' : 'Đăng Ký'}
                    </motion.button>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-white/70">
                        Đã có tài khoản?{' '}
                        <Link href="/login" className="text-white font-semibold hover:text-primary-300 transition">
                            Đăng nhập ngay
                        </Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
