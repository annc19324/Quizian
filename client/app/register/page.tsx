'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import { Eye, EyeOff, UserPlus, ArrowLeft, Mail, User, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export default function RegisterPage() {
    const [username, setUsername] = useState('');
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
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
            await register(username, fullName, password, email);
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
                className="glass-card max-w-lg w-full p-8"
            >
                <Link href="/" className="inline-flex items-center text-white/70 hover:text-white mb-6 transition">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Quay lại
                </Link>

                <div className="flex items-center justify-center mb-6">
                    <div className="p-4 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 shadow-lg shadow-primary-500/30">
                        <UserPlus className="w-8 h-8 text-white" />
                    </div>
                </div>

                <h1 className="text-3xl font-bold text-white text-center mb-2">
                    Tạo Tài Khoản
                </h1>
                <p className="text-white/60 text-center mb-8">Trở thành một phần của cộng đồng Quizian</p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                    placeholder="Min 6 kí tự"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-white/80 mb-2 text-sm font-medium">
                                Email
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="input-field pl-10"
                                    placeholder="example@mail.com"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-white/80 mb-2 text-sm font-medium">
                            Họ và tên
                        </label>
                        <input
                            type="text"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className="input-field"
                            placeholder="Nhập đầy đủ tên của bạn"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                        <div>
                            <label className="block text-white/80 mb-2 text-sm font-medium">
                                Xác nhận
                            </label>
                            <div className="relative">
                                <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="input-field pl-10"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <div className="p-4 bg-white/5 rounded-xl border border-white/10 text-xs text-white/50 space-y-1">
                        <p className="font-semibold text-white/70 mb-1">Yêu cầu:</p>
                        <p>• Username: ít nhất 6 ký tự (a-z, A-Z, 0-9, .)</p>
                        <p>• Mật khẩu: ít nhất 8 ký tự, 1 hoa, 1 thường, 1 số, 1 đặc biệt</p>
                        <p>• Họ tên: 2-50 ký tự</p>
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        type="submit"
                        disabled={loading}
                        className="w-full btn-primary py-4 text-lg font-bold shadow-xl shadow-primary-500/20"
                    >
                        {loading ? 'Đang tạo tài khoản...' : 'Đăng Ký Tài Khoản'}
                    </motion.button>
                </form>

                <div className="mt-8 text-center">
                    <p className="text-white/50">
                        Đã có tài khoản?{' '}
                        <Link href="/login" className="text-white font-bold hover:text-primary-300 transition-colors">
                            Đăng nhập tại đây
                        </Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
