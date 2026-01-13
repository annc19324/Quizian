const getInitialUrl = () => {
    if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('API_URL');
        if (stored) return stored;
    }
    // Set online production URL as default for both web and mobile
    return process.env.NEXT_PUBLIC_API_URL || 'https://quizian.onrender.com/api';
};

export const API_URL = getInitialUrl();

export const updateApiUrl = (newUrl: string) => {
    if (typeof window !== 'undefined') {
        localStorage.setItem('API_URL', newUrl);
        window.location.reload(); // Reload to apply everywhere
    }
};
