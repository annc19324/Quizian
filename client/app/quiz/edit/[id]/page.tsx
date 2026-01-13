import EditQuizClient from './EditQuizClient';

export function generateStaticParams() {
    // Return an empty array for static export
    return [{ id: '1' }];
}

export default function EditQuizPage({ params }: { params: { id: string } }) {
    return <EditQuizClient id={params.id} />;
}
