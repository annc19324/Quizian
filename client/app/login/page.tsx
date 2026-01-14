'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import { LogIn, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await login(username, password);
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
                className="card max-w-md w-full relative"
            >
                <div className="flex justify-between items-start mb-6">
                    <Link href="/" className="inline-flex items-center text-white/70 hover:text-white transition">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Quay lại
                    </Link>
                </div>

                <div className="flex items-center justify-center mb-8">
                    <div className="p-4 rounded-full bg-gradient-to-br from-primary-400 to-primary-600">
                        <LogIn className="w-8 h-8 text-white" />
                    </div>
                </div>

                <h1 className="text-3xl font-bold text-white text-center mb-8">
                    Đăng Nhập
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
                            Mật khẩu
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="input-field"
                            placeholder="Nhập mật khẩu"
                            required
                        />
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        disabled={loading}
                        className="w-full btn-primary"
                    >
                        {loading ? 'Đang đăng nhập...' : 'Đăng Nhập'}
                    </motion.button>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-white/70">
                        Chưa có tài khoản?{' '}
                        <Link href="/register" className="text-white font-semibold hover:text-primary-300 transition">
                            Đăng ký ngay
                        </Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
