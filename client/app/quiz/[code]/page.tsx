'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft,
    ArrowRight,
    CheckCircle2,
    XCircle,
    Home,
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Answer {
    text: string;
    isCorrect: boolean;
}

interface Question {
    question: string;
    answers: Answer[];
}

interface Quiz {
    _id: string;
    title: string;
    description: string;
    questions: Question[];
    shareCode: string;
    username: string;
}

interface QuestionResult {
    questionIndex: number;
    userAnswer: number;
    correctAnswer: number;
    isCorrect: boolean;
}

export default function TakeQuizPage() {
    const params = useParams();
    const router = useRouter();
    const { token, user } = useAuth();
    const [quiz, setQuiz] = useState<Quiz | null>(null);
    const [loading, setLoading] = useState(true);
    const [started, setStarted] = useState(false);
    const [shuffleQuestions, setShuffleQuestions] = useState(false);
    const [shuffleAnswers, setShuffleAnswers] = useState(false);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const [showResult, setShowResult] = useState(false);
    const [questionResults, setQuestionResults] = useState<QuestionResult[]>([]);
    const [finished, setFinished] = useState(false);
    const [score, setScore] = useState(0);
    const [autoNextDelay] = useState(1000); // 1 second delay

    useEffect(() => {
        fetchQuiz();
    }, []);

    const fetchQuiz = async () => {
        try {
            const res = await fetch(`/api/quizzes/share/${params.code}`);
            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error);
            }

            setQuiz(data.quiz);
        } catch (error: any) {
            toast.error(error.message || 'Không thể tải bài trắc nghiệm');
            router.push('/dashboard');
        } finally {
            setLoading(false);
        }
    };

    const shuffleArray = <T,>(array: T[]): T[] => {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    };

    const startQuiz = () => {
        if (!quiz) return;

        let processedQuestions = quiz.questions.map((q) => ({ ...q }));

        if (shuffleQuestions) {
            processedQuestions = shuffleArray(processedQuestions);
        }

        if (shuffleAnswers) {
            processedQuestions = processedQuestions.map((q) => ({
                ...q,
                answers: shuffleArray(q.answers),
            }));
        }

        setQuestions(processedQuestions);
        setStarted(true);
    };

    const handleAnswerSelect = (answerIndex: number) => {
        if (showResult) return;

        setSelectedAnswer(answerIndex);
        setShowResult(true);

        const currentQuestion = questions[currentIndex];
        const isCorrect = currentQuestion.answers[answerIndex].isCorrect;
        const correctIndex = currentQuestion.answers.findIndex((a) => a.isCorrect);

        const result: QuestionResult = {
            questionIndex: currentIndex,
            userAnswer: answerIndex,
            correctAnswer: correctIndex,
            isCorrect,
        };

        setQuestionResults([...questionResults, result]);

        if (isCorrect) {
            setScore(score + 1);
        }

        // Auto-advance after delay
        setTimeout(() => {
            if (currentIndex < questions.length - 1) {
                nextQuestion();
            } else {
                finishQuiz([...questionResults, result]);
            }
        }, autoNextDelay);
    };

    const nextQuestion = () => {
        if (currentIndex < questions.length - 1) {
            setCurrentIndex(currentIndex + 1);
            setSelectedAnswer(null);
            setShowResult(false);
        }
    };

    const prevQuestion = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
            setSelectedAnswer(null);
            setShowResult(false);
        }
    };

    const jumpToQuestion = (index: number) => {
        setCurrentIndex(index);
        setSelectedAnswer(null);
        setShowResult(false);
    };

    const finishQuiz = async (results: QuestionResult[]) => {
        setFinished(true);

        if (user && token) {
            try {
                await fetch('/api/attempts', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        quizId: quiz?._id,
                        quizTitle: quiz?.title,
                        score: results.filter((r) => r.isCorrect).length,
                        totalQuestions: questions.length,
                        questionResults: results,
                        shuffleQuestions,
                        shuffleAnswers,
                    }),
                });
            } catch (error) {
                console.error('Failed to save attempt:', error);
            }
        }
    };

    const getAnswerClass = (answerIndex: number) => {
        if (!showResult) {
            return selectedAnswer === answerIndex
                ? 'bg-primary-500 text-white'
                : 'bg-white/10 text-white hover:bg-white/20';
        }

        const isCorrect = questions[currentIndex].answers[answerIndex].isCorrect;
        const isSelected = selectedAnswer === answerIndex;

        if (isCorrect) {
            return 'bg-success-500 text-white';
        }

        if (isSelected && !isCorrect) {
            return 'bg-error-500 text-white';
        }

        return 'bg-white/10 text-white/50';
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="glass rounded-2xl p-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
                </div>
            </div>
        );
    }

    if (!quiz) {
        return null;
    }

    // Start Screen
    if (!started) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="card max-w-2xl w-full"
                >
                    <h1 className="text-3xl font-bold text-white mb-4">{quiz.title}</h1>
                    <p className="text-white/70 mb-6">{quiz.description}</p>
                    <div className="bg-white/5 rounded-lg p-4 mb-6">
                        <p className="text-white/80">
                            <span className="font-semibold">Tác giả:</span> @{quiz.username}
                        </p>
                        <p className="text-white/80">
                            <span className="font-semibold">Số câu hỏi:</span>{' '}
                            {quiz.questions.length}
                        </p>
                    </div>

                    <div className="space-y-3 mb-6">
                        <label className="flex items-center gap-3 cursor-pointer p-4 rounded-lg bg-white/5 hover:bg-white/10 transition">
                            <input
                                type="checkbox"
                                checked={shuffleQuestions}
                                onChange={(e) => setShuffleQuestions(e.target.checked)}
                                className="w-5 h-5"
                            />
                            <span className="text-white">Đảo câu hỏi ngẫu nhiên</span>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer p-4 rounded-lg bg-white/5 hover:bg-white/10 transition">
                            <input
                                type="checkbox"
                                checked={shuffleAnswers}
                                onChange={(e) => setShuffleAnswers(e.target.checked)}
                                className="w-5 h-5"
                            />
                            <span className="text-white">Đảo đáp án ngẫu nhiên</span>
                        </label>
                    </div>

                    <div className="flex gap-4">
                        <button onClick={() => router.push('/dashboard')} className="btn-secondary flex-1">
                            <ArrowLeft className="w-5 h-5 inline mr-2" />
                            Quay lại
                        </button>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={startQuiz}
                            className="btn-primary flex-1"
                        >
                            Bắt đầu
                            <ArrowRight className="w-5 h-5 inline ml-2" />
                        </motion.button>
                    </div>
                </motion.div>
            </div>
        );
    }

    // Results Screen
    if (finished) {
        return (
            <div className="min-h-screen p-4 md:p-8">
                <div className="max-w-4xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="glass rounded-2xl p-8 text-center mb-8"
                    >
                        <h1 className="text-4xl font-bold text-white mb-4">
                            Hoàn Thành!
                        </h1>
                        <div className="text-6xl font-bold text-white mb-2">
                            {score}/{questions.length}
                        </div>
                        <p className="text-xl text-white/70">
                            Bạn đã trả lời đúng {score} / {questions.length} câu (
                            {Math.round((score / questions.length) * 100)}%)
                        </p>
                    </motion.div>

                    <div className="glass rounded-2xl p-6 mb-6">
                        <h2 className="text-2xl font-bold text-white mb-4">
                            Chi Tiết Kết Quả
                        </h2>
                        <div className="space-y-3">
                            {questionResults.map((result, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className={`p-4 rounded-lg cursor-pointer transition ${result.isCorrect ? 'bg-success-500/20' : 'bg-error-500/20'
                                        }`}
                                    onClick={() => {
                                        setFinished(false);
                                        jumpToQuestion(result.questionIndex);
                                    }}
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="text-white font-medium">
                                            Câu {index + 1}
                                        </span>
                                        {result.isCorrect ? (
                                            <CheckCircle2 className="w-6 h-6 text-success-500" />
                                        ) : (
                                            <XCircle className="w-6 h-6 text-error-500" />
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <button
                            onClick={() => router.push('/dashboard')}
                            className="btn-secondary flex-1"
                        >
                            <Home className="w-5 h-5 inline mr-2" />
                            Về trang chủ
                        </button>
                        <button
                            onClick={() => window.location.reload()}
                            className="btn-primary flex-1"
                        >
                            Làm lại
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Quiz Screen
    const currentQuestion = questions[currentIndex];

    return (
        <div className="min-h-screen p-4 md:p-8">
            <div className="max-w-4xl mx-auto">
                {/* Progress */}
                <div className="glass rounded-xl p-4 mb-6">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-white font-semibold">
                            Câu {currentIndex + 1} / {questions.length}
                        </span>
                        <span className="text-white/70">
                            Điểm: {score} / {currentIndex + (showResult ? 1 : 0)}
                        </span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2">
                        <div
                            className="bg-primary-500 h-2 rounded-full transition-all"
                            style={{
                                width: `${((currentIndex + 1) / questions.length) * 100}%`,
                            }}
                        />
                    </div>
                </div>

                {/* Question Grid */}
                <div className="glass rounded-xl p-4 mb-6">
                    <div className="flex flex-wrap gap-2">
                        {questions.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => jumpToQuestion(index)}
                                className={`w-10 h-10 rounded-lg font-semibold transition ${index === currentIndex
                                        ? 'bg-white text-primary-600'
                                        : index < currentIndex
                                            ? questionResults[index]?.isCorrect
                                                ? 'bg-success-500/50 text-white'
                                                : 'bg-error-500/50 text-white'
                                            : 'bg-white/10 text-white'
                                    }`}
                            >
                                {index + 1}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Question Card */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentIndex}
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        className="glass rounded-2xl p-8 mb-6"
                    >
                        <h2 className="text-2xl font-bold text-white mb-6">
                            {currentQuestion.question}
                        </h2>
                        <div className="space-y-3">
                            {currentQuestion.answers.map((answer, answerIndex) => (
                                <motion.button
                                    key={answerIndex}
                                    whileHover={!showResult ? { scale: 1.02 } : {}}
                                    whileTap={!showResult ? { scale: 0.98 } : {}}
                                    onClick={() => handleAnswerSelect(answerIndex)}
                                    disabled={showResult}
                                    className={`w-full p-4 rounded-xl text-left font-medium transition-all ${getAnswerClass(
                                        answerIndex
                                    )}`}
                                >
                                    <span className="inline-block w-8 font-bold mr-3">
                                        {['A', 'B', 'C', 'D'][answerIndex]}.
                                    </span>
                                    {answer.text}
                                </motion.button>
                            ))}
                        </div>
                    </motion.div>
                </AnimatePresence>

                {/* Navigation */}
                <div className="flex gap-4">
                    <button
                        onClick={prevQuestion}
                        disabled={currentIndex === 0}
                        className="btn-secondary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <ArrowLeft className="w-5 h-5 inline mr-2" />
                        Câu trước
                    </button>
                    <button
                        onClick={
                            currentIndex === questions.length - 1
                                ? () => finishQuiz(questionResults)
                                : nextQuestion
                        }
                        className="btn-primary flex-1"
                    >
                        {currentIndex === questions.length - 1 ? 'Hoàn thành' : 'Câu sau'}
                        <ArrowRight className="w-5 h-5 inline ml-2" />
                    </button>
                </div>
            </div>
        </div>
    );
}
