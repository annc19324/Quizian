'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { LogIn, ArrowLeft, Settings, X, Save } from 'lucide-react';
import Link from 'next/link';
import { API_URL, updateApiUrl } from '@/lib/api';
import toast from 'react-hot-toast';

export default function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [tempApiUrl, setTempApiUrl] = useState(API_URL);
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

    const handleSaveSettings = () => {
        if (!tempApiUrl.trim()) {
            toast.error('Vui lòng nhập URL hợp lệ');
            return;
        }
        updateApiUrl(tempApiUrl.trim());
        setShowSettings(false);
        toast.success('Đã cập nhật URL máy chủ');
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 pt-16 md:pt-4">
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
                    <button
                        onClick={() => setShowSettings(true)}
                        className="p-2 rounded-lg bg-white/5 text-white/50 hover:text-white hover:bg-white/10 transition"
                        title="Cấu hình máy chủ"
                    >
                        <Settings className="w-5 h-5" />
                    </button>
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

                <p className="mt-4 text-[10px] text-center text-white/30 truncate">
                    Server: {API_URL}
                </p>
            </motion.div>

            {/* Settings Modal */}
            <AnimatePresence>
                {showSettings && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="glass max-w-sm w-full p-6 rounded-2xl border border-white/20"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold text-white">Cấu hình máy chủ</h2>
                                <button onClick={() => setShowSettings(false)} className="text-white/50 hover:text-white">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-white/80 mb-2 text-sm">
                                        API URL (Ví dụ: https://your-server.com/api)
                                    </label>
                                    <input
                                        type="text"
                                        value={tempApiUrl}
                                        onChange={(e) => setTempApiUrl(e.target.value)}
                                        className="input-field text-sm"
                                        placeholder="http://192.168.1.x:5000/api"
                                    />
                                    <p className="mt-2 text-xs text-white/50">
                                        * Bản mobile không dùng được localhost. Bạn hãy nhập IP máy tính hoặc link server online.
                                    </p>
                                </div>

                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={handleSaveSettings}
                                    className="w-full btn-primary py-3 flex items-center justify-center gap-2"
                                >
                                    <Save className="w-4 h-4" />
                                    Lưu và Khởi động lại
                                </motion.button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
