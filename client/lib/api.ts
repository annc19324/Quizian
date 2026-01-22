import toast from 'react-hot-toast';

export const PRIMARY_BACKEND = 'https://quizian.onrender.com';
export const SECONDARY_BACKEND = 'https://quizian-k1gn.onrender.com';

const getInitialUrl = () => {
    // Priority: 1. Local Storage (for failover), 2. Environment Variable, 3. Fallback

    if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('API_URL');
        if (stored) return stored;
    }

    const envUrl = process.env.NEXT_PUBLIC_API_URL;
    if (envUrl) return envUrl;

    return `${PRIMARY_BACKEND}/api`;
};

export let API_URL = getInitialUrl();

export const updateApiUrl = (newUrl: string, reload = true) => {
    if (typeof window !== 'undefined') {
        localStorage.setItem('API_URL', newUrl);
        API_URL = newUrl;
        if (reload) {
            window.location.reload();
        }
    }
};

const checkBackendHealth = async () => {
    if (typeof window === 'undefined') return;

    // Setup ignore for localhost development to prevent annoying switches
    const envUrl = process.env.NEXT_PUBLIC_API_URL;
    if (envUrl && envUrl.includes('localhost')) return;

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        // Check root endpoint of primary backend
        const res = await fetch(PRIMARY_BACKEND, {
            method: 'GET',
            signal: controller.signal
        }).catch(() => null);

        clearTimeout(timeoutId);

        // Treat any response as "alive" (even 404), unless it's strictly a connection failure or 503
        // Render suspended/spinning down usually times out or returns error.
        const isPrimaryUp = res && res.status !== 503;

        const currentUrl = localStorage.getItem('API_URL');
        const isCurrentlySecondary = currentUrl && currentUrl.includes(SECONDARY_BACKEND);

        if (isPrimaryUp) {
            if (isCurrentlySecondary) {
                toast.success('Backend chính đã hoạt động trở lại. Đang kết nối...', {
                    duration: 4000,
                    icon: '🚀'
                });
                setTimeout(() => updateApiUrl(`${PRIMARY_BACKEND}/api`), 1500);
            }
        } else {
            // Primary is down
            if (!isCurrentlySecondary) {
                console.warn('Primary backend unreachable. Switching to secondary.');
                toast('Backend chính không phản hồi. Đang chuyển sang dự phòng...', {
                    duration: 5000,
                    icon: '⚠️'
                });
                // Switch to secondary
                setTimeout(() => updateApiUrl(`${SECONDARY_BACKEND}/api`), 1500);
            }
        }
    } catch (error) {
        // Fetch failed (network error)
        const currentUrl = localStorage.getItem('API_URL');
        if (!currentUrl || !currentUrl.includes(SECONDARY_BACKEND)) {
            console.warn('Network error checking primary. Switching...', error);
            toast('Kết nối thất bại. Đang chuyển sang server phụ...', {
                icon: '🔄'
            });
            setTimeout(() => updateApiUrl(`${SECONDARY_BACKEND}/api`), 1500);
        }
    }
};

if (typeof window !== 'undefined') {
    // Check shortly after load
    setTimeout(checkBackendHealth, 2000);
    // Poll every 30 seconds
    setInterval(checkBackendHealth, 30000);
}
