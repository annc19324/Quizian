
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import { User, Mail, ShieldCheck, Save, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function ProfilePage() {
    const { user, updateProfile, loading: authLoading } = useAuth();
    const [username, setUsername] = useState('');
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) {
            setUsername(user.username);
            setFullName(user.fullName);
            setEmail(user.email || '');
        }
    }, [user]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const updateData: any = {};
            if (username !== user?.username) updateData.username = username;
            if (fullName !== user?.fullName) updateData.fullName = fullName;
            if (email !== user?.email) updateData.email = email;
            if (password) updateData.password = password;

            if (Object.keys(updateData).length === 0) {
                toast.error('Không có thông tin nào thay đổi');
                setLoading(false);
                return;
            }

            await updateProfile(updateData);
            setPassword(''); // Clear password field after success
        } catch (error) {
            // Error already toasted in context
        } finally {
            setLoading(false);
        }
    };

    if (authLoading) return null;

    return (
        <div className="min-h-screen p-4 pt-24 md:pt-32 max-w-2xl mx-auto">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card p-8"
            >
                <div className="flex items-center justify-between mb-8">
                    <Link href="/dashboard" className="inline-flex items-center text-white/70 hover:text-white transition">
                        <ArrowLeft className="w-5 h-5 mr-2" />
                        Quay lại Dashboard
                    </Link>
                    <div className="px-3 py-1 rounded-full bg-primary-500/20 text-primary-300 text-xs font-bold uppercase tracking-wider border border-primary-500/30">
                        {user?.role}
                    </div>
                </div>

                <div className="flex items-center mb-10">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center mr-6 shadow-lg shadow-primary-500/20">
                        <User className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-1">Cài đặt tài khoản</h1>
                        <p className="text-white/50">Cập nhật thông tin cá nhân và mật khẩu</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-white/80 mb-2 text-sm font-medium">Tên đăng nhập</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="input-field pl-10"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-white/80 mb-2 text-sm font-medium">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="input-field pl-10"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-white/80 mb-2 text-sm font-medium">Họ và tên</label>
                        <input
                            type="text"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className="input-field"
                            required
                        />
                    </div>

                    <div className="pt-6 border-t border-white/10">
                        <label className="block text-white/80 mb-2 text-sm font-medium">Đổi mật khẩu (để trống nếu không đổi)</label>
                        <div className="relative">
                            <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="input-field pl-10 pr-10"
                                placeholder="Nhập mật khẩu mới"
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

                    <div className="p-4 bg-white/5 rounded-xl border border-white/10 text-xs text-white/50 space-y-1">
                        <p className="font-semibold text-white/70 mb-1">Yêu cầu thay đổi:</p>
                        <p>• Username: ít nhất 6 ký tự (a-z, A-Z, 0-9, .)</p>
                        <p>• Mật khẩu mới: ít nhất 8 ký tự, 1 hoa, 1 thường, 1 số, 1 đặc biệt</p>
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        type="submit"
                        disabled={loading}
                        className="w-full btn-primary py-4 text-lg font-bold flex items-center justify-center shadow-xl shadow-primary-500/20"
                    >
                        <Save className="w-5 h-5 mr-3" />
                        {loading ? 'Đang lưu...' : 'Lưu Thay Đổi'}
                    </motion.button>
                </form>
            </motion.div>
        </div>
    );
}
