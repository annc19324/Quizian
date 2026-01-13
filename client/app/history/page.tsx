'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, Award, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface Attempt {
    _id: string;
    quizId: string;
    quizTitle: string;
    score: number;
    totalQuestions: number;
    completedAt: string;
    shuffleQuestions: boolean;
    shuffleAnswers: boolean;
}

export default function HistoryPage() {
    return (
        <ProtectedRoute>
            <HistoryContent />
        </ProtectedRoute>
    );
}

function HistoryContent() {
    const { token, user } = useAuth();
    const [attempts, setAttempts] = useState<Attempt[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAttempts();
    }, []);

    const fetchAttempts = async () => {
        try {
            const res = await fetch('/api/attempts', {
                headers: { Authorization: `Bearer ${token}` },
            });

            const data = await res.json();

            if (res.ok) {
                setAttempts(data.attempts || []);
            } else {
                throw new Error(data.error);
            }
        } catch (error: any) {
            toast.error(error.message || 'Không thể tải lịch sử');
        } finally {
            setLoading(false);
        }
    };

    const getPercentage = (score: number, total: number) => {
        return Math.round((score / total) * 100);
    };

    const getGradeColor = (percentage: number) => {
        if (percentage >= 80) return 'text-success-500';
        if (percentage >= 50) return 'text-yellow-400';
        return 'text-error-500';
    };

    const totalAttempts = attempts.length;
    const averageScore =
        attempts.length > 0
            ? attempts.reduce((acc, a) => acc + getPercentage(a.score, a.totalQuestions), 0) /
            attempts.length
            : 0;

    return (
        <div className="min-h-screen p-4 md:p-8">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass rounded-2xl p-6 mb-8"
                >
                    <Link
                        href="/dashboard"
                        className="inline-flex items-center text-white/70 hover:text-white mb-6 transition"
                    >
                        <ArrowLeft className="w-5 h-5 mr-2" />
                        Quay lại
                    </Link>

                    <h1 className="text-3xl font-bold text-white mb-6">
                        Lịch Sử Làm Bài
                    </h1>

                    {/* Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white/5 rounded-xl p-4">
                            <div className="flex items-center gap-3 mb-2">
                                <Calendar className="w-6 h-6 text-primary-400" />
                                <span className="text-white/70">Tổng số lần làm</span>
                            </div>
                            <div className="text-3xl font-bold text-white">
                                {totalAttempts}
                            </div>
                        </div>

                        <div className="bg-white/5 rounded-xl p-4">
                            <div className="flex items-center gap-3 mb-2">
                                <Award className="w-6 h-6 text-primary-400" />
                                <span className="text-white/70">Điểm trung bình</span>
                            </div>
                            <div className="text-3xl font-bold text-white">
                                {averageScore.toFixed(1)}%
                            </div>
                        </div>

                        <div className="bg-white/5 rounded-xl p-4">
                            <div className="flex items-center gap-3 mb-2">
                                <TrendingUp className="w-6 h-6 text-primary-400" />
                                <span className="text-white/70">Bài đã làm</span>
                            </div>
                            <div className="text-3xl font-bold text-white">
                                {new Set(attempts.map((a) => a.quizId)).size}
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Attempts List */}
                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
                    </div>
                ) : attempts.length === 0 ? (
                    <div className="glass rounded-2xl p-12 text-center">
                        <Award className="w-16 h-16 text-white/50 mx-auto mb-4" />
                        <p className="text-xl text-white/70">
                            Bạn chưa hoàn thành bài trắc nghiệm nào
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {attempts.map((attempt, index) => {
                            const percentage = getPercentage(
                                attempt.score,
                                attempt.totalQuestions
                            );

                            return (
                                <motion.div
                                    key={attempt._id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="glass rounded-xl p-6 hover:bg-white/15 transition"
                                >
                                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                        <div className="flex-1">
                                            <h3 className="text-xl font-bold text-white mb-2">
                                                {attempt.quizTitle}
                                            </h3>
                                            <div className="flex flex-wrap gap-4 text-sm text-white/70">
                                                <span>
                                                    📅{' '}
                                                    {new Date(attempt.completedAt).toLocaleString('vi-VN')}
                                                </span>
                                                {attempt.shuffleQuestions && (
                                                    <span>🔀 Đảo câu hỏi</span>
                                                )}
                                                {attempt.shuffleAnswers && (
                                                    <span>🔀 Đảo đáp án</span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-6">
                                            <div className="text-center">
                                                <div className="text-white/70 text-sm mb-1">
                                                    Kết quả
                                                </div>
                                                <div className="text-2xl font-bold text-white">
                                                    {attempt.score}/{attempt.totalQuestions}
                                                </div>
                                            </div>

                                            <div className="text-center">
                                                <div className="text-white/70 text-sm mb-1">
                                                    Tỷ lệ
                                                </div>
                                                <div
                                                    className={`text-2xl font-bold ${getGradeColor(
                                                        percentage
                                                    )}`}
                                                >
                                                    {percentage}%
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Progress Bar */}
                                    <div className="mt-4 w-full bg-white/10 rounded-full h-2">
                                        <div
                                            className={`h-2 rounded-full transition-all ${percentage >= 80
                                                    ? 'bg-success-500'
                                                    : percentage >= 50
                                                        ? 'bg-yellow-400'
                                                        : 'bg-error-500'
                                                }`}
                                            style={{ width: `${percentage}%` }}
                                        />
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
