'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { motion } from 'framer-motion';
import { ArrowLeft, Plus, Trash2, Save, FileText, Edit3, Image as ImageIcon, X, Upload } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { API_URL } from '@/lib/api';

interface Answer {
    text: string;
    isCorrect: boolean;
}

interface Question {
    question: string;
    image?: string;
    answers: Answer[];
}

export default function EditQuizPage() {
    return (
        <ProtectedRoute>
            <EditQuizContent />
        </ProtectedRoute>
    );
}

function EditQuizContent() {
    const router = useRouter();
    const params = useParams();
    const { token } = useAuth();
    const [mode, setMode] = useState<'manual' | 'paste'>('manual');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [pasteText, setPasteText] = useState('');
    // Initialize with one empty question to start, will be overwritten by fetch
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
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchQuiz = async () => {
            try {
                const res = await fetch(`${API_URL}/quizzes/${params.id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const data = await res.json();

                if (res.ok) {
                    setTitle(data.quiz.title);
                    setDescription(data.quiz.description || '');
                    setQuestions(data.quiz.questions);
                } else {
                    toast.error(data.error || 'Không tìm thấy bài trắc nghiệm');
                    router.push('/dashboard');
                }
            } catch (error) {
                toast.error('Lỗi tải dữ liệu');
                router.push('/dashboard');
            } finally {
                setLoading(false);
            }
        };

        if (params.id && token) {
            fetchQuiz();
        }
    }, [params.id, token, router]);

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

        // Logic check primarily for 'manual' since 'paste' is just for input, 
        // usually editing is done in manual mode after parsing or initial load.
        // If we want to support paste mode overwriting everything, we'd need to parse it first.
        // For simplicity in Edit, we might only support Manual editing of loaded questions, 
        // or support Paste which replaces ALL questions.

        let finalQuestions = questions;

        // If user switched to Paste mode and typed something, maybe they want to replace?
        // But usually Edit is for refining. Let's assume Manual mode is the primary way to edit existing questions.
        // If they use Paste mode, we should parse it and REPLACE questions?
        // Let's stick to the Create logic:

        if (mode === 'manual') {
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
        }

        // Note: We don't implement client-side parsing for Paste in Edit to keep it simple,
        // unless we duplicate the logic. The server endpoint for PUT expects structured questions.
        // If we want to support Paste in Edit, we need to parse it client-side or send pasteText to server.
        // The Create endpoint handled it. The PUT endpoint I wrote expects `questions` array.
        // So Paste mode in Edit is tricky unless we parse client side.
        // Let's just disable Paste mode for Edit or hide it for now, OR parse logic client side?
        // For now, I'll hide Paste mode in Edit to ensure stability, or assume manual only.

        try {
            setSaving(true);

            const res = await fetch(`${API_URL}/quizzes/${params.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    title,
                    description,
                    questions: finalQuestions,
                }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Không thể cập nhật bài trắc nghiệm');
            }

            toast.success('Đã cập nhật thành công!');
            router.push('/dashboard');
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
            </div>
        );
    }

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
                            {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
                        </motion.button>
                    </div>

                    <h1 className="text-3xl font-bold text-white mb-6">
                        Chỉnh Sửa Bài Trắc Nghiệm
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
                </motion.div>

                {/* Edit Questions Area */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="glass rounded-2xl p-6"
                >
                    {/* Question Grid Navigation */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between mb-4">
                            <label className="text-white/80 font-medium">Danh sách câu hỏi:</label>
                            <span className="text-white/60 text-sm">Tổng cộng: {questions.length} câu</span>
                        </div>
                        <div className="flex flex-wrap gap-2 py-2">
                            {questions.map((q, index) => {
                                // Simple check if question is "complete" (has text and one correct answer)
                                const isComplete = q.question.trim() && q.answers.some(a => a.isCorrect && a.text.trim());

                                return (
                                    <button
                                        key={index}
                                        onClick={() => setCurrentQuestionIndex(index)}
                                        className={`w-10 h-10 rounded-lg font-bold transition-all ${currentQuestionIndex === index
                                            ? 'ring-2 ring-white scale-110 z-10'
                                            : ''
                                            } ${isComplete
                                                ? 'bg-success-500/20 text-success-400 border border-success-500/30'
                                                : 'bg-white/10 text-white'
                                            }`}
                                        title={q.question || `Câu ${index + 1}`}
                                    >
                                        {index + 1}
                                    </button>
                                );
                            })}
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={addQuestion}
                                className="w-10 h-10 rounded-lg bg-primary-500 text-white flex items-center justify-center transition-all"
                                title="Thêm câu mới"
                            >
                                <Plus className="w-6 h-6" />
                            </motion.button>
                        </div>
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
                                Hình ảnh (tùy chọn)
                            </label>

                            {questions[currentQuestionIndex].image ? (
                                <div className="relative inline-block">
                                    <img
                                        src={questions[currentQuestionIndex].image}
                                        alt="Question"
                                        className="h-48 w-auto rounded-lg object-contain bg-black/20"
                                    />
                                    <button
                                        onClick={() => {
                                            const newQuestions = [...questions];
                                            newQuestions[currentQuestionIndex].image = undefined;
                                            setQuestions(newQuestions);
                                        }}
                                        className="absolute -top-2 -right-2 bg-error-500 text-white p-1 rounded-full hover:bg-error-600 transition"
                                        title="Xóa ảnh"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ) : (
                                <div>
                                    <input
                                        type="file"
                                        id="image-upload"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={async (e) => {
                                            const file = e.target.files?.[0];
                                            if (!file) return;

                                            if (file.size > 5 * 1024 * 1024) {
                                                toast.error('Ảnh không được quá 5MB');
                                                return;
                                            }

                                            const formData = new FormData();
                                            formData.append('image', file);

                                            const toastId = toast.loading('Đang tải ảnh lên...');

                                            try {
                                                const res = await fetch(`${API_URL}/upload`, {
                                                    method: 'POST',
                                                    body: formData,
                                                });
                                                const data = await res.json();

                                                if (!res.ok) throw new Error(data.error || 'Lỗi tải ảnh');

                                                const newQuestions = [...questions];
                                                newQuestions[currentQuestionIndex].image = data.url;
                                                setQuestions(newQuestions);
                                                toast.success('Đã tải ảnh lên', { id: toastId });
                                            } catch (error) {
                                                toast.error('Không thể tải ảnh', { id: toastId });
                                            }

                                            // Reset input
                                            e.target.value = '';
                                        }}
                                    />
                                    <label
                                        htmlFor="image-upload"
                                        className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 border border-dashed border-white/30 rounded-lg text-white/70 hover:text-white hover:border-white/60 transition"
                                    >
                                        <ImageIcon className="w-5 h-5" />
                                        Thêm ảnh minh họa
                                    </label>
                                </div>
                            )}
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
                                        <textarea
                                            value={
                                                questions[currentQuestionIndex].answers[answerIndex]
                                                    ? questions[currentQuestionIndex].answers[answerIndex].text
                                                    : ''
                                            }
                                            onChange={(e) =>
                                                updateAnswer(answerIndex, e.target.value)
                                            }
                                            className="flex-1 input-field py-3 min-h-[48px] resize-none"
                                            placeholder={`Đáp án ${label}`}
                                            rows={1}
                                            onInput={(e) => {
                                                const target = e.target as HTMLTextAreaElement;
                                                target.style.height = 'auto';
                                                target.style.height = target.scrollHeight + 'px';
                                            }}
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
            </div>
        </div>
    );
}
