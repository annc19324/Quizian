'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import { LogIn, ArrowLeft, Eye, EyeOff, User, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
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
                className="glass-card max-w-md w-full p-8"
            >
                <div className="flex justify-between items-start mb-6">
                    <Link href="/" className="inline-flex items-center text-white/70 hover:text-white transition">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Quay lại
                    </Link>
                </div>

                <div className="flex items-center justify-center mb-6">
                    <div className="p-4 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 shadow-lg shadow-primary-500/30">
                        <LogIn className="w-8 h-8 text-white" />
                    </div>
                </div>

                <h1 className="text-3xl font-bold text-white text-center mb-2">
                    Chào Mừng Trở Lại
                </h1>
                <p className="text-white/60 text-center mb-8">Đăng nhập để tiếp tục học tập</p>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-white/80 mb-2 text-sm font-medium">
                            Tên đăng nhập
                        </label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="input-field pl-10"
                                placeholder="Nhập tên đăng nhập"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-white/80 mb-2 text-sm font-medium">
                            Mật khẩu
                        </label>
                        <div className="relative">
                            <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="input-field pl-10 pr-10"
                                placeholder="••••••••"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
                            >
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        type="submit"
                        disabled={loading}
                        className="w-full btn-primary py-4 text-lg font-bold shadow-xl shadow-primary-500/20"
                    >
                        {loading ? 'Đang đăng nhập...' : 'Đăng Nhập'}
                    </motion.button>
                </form>

                <div className="mt-8 text-center border-t border-white/10 pt-6">
                    <p className="text-white/50">
                        Chưa có tài khoản?{' '}
                        <Link href="/register" className="text-white font-bold hover:text-primary-300 transition-colors">
                            Đăng ký ngay
                        </Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
