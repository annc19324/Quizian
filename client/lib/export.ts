import { jsPDF } from 'jspdf';
import { Document, Packer, Paragraph, TextRun, AlignmentType } from 'docx';
import { saveAs } from 'file-saver';
import toast from 'react-hot-toast';

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

export const exportToPDF = async (quiz: Quiz, withAnswers: boolean = false) => {
    // Dynamic import to avoid SSR issues and use the full browser rendering engine
    let html2pdf: any;
    try {
        const module = await import('html2pdf.js');
        html2pdf = module.default || module;
    } catch (e) {
        // Fallback for some environments
        html2pdf = (window as any).html2pdf;
    }

    if (!html2pdf) {
        toast.error('Lỗi: Không thể khởi tạo thư viện xuất PDF');
        return;
    }

    const toastId = toast.loading('Đang chuẩn bị nội dung PDF...');

    const element = document.createElement('div');
    element.className = 'pdf-export-content';
    element.style.padding = '40px';
    element.style.color = '#000';
    element.style.background = '#fff';
    element.style.fontFamily = "'Times New Roman', Times, serif";
    element.style.lineHeight = '1.5';

    let content = `
        <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="font-size: 26px; margin-bottom: 5px; color: #000;">${quiz.title}</h1>
            <p style="font-style: italic; font-size: 14px; color: #333;">Tác giả: ${quiz.username}</p>
            ${quiz.description ? `<p style="margin-top: 10px; font-size: 12px; color: #444;">${quiz.description}</p>` : ''}
        </div>
        <hr style="border: 0.5px solid #ccc; margin-bottom: 25px;" />
    `;

    quiz.questions.forEach((q, qIndex) => {
        content += `
            <div style="margin-bottom: 20px; page-break-inside: avoid;">
                <p style="font-weight: bold; font-size: 15px; margin-bottom: 6px;">
                    Câu ${qIndex + 1}: ${q.question}
                </p>
                <div style="margin-left: 15px;">
        `;

        q.answers.forEach((a, aIndex) => {
            const prefix = withAnswers && a.isCorrect ? '@' : '';
            const isCorrectStyle = withAnswers && a.isCorrect ? 'color: #059669; font-weight: bold;' : '';
            content += `
                <p style="margin-bottom: 3px; font-size: 14px; ${isCorrectStyle}">
                    ${prefix}${getLetter(aIndex)}. ${a.text}
                </p>
            `;
        });

        content += `
                </div>
            </div>
        `;
    });

    if (withAnswers) {
        content += `
            <div style="page-break-before: always; border-top: 2px solid #000; padding-top: 20px; margin-top: 30px;">
                <h2 style="text-align: center; font-size: 22px; margin-bottom: 20px;">ĐÁP ÁN CHI TIẾT</h2>
                <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px;">
        `;

        quiz.questions.forEach((q, qIndex) => {
            const correctAnswers = q.answers
                .map((a, i) => a.isCorrect ? getLetter(i) : null)
                .filter(a => a !== null);

            content += `
                <div style="font-size: 13px; margin-bottom: 4px;">
                    <span style="font-weight: bold;">Câu ${qIndex + 1}:</span> ${correctAnswers.join(', ')}
                </div>
            `;
        });

        content += `
                </div>
            </div>
        `;
    }

    element.innerHTML = content;

    const opt = {
        margin: [15, 15, 15, 15],
        filename: `${quiz.title.replace(/\s+/g, '_')}${withAnswers ? '_Co_Dap_An' : ''}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
            scale: 2,
            useCORS: true,
            letterRendering: true,
            logging: false
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    try {
        await html2pdf().from(element).set(opt).save();
        toast.success('Đã xuất PDF thành công!', { id: toastId });
    } catch (error) {
        console.error('PDF Export Error:', error);
        toast.error('Lỗi khi xuất PDF', { id: toastId });
    }
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
