import QuizClient from './QuizClient';

export function generateStaticParams() {
    // Return an empty array for static export, 
    // or you could pre-render specific common codes here
    return [{ code: 'demo' }];
}

export default function TakeQuizPage({ params }: { params: { code: string } }) {
    return <QuizClient code={params.code} />;
}
