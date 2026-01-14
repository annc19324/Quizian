'use client';

import { useSearchParams } from 'next/navigation';
import QuizClient from './[code]/QuizClient';
import { Suspense } from 'react';

function QuizPageContent() {
    const searchParams = useSearchParams();
    const code = searchParams.get('code');

    if (!code) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="glass rounded-2xl p-8 text-center text-white">
                    <h1 className="text-2xl font-bold mb-4">Không tìm thấy mã bài thi</h1>
                    <p>Vui lòng kiểm tra lại link hoặc quay lại trang chủ.</p>
                </div>
            </div>
        );
    }

    return <QuizClient code={code} />;
}

export default function TakeQuizPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div></div>}>
            <QuizPageContent />
        </Suspense>
    );
}
