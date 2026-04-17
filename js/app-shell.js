(function () {
    const ROLE_PATHS = {
        admin: 'admin-dashboard.html',
        teacher: 'teacher-dashboard.html',
        student: 'student-dashboard.html'
    };

    function normalizeRole(role) {
        if (role === 'official') {
            return 'admin';
        }

        if (role === 'admin' || role === 'teacher' || role === 'student') {
            return role;
        }

        return 'student';
    }

    function normalizeUser(user) {
        if (!user) {
            return null;
        }

        return {
            ...user,
            role: normalizeRole(user.role)
        };
    }

    function getSessionUser() {
        try {
            const rawUser = JSON.parse(localStorage.getItem('elms_current_user') || 'null');
            const normalizedUser = normalizeUser(rawUser);

            if (normalizedUser && rawUser && rawUser.role !== normalizedUser.role) {
                localStorage.setItem('elms_current_user', JSON.stringify(normalizedUser));
            }

            return normalizedUser;
        } catch (error) {
            return null;
        }
    }

    function setSessionUser(user) {
        const normalizedUser = normalizeUser(user);
        if (normalizedUser) {
            localStorage.setItem('elms_current_user', JSON.stringify(normalizedUser));
        }
        return normalizedUser;
    }

    function clearSessionUser() {
        localStorage.removeItem('elms_current_user');
    }

    function redirectForRole(role) {
        return ROLE_PATHS[normalizeRole(role)] || 'login.html';
    }

    function requireRole(allowedRoles) {
        const normalizedAllowedRoles = allowedRoles.map(normalizeRole);
        const sessionUser = getSessionUser();

        if (!sessionUser) {
            window.location.replace('login.html');
            return null;
        }

        if (!normalizedAllowedRoles.includes(sessionUser.role)) {
            window.location.replace(redirectForRole(sessionUser.role));
            return null;
        }

        return sessionUser;
    }

    function registerServiceWorker() {
        if (!('serviceWorker' in navigator)) {
            return;
        }

        navigator.serviceWorker.register('service-worker.js').catch(() => {
            // Silent fallback keeps the prototype usable even when registration is blocked.
        });
    }

    function initAppShell() {
        const existingBanner = document.getElementById('connection-banner');
        if (existingBanner) {
            existingBanner.remove();
        }

        registerServiceWorker();
    }

    window.QuizKoApp = {
        normalizeRole,
        normalizeUser,
        getSessionUser,
        setSessionUser,
        clearSessionUser,
        redirectForRole,
        requireRole,
        registerServiceWorker,
        initAppShell
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAppShell, { once: true });
    } else {
        initAppShell();
    }
})();
