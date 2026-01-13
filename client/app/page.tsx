'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { BookOpen, Zap, Users, Award } from 'lucide-react';

export default function HomePage() {
    const router = useRouter();

    const features = [
        {
            icon: BookOpen,
            title: 'Tạo Bài Trắc Nghiệm',
            description: 'Dễ dàng tạo câu hỏi từng bước hoặc dán hàng loạt',
        },
        {
            icon: Zap,
            title: 'Ôn Tập Thông Minh',
            description: 'Đảo câu hỏi và đáp án để học hiệu quả hơn',
        },
        {
            icon: Users,
            title: 'Chia Sẻ Dễ Dàng',
            description: 'Chia sẻ bài tập qua link với bạn bè',
        },
        {
            icon: Award,
            title: 'Theo Dõi Tiến Độ',
            description: 'Xem lịch sử làm bài và kết quả chi tiết',
        },
    ];

    return (
        <div className="min-h-screen flex items-center justify-center p-4 pt-56 md:pt-4">
            <div className="max-w-6xl w-full">
                {/* Hero Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-center mb-16"
                >
                    <h1 className="text-6xl md:text-7xl font-bold text-white mb-6">
                        Quizian
                    </h1>
                    <p className="text-xl md:text-2xl text-white/90 mb-8">
                        Nền tảng học tập trắc nghiệm thông minh
                    </p>
                    <div className="flex gap-4 justify-center">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => router.push('/register')}
                            className="btn-primary text-lg"
                        >
                            Bắt Đầu Ngay
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => router.push('/login')}
                            className="btn-secondary text-lg"
                        >
                            Đăng Nhập
                        </motion.button>
                        <motion.a
                            href="/quizian-app.apk"
                            download
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="btn-secondary text-lg flex items-center gap-2"
                        >
                            Tải Ứng Dụng (Android)
                        </motion.a>
                    </div>
                </motion.div>

                {/* Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            whileHover={{ scale: 1.05, y: -5 }}
                            className="card text-center"
                        >
                            <div className="flex justify-center mb-4">
                                <div className="p-4 rounded-full bg-gradient-to-br from-primary-400 to-primary-600">
                                    <feature.icon className="w-8 h-8 text-white" />
                                </div>
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-2">
                                {feature.title}
                            </h3>
                            <p className="text-white/70">
                                {feature.description}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
}
