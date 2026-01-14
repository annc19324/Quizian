'use client';

import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { motion } from 'framer-motion';
import { Plus, Search, BookOpen, History, LogOut, Share2, Edit3, Trash2, FileDown, FileText, Smartphone } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { API_URL } from '@/lib/api';
import { exportToPDF, exportToWord } from '@/lib/export';

interface Quiz {
    _id: string;
    title: string;
    description: string;
    shareCode: string;
    createdAt: string;
    username: string;
}

export default function DashboardPage() {
    return (
        <ProtectedRoute>
            <DashboardContent />
        </ProtectedRoute>
    );
}

function DashboardContent() {
    const { user, logout, token } = useAuth();
    const [myQuizzes, setMyQuizzes] = useState<Quiz[]>([]);
    const [publicQuizzes, setPublicQuizzes] = useState<Quiz[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'my' | 'explore'>('my');

    useEffect(() => {
        fetchQuizzes();
    }, [activeTab]);

    const fetchQuizzes = async () => {
        try {
            setLoading(true);

            if (activeTab === 'my') {
                const res = await fetch(`${API_URL}/quizzes?my=true`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const data = await res.json();
                setMyQuizzes(data.quizzes || []);
            } else {
                const res = await fetch(`${API_URL}/quizzes`);
                const data = await res.json();
                setPublicQuizzes(data.quizzes || []);
            }
        } catch (error) {
            toast.error('Không thể tải danh sách bài trắc nghiệm');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async () => {
        if (!searchQuery.trim()) {
            fetchQuizzes();
            return;
        }

        try {
            setLoading(true);
            const res = await fetch(`${API_URL}/quizzes?search=${encodeURIComponent(searchQuery)}`);
            const data = await res.json();
            setPublicQuizzes(data.quizzes || []);
        } catch (error) {
            toast.error('Không thể tìm kiếm');
        } finally {
            setLoading(false);
        }
    };

    const copyShareLink = (code: string) => {
        const link = `${window.location.origin}/quiz?code=${code}`;
        navigator.clipboard.writeText(link);
        toast.success('Đã copy link chia sẻ!');
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Bạn có chắc chắn muốn xóa bài trắc nghiệm này? Hành động này không thể hoàn tác.')) return;

        try {
            const res = await fetch(`${API_URL}/quizzes/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.ok) {
                toast.success('Đã xóa thành công');
                setMyQuizzes(prev => prev.filter(q => q._id !== id));
            } else {
                toast.error('Có lỗi xảy ra khi xóa');
            }
        } catch (error) {
            toast.error('Không thể xóa bài viết');
        }
    };

    const handleDownload = async (quiz: Quiz, format: 'pdf' | 'word', withAnswers: boolean = false) => {
        const toastId = toast.loading(`Đang chuẩn bị file ${format.toUpperCase()}...`);
        try {
            // If it's my quiz, we use the ID-based route, otherwise we use share code
            const url = activeTab === 'my'
                ? `${API_URL}/quizzes/${quiz._id}`
                : `${API_URL}/quizzes/share/${quiz.shareCode}`;

            const headers: any = {};
            if (activeTab === 'my') {
                headers.Authorization = `Bearer ${token}`;
            }

            const res = await fetch(url, { headers });
            const data = await res.json();

            if (res.ok) {
                if (format === 'pdf') {
                    exportToPDF(data.quiz, withAnswers);
                } else {
                    await exportToWord(data.quiz, withAnswers);
                }
                toast.success('Đã tải xuống!', { id: toastId });
            } else {
                toast.error('Lỗi khi lấy dữ liệu bài trắc nghiệm', { id: toastId });
            }
        } catch (error) {
            toast.error('Không thể tải file', { id: toastId });
        }
    };

    const currentQuizzes = activeTab === 'my' ? myQuizzes : publicQuizzes;

    return (
        <div className="min-h-screen p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass rounded-2xl p-4 md:p-6 mb-8"
                >
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
                                Xin chào, {user?.fullName}!
                            </h1>
                            <p className="text-white/70">@{user?.username}</p>
                        </div>
                        <div className="grid grid-cols-2 md:flex gap-3">
                            <Link href="/quiz/create" className="col-span-2 md:col-span-1">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="btn-primary flex items-center justify-center gap-2 w-full md:w-auto"
                                >
                                    <Plus className="w-5 h-5" />
                                    Tạo bài mới
                                </motion.button>
                            </Link>
                            <Link href="/history">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="btn-secondary flex items-center justify-center gap-2 w-full md:w-auto"
                                >
                                    <History className="w-5 h-5" />
                                    Lịch sử
                                </motion.button>
                            </Link>
                            <a href="/quizian-app.apk" download className="w-full md:w-auto">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="btn-secondary flex items-center justify-center gap-2 w-full md:w-auto bg-success-500/10 text-success-500 border-success-500/20 hover:bg-success-500/20 hover:border-success-500/30"
                                >
                                    <Smartphone className="w-5 h-5" />
                                    Tải APK
                                </motion.button>
                            </a>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={logout}
                                className="btn-secondary flex items-center justify-center gap-2 w-full md:w-auto"
                            >
                                <LogOut className="w-5 h-5" />
                                Đăng xuất
                            </motion.button>
                        </div>
                    </div>
                </motion.div>

                {/* Tabs */}
                <div className="flex gap-4 mb-6">
                    <button
                        onClick={() => setActiveTab('my')}
                        className={`px-6 py-3 rounded-lg font-semibold transition-all ${activeTab === 'my'
                            ? 'bg-white text-primary-600'
                            : 'glass text-white hover:bg-white/20'
                            }`}
                    >
                        <BookOpen className="w-5 h-5 inline mr-2" />
                        Bài của tôi
                    </button>
                    <button
                        onClick={() => setActiveTab('explore')}
                        className={`px-6 py-3 rounded-lg font-semibold transition-all ${activeTab === 'explore'
                            ? 'bg-white text-primary-600'
                            : 'glass text-white hover:bg-white/20'
                            }`}
                    >
                        <Search className="w-5 h-5 inline mr-2" />
                        Khám phá
                    </button>
                </div>

                {/* Search */}
                {activeTab === 'explore' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="glass rounded-xl p-4 mb-6"
                    >
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                placeholder="Tìm kiếm bài trắc nghiệm..."
                                className="flex-1 input-field"
                            />
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleSearch}
                                className="btn-primary"
                            >
                                <Search className="w-5 h-5" />
                            </motion.button>
                        </div>
                    </motion.div>
                )}

                {/* Quizzes Grid */}
                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
                    </div>
                ) : currentQuizzes.length === 0 ? (
                    <div className="glass rounded-2xl p-12 text-center">
                        <BookOpen className="w-16 h-16 text-white/50 mx-auto mb-4" />
                        <p className="text-xl text-white/70">
                            {activeTab === 'my'
                                ? 'Bạn chưa có bài trắc nghiệm nào'
                                : 'Không tìm thấy bài trắc nghiệm nào'}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {currentQuizzes.map((quiz, index) => (
                            <motion.div
                                key={quiz._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                whileHover={{ scale: 1.02, y: -5 }}
                                className="card cursor-pointer"
                            >
                                <Link href={`/quiz?code=${quiz.shareCode}`}>
                                    <h3 className="text-xl font-bold text-white mb-2 line-clamp-2">
                                        {quiz.title}
                                    </h3>
                                    <p className="text-white/70 text-sm mb-4 line-clamp-2">
                                        {quiz.description || 'Không có mô tả'}
                                    </p>
                                    <div className="flex items-center justify-between">
                                        <span className="text-white/60 text-sm">
                                            @{quiz.username}
                                        </span>
                                        <span className="text-white/60 text-sm">
                                            {new Date(quiz.createdAt).toLocaleDateString('vi-VN')}
                                        </span>
                                    </div>
                                </Link>
                                <div className="mt-4 pt-4 border-t border-white/20 flex flex-wrap gap-2">
                                    <button
                                        onClick={(e) => {
                                            e.preventDefault();
                                            copyShareLink(quiz.shareCode);
                                        }}
                                        className="btn-secondary p-2 flex items-center justify-center transition"
                                        title="Chia sẻ"
                                    >
                                        <Share2 className="w-4 h-4" />
                                    </button>

                                    <button
                                        onClick={(e) => {
                                            e.preventDefault();
                                            handleDownload(quiz, 'pdf', false);
                                        }}
                                        className="btn-secondary p-2 flex items-center justify-center text-red-400 hover:text-red-300 transition"
                                        title="Tải PDF (Đề)"
                                    >
                                        <FileDown className="w-4 h-4" />
                                    </button>

                                    <button
                                        onClick={(e) => {
                                            e.preventDefault();
                                            handleDownload(quiz, 'pdf', true);
                                        }}
                                        className="btn-secondary p-2 flex items-center justify-center text-success-400 hover:text-success-300 transition relative"
                                        title="Tải PDF (+Đáp án)"
                                    >
                                        <FileDown className="w-4 h-4" />
                                        <span className="text-[10px] font-bold absolute -bottom-1 -right-1 bg-success-500 text-white rounded-full w-4 h-4 flex items-center justify-center border border-white/20">@</span>
                                    </button>

                                    <button
                                        onClick={(e) => {
                                            e.preventDefault();
                                            handleDownload(quiz, 'word', false);
                                        }}
                                        className="btn-secondary p-2 flex items-center justify-center text-blue-400 hover:text-blue-300 transition"
                                        title="Tải Word (Đề)"
                                    >
                                        <FileText className="w-4 h-4" />
                                    </button>

                                    <button
                                        onClick={(e) => {
                                            e.preventDefault();
                                            handleDownload(quiz, 'word', true);
                                        }}
                                        className="btn-secondary p-2 flex items-center justify-center text-primary-400 hover:text-primary-300 transition relative"
                                        title="Tải Word (+Đáp án)"
                                    >
                                        <FileText className="w-4 h-4" />
                                        <span className="text-[10px] font-bold absolute -bottom-1 -right-1 bg-primary-500 text-white rounded-full w-4 h-4 flex items-center justify-center border border-white/20">@</span>
                                    </button>

                                    {activeTab === 'my' && (
                                        <>
                                            <Link
                                                href={`/quiz/edit/${quiz._id}`}
                                                className="btn-secondary px-3 py-2 flex items-center justify-center text-blue-400 hover:text-blue-300 transition"
                                                title="Sửa"
                                            >
                                                <Edit3 className="w-4 h-4" />
                                            </Link>
                                            <button
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    handleDelete(quiz._id);
                                                }}
                                                className="btn-secondary px-3 py-2 flex items-center justify-center text-error-400 hover:text-error-300 transition"
                                                title="Xóa"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
