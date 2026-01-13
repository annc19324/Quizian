import { jsPDF } from 'jspdf';
import { Document, Packer, Paragraph, TextRun, AlignmentType, HeadingLevel } from 'docx';
import { saveAs } from 'file-saver';

interface Answer {
    text: string;
    isCorrect: boolean;
}

interface Question {
    question: string;
    image?: string;
    answers: Answer[];
}

interface Quiz {
    title: string;
    description: string;
    questions: Question[];
    username: string;
}

const getLetter = (index: number) => String.fromCharCode(65 + index); // A, B, C, D...

export const exportToPDF = (quiz: Quiz, withAnswers: boolean = false) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let y = 20;

    // Title
    doc.setFontSize(22);
    doc.text(quiz.title, pageWidth / 2, y, { align: 'center' });
    y += 10;

    // Subtitle
    doc.setFontSize(12);
    doc.text(`Tác giả: ${quiz.username}`, pageWidth / 2, y, { align: 'center' });
    y += 15;

    if (quiz.description) {
        doc.setFontSize(11);
        const splitDesc = doc.splitTextToSize(quiz.description, pageWidth - 40);
        doc.text(splitDesc, 20, y);
        y += splitDesc.length * 7 + 10;
    }

    doc.setFontSize(12);

    quiz.questions.forEach((q, qIndex) => {
        // Check if we need a new page
        if (y > 270) {
            doc.addPage();
            y = 20;
        }

        doc.setFont('helvetica', 'bold');
        const questionText = `Câu ${qIndex + 1}: ${q.question}`;
        const splitQuestion = doc.splitTextToSize(questionText, pageWidth - 40);
        doc.text(splitQuestion, 20, y);
        y += splitQuestion.length * 7;

        doc.setFont('helvetica', 'normal');
        q.answers.forEach((a, aIndex) => {
            const prefix = withAnswers && a.isCorrect ? '@' : '';
            const answerText = `    ${prefix}${getLetter(aIndex)}. ${a.text}`;
            const splitAnswer = doc.splitTextToSize(answerText, pageWidth - 50);
            doc.text(splitAnswer, 20, y);
            y += splitAnswer.length * 7;
        });

        y += 5; // space between questions
    });

    // Add Answer Key at the end only if withAnswers is true
    if (withAnswers) {
        doc.addPage();
        y = 20;
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('ĐÁP ÁN CHI TIẾT', pageWidth / 2, y, { align: 'center' });
        y += 15;

        doc.setFontSize(12);
        quiz.questions.forEach((q, qIndex) => {
            const correctAnswers = q.answers
                .map((a, i) => a.isCorrect ? getLetter(i) : null)
                .filter(a => a !== null);

            doc.text(`Câu ${qIndex + 1}: ${correctAnswers.join(', ')}`, 20, y);
            y += 7;

            if (y > 280) {
                doc.addPage();
                y = 20;
            }
        });
    }

    const filename = `${quiz.title.replace(/\s+/g, '_')}${withAnswers ? '_Co_Dap_An' : ''}.pdf`;
    doc.save(filename);
};

export const exportToWord = async (quiz: Quiz, withAnswers: boolean = false) => {
    const questionsParagraphs: any[] = [];

    quiz.questions.forEach((q, qIndex) => {
        questionsParagraphs.push(
            new Paragraph({
                children: [
                    new TextRun({
                        text: `Câu ${qIndex + 1}: ${q.question}`,
                        bold: true,
                        size: 24,
                    }),
                ],
                spacing: { before: 400, after: 200 },
            })
        );

        q.answers.forEach((a, aIndex) => {
            const prefix = withAnswers && a.isCorrect ? '@' : '';
            questionsParagraphs.push(
                new Paragraph({
                    children: [
                        new TextRun({
                            text: `${prefix}${getLetter(aIndex)}. ${a.text}`,
                            size: 24,
                            color: withAnswers && a.isCorrect ? "2ecc71" : "000000"
                        }),
                    ],
                    indent: { left: 720 },
                    spacing: { after: 100 },
                })
            );
        });
    });

    const mainContent: any[] = [
        new Paragraph({
            children: [
                new TextRun({
                    text: quiz.title,
                    bold: true,
                    size: 48,
                }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 },
        }),
        new Paragraph({
            children: [
                new TextRun({
                    text: `Tác giả: ${quiz.username}`,
                    italics: true,
                    size: 24,
                }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 },
        }),
        ...questionsParagraphs,
    ];

    if (withAnswers) {
        const answerKeyParagraphs: any[] = [
            new Paragraph({
                children: [new TextRun({ text: 'ĐÁP ÁN CHI TIẾT', bold: true, size: 32 })],
                alignment: AlignmentType.CENTER,
                spacing: { before: 800, after: 400 },
            }),
        ];

        quiz.questions.forEach((q, qIndex) => {
            const correctAnswers = q.answers
                .map((a, i) => a.isCorrect ? getLetter(i) : null)
                .filter(a => a !== null);

            answerKeyParagraphs.push(
                new Paragraph({
                    children: [
                        new TextRun({
                            text: `Câu ${qIndex + 1}: ${correctAnswers.join(', ')}`,
                            size: 24,
                        }),
                    ],
                    spacing: { after: 100 },
                })
            );
        });
        mainContent.push(...answerKeyParagraphs);
    }

    const doc = new Document({
        sections: [
            {
                properties: {},
                children: mainContent,
            },
        ],
    });

    const blob = await Packer.toBlob(doc);
    const filename = `${quiz.title.replace(/\s+/g, '_')}${withAnswers ? '_Co_Dap_An' : ''}.docx`;
    saveAs(blob, filename);
};
