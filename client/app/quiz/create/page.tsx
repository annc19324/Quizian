'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { motion } from 'framer-motion';
import { ArrowLeft, Plus, Trash2, Save, FileText, Edit3 } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { API_URL } from '@/lib/api';

interface Answer {
    text: string;
    isCorrect: boolean;
}

interface Question {
    question: string;
    answers: Answer[];
}

export default function CreateQuizPage() {
    return (
        <ProtectedRoute>
            <CreateQuizContent />
        </ProtectedRoute>
    );
}

function CreateQuizContent() {
    const router = useRouter();
    const { token } = useAuth();
    const [mode, setMode] = useState<'manual' | 'paste'>('manual');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [pasteText, setPasteText] = useState('');
    const [questions, setQuestions] = useState<Question[]>([
        {
            question: '',
            answers: [
                { text: '', isCorrect: false },
                { text: '', isCorrect: false },
                { text: '', isCorrect: false },
                { text: '', isCorrect: false },
            ],
        },
    ]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [saving, setSaving] = useState(false);

    const addQuestion = () => {
        setQuestions([
            ...questions,
            {
                question: '',
                answers: [
                    { text: '', isCorrect: false },
                    { text: '', isCorrect: false },
                    { text: '', isCorrect: false },
                    { text: '', isCorrect: false },
                ],
            },
        ]);
        setCurrentQuestionIndex(questions.length);
    };

    const removeQuestion = (index: number) => {
        if (questions.length === 1) {
            toast.error('Phải có ít nhất 1 câu hỏi');
            return;
        }
        const newQuestions = questions.filter((_, i) => i !== index);
        setQuestions(newQuestions);
        if (currentQuestionIndex >= newQuestions.length) {
            setCurrentQuestionIndex(newQuestions.length - 1);
        }
    };

    const updateQuestion = (text: string) => {
        const newQuestions = [...questions];
        newQuestions[currentQuestionIndex].question = text;
        setQuestions(newQuestions);
    };

    const updateAnswer = (answerIndex: number, text: string) => {
        const newQuestions = [...questions];
        newQuestions[currentQuestionIndex].answers[answerIndex].text = text;
        setQuestions(newQuestions);
    };

    const setCorrectAnswer = (answerIndex: number) => {
        const newQuestions = [...questions];
        newQuestions[currentQuestionIndex].answers = newQuestions[
            currentQuestionIndex
        ].answers.map((answer, i) => ({
            ...answer,
            isCorrect: i === answerIndex,
        }));
        setQuestions(newQuestions);
    };

    const handleSave = async () => {
        if (!title.trim()) {
            toast.error('Vui lòng nhập tiêu đề');
            return;
        }

        if (mode === 'manual') {
            // Validate manual questions
            const hasEmptyQuestion = questions.some((q) => !q.question.trim());
            const hasEmptyAnswer = questions.some((q) =>
                q.answers.some((a) => !a.text.trim())
            );
            const hasNoCorrectAnswer = questions.some(
                (q) => !q.answers.some((a) => a.isCorrect)
            );

            if (hasEmptyQuestion) {
                toast.error('Vui lòng điền đầy đủ câu hỏi');
                return;
            }

            if (hasEmptyAnswer) {
                toast.error('Vui lòng điền đầy đủ các đáp án');
                return;
            }

            if (hasNoCorrectAnswer) {
                toast.error('Mỗi câu hỏi phải có ít nhất 1 đáp án đúng');
                return;
            }
        } else {
            if (!pasteText.trim()) {
                toast.error('Vui lòng dán nội dung câu hỏi');
                return;
            }
        }

        try {
            setSaving(true);

            const body: any = {
                title,
                description,
                pasteMode: mode === 'paste',
            };

            if (mode === 'paste') {
                body.pasteText = pasteText;
            } else {
                body.questions = questions;
            }

            const res = await fetch(`${API_URL}/quizzes`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(body),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Không thể tạo bài trắc nghiệm');
            }

            toast.success('Đã tạo bài trắc nghiệm thành công!');
            router.push('/dashboard');
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="min-h-screen p-4 md:p-8">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass rounded-2xl p-6 mb-8"
                >
                    <div className="flex items-center justify-between mb-6">
                        <Link
                            href="/dashboard"
                            className="flex items-center text-white/70 hover:text-white transition"
                        >
                            <ArrowLeft className="w-5 h-5 mr-2" />
                            Quay lại
                        </Link>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleSave}
                            disabled={saving}
                            className="btn-primary flex items-center gap-2"
                        >
                            <Save className="w-5 h-5" />
                            {saving ? 'Đang lưu...' : 'Lưu bài'}
                        </motion.button>
                    </div>

                    <h1 className="text-3xl font-bold text-white mb-6">
                        Tạo Bài Trắc Nghiệm Mới
                    </h1>

                    {/* Basic Info */}
                    <div className="space-y-4 mb-6">
                        <div>
                            <label className="block text-white/80 mb-2 font-medium">
                                Tiêu đề bài trắc nghiệm *
                            </label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="input-field"
                                placeholder="Nhập tiêu đề bài trắc nghiệm"
                            />
                        </div>
                        <div>
                            <label className="block text-white/80 mb-2 font-medium">
                                Mô tả (tùy chọn)
                            </label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="input-field resize-none"
                                rows={3}
                                placeholder="Nhập mô tả cho bài trắc nghiệm"
                            />
                        </div>
                    </div>

                    {/* Mode Selection */}
                    <div className="flex gap-4">
                        <button
                            onClick={() => setMode('manual')}
                            className={`flex-1 py-4 px-6 rounded-xl font-semibold transition-all ${mode === 'manual'
                                ? 'bg-white text-primary-600'
                                : 'bg-white/10 text-white hover:bg-white/20'
                                }`}
                        >
                            <Edit3 className="w-6 h-6 inline mr-2" />
                            Tạo từng câu
                        </button>
                        <button
                            onClick={() => setMode('paste')}
                            className={`flex-1 py-4 px-6 rounded-xl font-semibold transition-all ${mode === 'paste'
                                ? 'bg-white text-primary-600'
                                : 'bg-white/10 text-white hover:bg-white/20'
                                }`}
                        >
                            <FileText className="w-6 h-6 inline mr-2" />
                            Dán hàng loạt
                        </button>
                    </div>
                </motion.div>

                {/* Manual Mode */}
                {mode === 'manual' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="glass rounded-2xl p-6"
                    >
                        {/* Question Navigation */}
                        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                            {questions.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => setCurrentQuestionIndex(index)}
                                    className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition-all ${currentQuestionIndex === index
                                        ? 'bg-white text-primary-600'
                                        : 'bg-white/10 text-white hover:bg-white/20'
                                        }`}
                                >
                                    Câu {index + 1}
                                </button>
                            ))}
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={addQuestion}
                                className="px-4 py-2 rounded-lg bg-primary-500 text-white font-semibold whitespace-nowrap"
                            >
                                <Plus className="w-5 h-5 inline" /> Thêm câu
                            </motion.button>
                        </div>

                        {/* Current Question */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl font-bold text-white">
                                    Câu hỏi {currentQuestionIndex + 1}
                                </h3>
                                {questions.length > 1 && (
                                    <button
                                        onClick={() => removeQuestion(currentQuestionIndex)}
                                        className="text-error-500 hover:text-error-600 p-2"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                )}
                            </div>

                            <div>
                                <label className="block text-white/80 mb-2 font-medium">
                                    Nội dung câu hỏi *
                                </label>
                                <textarea
                                    value={questions[currentQuestionIndex].question}
                                    onChange={(e) => updateQuestion(e.target.value)}
                                    className="input-field resize-none"
                                    rows={3}
                                    placeholder="Nhập nội dung câu hỏi"
                                />
                            </div>

                            <div>
                                <label className="block text-white/80 mb-2 font-medium">
                                    Các đáp án *
                                </label>
                                <div className="space-y-3">
                                    {['A', 'B', 'C', 'D'].map((label, answerIndex) => (
                                        <div key={answerIndex} className="flex gap-2">
                                            <button
                                                onClick={() => setCorrectAnswer(answerIndex)}
                                                className={`w-12 h-12 rounded-lg font-bold transition-all ${questions[currentQuestionIndex].answers[answerIndex]
                                                    .isCorrect
                                                    ? 'bg-success-500 text-white'
                                                    : 'bg-white/10 text-white hover:bg-white/20'
                                                    }`}
                                            >
                                                {label}
                                            </button>
                                            <input
                                                type="text"
                                                value={
                                                    questions[currentQuestionIndex].answers[answerIndex]
                                                        .text
                                                }
                                                onChange={(e) =>
                                                    updateAnswer(answerIndex, e.target.value)
                                                }
                                                className="flex-1 input-field"
                                                placeholder={`Đáp án ${label}`}
                                            />
                                        </div>
                                    ))}
                                </div>
                                <p className="text-white/60 text-sm mt-2">
                                    * Nhấn vào A, B, C hoặc D để chọn đáp án đúng
                                </p>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Paste Mode */}
                {mode === 'paste' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="glass rounded-2xl p-6"
                    >
                        <h3 className="text-xl font-bold text-white mb-4">
                            Dán nội dung câu hỏi
                        </h3>
                        <p className="text-white/70 mb-4">
                            Định dạng: Mỗi câu hỏi bắt đầu bằng số, các đáp án viết dưới câu
                            hỏi, đáp án đúng có dấu * ở đầu
                        </p>
                        <div className="bg-white/5 rounded-lg p-4 mb-4">
                            <pre className="text-white/60 text-sm whitespace-pre-wrap">
                                {`1 + 1 bằng mấy?\n*2\n3\n5\n6\n\n1 + 2 bằng mấy?\n2\n*3\n5\n6`}
                            </pre>
                        </div>
                        <textarea
                            value={pasteText}
                            onChange={(e) => setPasteText(e.target.value)}
                            className="input-field resize-none"
                            rows={15}
                            placeholder="Dán nội dung câu hỏi vào đây..."
                        />
                    </motion.div>
                )}
            </div>
        </div>
    );
}
