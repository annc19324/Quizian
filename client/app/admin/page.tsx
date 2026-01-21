
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users, BookOpen, AlertCircle, Trash2,
    CheckCircle, XCircle, LayoutDashboard,
    Search, Filter, RefreshCw
} from 'lucide-react';
import { API_URL } from '@/lib/api';
import toast from 'react-hot-toast';

export default function AdminPage() {
    const { user, token, loading: authLoading } = useAuth();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'users' | 'quizzes' | 'reports' | 'stats'>('stats');
    const [stats, setStats] = useState<any>(null);
    const [users, setUsers] = useState<any[]>([]);
    const [quizzes, setQuizzes] = useState<any[]>([]);
    const [reports, setReports] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!authLoading && (!user || user.role !== 'ADMIN')) {
            router.push('/dashboard');
        }
    }, [user, authLoading, router]);

    useEffect(() => {
        if (token && user?.role === 'ADMIN') {
            fetchData();
        }
    }, [token, user, activeTab]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const endpoint = activeTab === 'stats' ? 'stats' : activeTab;
            const res = await fetch(`${API_URL}/admin/${endpoint}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();

            if (activeTab === 'stats') setStats(data);
            else if (activeTab === 'users') setUsers(data.users);
            else if (activeTab === 'quizzes') setQuizzes(data.quizzes);
            else if (activeTab === 'reports') setReports(data.reports);
        } catch (error) {
            toast.error('Lỗi khi tải dữ liệu');
        } finally {
            setLoading(false);
        }
    };

    const deleteUser = async (id: number) => {
        if (!confirm('Bạn có chắc muốn xóa người dùng này?')) return;
        try {
            const res = await fetch(`${API_URL}/admin/users/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                toast.success('Đã xóa người dùng');
                setUsers(users.filter(u => u.id !== id));
            }
        } catch (error) {
            toast.error('Lỗi khi xóa người dùng');
        }
    };

    const deleteQuiz = async (id: number) => {
        if (!confirm('Bạn có chắc muốn xóa bài trắc nghiệm này?')) return;
        try {
            const res = await fetch(`${API_URL}/admin/quizzes/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                toast.success('Đã xóa bài trắc nghiệm');
                setQuizzes(quizzes.filter(q => q.id !== id));
            }
        } catch (error) {
            toast.error('Lỗi khi xóa bài');
        }
    };

    const dismissReport = async (id: number) => {
        try {
            const res = await fetch(`${API_URL}/admin/reports/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                toast.success('Đã bỏ qua báo cáo');
                setReports(reports.filter(r => r.id !== id));
            }
        } catch (error) {
            toast.error('Lỗi khi xử lý báo cáo');
        }
    };

    if (authLoading || !user || user.role !== 'ADMIN') return null;

    return (
        <div className="min-h-screen pt-24 pb-12 px-4 max-w-7xl mx-auto">
            <header className="mb-10">
                <h1 className="text-4xl font-bold text-white mb-2">Admin Dashboard</h1>
                <p className="text-white/50">Quản lý hệ thống Quizian</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Sidebar Navigation */}
                <div className="lg:col-span-1 space-y-2">
                    <button
                        onClick={() => setActiveTab('stats')}
                        className={`w-full flex items-center px-4 py-3 rounded-xl transition ${activeTab === 'stats' ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/20' : 'text-white/60 hover:bg-white/5'}`}
                    >
                        <LayoutDashboard className="w-5 h-5 mr-3" />
                        Tổng quan
                    </button>
                    <button
                        onClick={() => setActiveTab('users')}
                        className={`w-full flex items-center px-4 py-3 rounded-xl transition ${activeTab === 'users' ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/20' : 'text-white/60 hover:bg-white/5'}`}
                    >
                        <Users className="w-5 h-5 mr-3" />
                        Người dùng
                    </button>
                    <button
                        onClick={() => setActiveTab('quizzes')}
                        className={`w-full flex items-center px-4 py-3 rounded-xl transition ${activeTab === 'quizzes' ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/20' : 'text-white/60 hover:bg-white/5'}`}
                    >
                        <BookOpen className="w-5 h-5 mr-3" />
                        Bài trắc nghiệm
                    </button>
                    <button
                        onClick={() => setActiveTab('reports')}
                        className={`w-full flex items-center px-4 py-3 rounded-xl transition ${activeTab === 'reports' ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/20' : 'text-white/60 hover:bg-white/5'}`}
                    >
                        <AlertCircle className="w-5 h-5 mr-3" />
                        Báo cáo
                        {reports.length > 0 && activeTab !== 'reports' && (
                            <span className="ml-auto bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full ring-2 ring-background">
                                {reports.length}
                            </span>
                        )}
                    </button>

                    <div className="pt-4 border-t border-white/5 mt-4">
                        <button
                            onClick={fetchData}
                            className="w-full flex items-center px-4 py-3 text-white/40 hover:text-white transition text-sm"
                        >
                            <RefreshCw className={`w-4 h-4 mr-3 ${loading ? 'animate-spin' : ''}`} />
                            Làm mới dữ liệu
                        </button>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="lg:col-span-3">
                    <AnimatePresence mode="wait">
                        {activeTab === 'stats' && (
                            <motion.div
                                key="stats"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="grid grid-cols-1 md:grid-cols-2 gap-6"
                            >
                                <StatCard icon={<Users />} label="Tổng người dùng" value={stats?.users || 0} color="blue" />
                                <StatCard icon={<BookOpen />} label="Tổng bài Quiz" value={stats?.quizzes || 0} color="purple" />
                                <StatCard icon={<AlertCircle />} label="Báo cáo vi phạm" value={stats?.reports || 0} color="red" />
                                <StatCard icon={<CheckCircle />} label="Lượt trả lời" value={stats?.attempts || 0} color="green" />
                            </motion.div>
                        )}

                        {activeTab === 'users' && (
                            <motion.div
                                key="users"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="glass-card overflow-hidden"
                            >
                                <div className="p-6 border-b border-white/5 flex justify-between items-center">
                                    <h2 className="text-xl font-bold text-white">Quản lý người dùng</h2>
                                    <span className="text-xs text-secondary-400 font-medium px-2 py-1 bg-secondary-400/10 rounded-lg">
                                        {users.length} thành viên
                                    </span>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="bg-white/5 text-white/40 text-xs uppercase tracking-wider">
                                                <th className="px-6 py-4">Người dùng</th>
                                                <th className="px-6 py-4">Email</th>
                                                <th className="px-6 py-4">Vai trò</th>
                                                <th className="px-6 py-4 text-right">Thao tác</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5">
                                            {users.map(u => (
                                                <tr key={u.id} className="text-white/80 hover:bg-white/5 transition">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center">
                                                            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center mr-3 font-bold text-xs">
                                                                {u.username[0].toUpperCase()}
                                                            </div>
                                                            <div>
                                                                <div className="font-semibold text-white">{u.fullName}</div>
                                                                <div className="text-xs text-white/40">@{u.username}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm">{u.email || '-'}</td>
                                                    <td className="px-6 py-4">
                                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${u.role === 'ADMIN' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-primary-500/10 text-primary-400 border-primary-500/20'}`}>
                                                            {u.role}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        {u.id !== user.id && (
                                                            <button
                                                                onClick={() => deleteUser(u.id)}
                                                                className="text-red-400 hover:text-red-300 p-2 hover:bg-red-500/10 rounded-lg transition"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'quizzes' && (
                            <motion.div
                                key="quizzes"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="glass-card overflow-hidden"
                            >
                                <div className="p-6 border-b border-white/5">
                                    <h2 className="text-xl font-bold text-white">Quản lý bài Quiz</h2>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="bg-white/5 text-white/40 text-xs uppercase tracking-wider">
                                                <th className="px-6 py-4">Bài Quiz</th>
                                                <th className="px-6 py-4">Người tạo</th>
                                                <th className="px-6 py-4">Thống kê</th>
                                                <th className="px-6 py-4 text-right">Thao tác</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5">
                                            {quizzes.map(q => (
                                                <tr key={q.id} className="text-white/80 hover:bg-white/5 transition">
                                                    <td className="px-6 py-4">
                                                        <div className="font-semibold text-white">{q.title}</div>
                                                        <div className="text-xs text-white/40">{q.shareCode}</div>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm">@{q.user.username}</td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex flex-col gap-1">
                                                            <span className="text-[10px] text-white/40 flex items-center">
                                                                <CheckCircle className="w-3 h-3 mr-1" /> {q._count.attempts} lượt làm
                                                            </span>
                                                            {q._count.reports > 0 && (
                                                                <span className="text-[10px] text-red-400 flex items-center">
                                                                    <AlertCircle className="w-3 h-3 mr-1" /> {q._count.reports} báo cáo
                                                                </span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <button
                                                            onClick={() => deleteQuiz(q.id)}
                                                            className="text-red-400 hover:text-red-300 p-2 hover:bg-red-500/10 rounded-lg transition"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'reports' && (
                            <motion.div
                                key="reports"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="space-y-4"
                            >
                                {reports.length === 0 ? (
                                    <div className="glass-card p-12 text-center text-white/40">
                                        Chuẩn bị tốt quá, hông có báo cáo nào luôn!
                                    </div>
                                ) : (
                                    reports.map(r => (
                                        <div key={r.id} className="glass-card p-6 border-l-4 border-red-500">
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <span className="text-xs text-white/40 mb-1 block">{new Date(r.createdAt).toLocaleString('vi-VN')}</span>
                                                    <h3 className="text-lg font-bold text-white mb-1">
                                                        Báo cáo lỗi cho: <span className="text-primary-400">{r.quiz.title}</span>
                                                    </h3>
                                                    <p className="text-sm text-white/60">
                                                        Người báo cáo: <span className="text-white">@{r.user.username}</span> |
                                                        Người tạo quiz: <span className="text-white">@{r.quiz.user.username}</span>
                                                    </p>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => dismissReport(r.id)}
                                                        className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-white/70 hover:text-white transition"
                                                        title="Bỏ qua"
                                                    >
                                                        <CheckCircle className="w-5 h-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => deleteQuiz(r.quizId)}
                                                        className="p-2 bg-red-500/10 hover:bg-red-500/20 rounded-lg text-red-400 hover:text-red-300 transition"
                                                        title="Xóa Quiz vi phạm"
                                                    >
                                                        <Trash2 className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="bg-white/5 p-4 rounded-xl border border-white/5 italic text-white/80">
                                                "{r.reason}"
                                            </div>
                                        </div>
                                    ))
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}

function StatCard({ icon, label, value, color }: any) {
    const colors: any = {
        blue: 'from-blue-500/20 to-blue-600/20 text-blue-400 border-blue-500/30',
        purple: 'from-purple-500/20 to-purple-600/20 text-purple-400 border-purple-500/30',
        red: 'from-red-500/20 to-red-600/20 text-red-400 border-red-500/30',
        green: 'from-emerald-500/20 to-emerald-600/20 text-emerald-400 border-emerald-500/30',
    };

    return (
        <div className={`glass-card p-6 border-b-4 bg-gradient-to-br ${colors[color]}`}>
            <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white/10 rounded-xl">
                    {icon}
                </div>
            </div>
            <div className="text-3xl font-bold mb-1">{value}</div>
            <div className="text-sm font-medium opacity-60 uppercase tracking-wider">{label}</div>
        </div>
    );
}
