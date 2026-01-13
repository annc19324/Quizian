const getInitialUrl = () => {
    // Priority: 1. Environment Variable, 2. Local Storage, 3. Fallback
    const envUrl = process.env.NEXT_PUBLIC_API_URL;
    if (envUrl) return envUrl;

    if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('API_URL');
        if (stored) return stored;
    }

    return 'https://quizian.onrender.com/api';
};

export const API_URL = getInitialUrl();

export const updateApiUrl = (newUrl: string) => {
    if (typeof window !== 'undefined') {
        localStorage.setItem('API_URL', newUrl);
        window.location.reload(); // Reload to apply everywhere
    }
};
