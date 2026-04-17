const DASHBOARD_LINK_SELECTOR = '.navbar .nav-link[href^="#"]:not(.dropdown-toggle):not([href="#"]), .sidebar-nav .nav-link[href^="#"]:not([href="#"])';
const DASHBOARD_NAV_LINKS = Array.from(document.querySelectorAll(DASHBOARD_LINK_SELECTOR));
const DASHBOARD_TARGETS = DASHBOARD_NAV_LINKS
    .map((link) => {
        const hash = link.getAttribute('href');
        const element = document.querySelector(hash);
        return element ? { hash, element, link } : null;
    })
    .filter(Boolean);
const DASHBOARD_SECTION_TARGETS = Array.from(
    new Map(
        DASHBOARD_TARGETS
            .filter((target) => target.hash !== '#top')
            .map((target) => [target.hash, target])
    ).values()
);

let dashboardScrollFrame = null;
let dashboardObserver = null;
let dashboardActiveHash = '';
const DASHBOARD_COLLAPSE_KEY = 'quizko.sidebarCollapsed';

function getDashboardElements() {
    return {
        shell: document.querySelector('.dashboard-shell'),
        sidebar: document.querySelector('.dashboard-sidebar'),
        hamburgerBtn: document.querySelector('.sidebar-hamburger')
    };
}

function ensureSidebarBackdrop(shell) {
    if (!shell) {
        return null;
    }

    let backdrop = shell.querySelector('.sidebar-backdrop');
    if (!backdrop) {
        backdrop = document.createElement('button');
        backdrop.type = 'button';
        backdrop.className = 'sidebar-backdrop';
        backdrop.setAttribute('aria-label', 'Close sidebar');
        shell.appendChild(backdrop);
    }

    return backdrop;
}

function updateHamburgerState(button, isActive) {
    if (!button) {
        return;
    }

    button.classList.toggle('is-active', isActive);
    button.setAttribute('aria-expanded', String(isActive));
    button.setAttribute('aria-label', isActive ? 'Collapse sidebar' : 'Expand sidebar');
}

function closeMobileSidebar(sidebar, shell, button) {
    if (sidebar) {
        sidebar.classList.remove('expanded');
    }

    if (shell) {
        shell.classList.remove('mobile-sidebar-open');
    }

    updateHamburgerState(button, false);
    document.body.style.overflow = 'auto';
}

function setDashboardActiveHash(nextHash) {
    if (!nextHash || nextHash === dashboardActiveHash) {
        return;
    }

    dashboardActiveHash = nextHash;

    DASHBOARD_NAV_LINKS.forEach((link) => {
        const isActive = link.getAttribute('href') === nextHash;
        link.classList.toggle('active', isActive);

        if (isActive) {
            link.setAttribute('aria-current', 'page');
        } else {
            link.removeAttribute('aria-current');
        }
    });
}

function updateDashboardActiveFromViewport() {
    const navbar = document.querySelector('.navbar');
    const navbarHeight = navbar ? navbar.getBoundingClientRect().height : 0;
    const topOffset = Math.max(navbarHeight, 0);

    const currentHash = window.location.hash;
    const hashedTarget = currentHash
        ? DASHBOARD_SECTION_TARGETS.find((target) => target.hash === currentHash)
        : null;

    if (hashedTarget) {
        const rect = hashedTarget.element.getBoundingClientRect();
        const isVisibleEnough = rect.top <= window.innerHeight * 0.85 && rect.bottom >= topOffset + 24;
        if (isVisibleEnough) {
            setDashboardActiveHash(hashedTarget.hash);
            return;
        }
    }

    if (DASHBOARD_SECTION_TARGETS.length === 0) {
        setDashboardActiveHash('#top');
        return;
    }

    const probeViewportY = Math.max(
        topOffset + 28,
        Math.min(window.innerHeight * 0.35, window.innerHeight - 120)
    );

    const sectionRects = DASHBOARD_SECTION_TARGETS
        .map((target) => {
            const rect = target.element.getBoundingClientRect();
            return {
                hash: target.hash,
                top: rect.top,
                bottom: rect.bottom
            };
        })
        .sort((a, b) => a.top - b.top);

    if (sectionRects[0].top > probeViewportY + 12) {
        setDashboardActiveHash('#top');
        return;
    }

    const sectionAtProbe = sectionRects.find(
        (section) => section.top <= probeViewportY && section.bottom >= probeViewportY
    );

    if (sectionAtProbe) {
        setDashboardActiveHash(sectionAtProbe.hash);
        return;
    }

    const nearestAbove = [...sectionRects]
        .reverse()
        .find((section) => section.top <= probeViewportY);
    const nearestBelow = sectionRects.find((section) => section.top > probeViewportY);

    if (nearestAbove && nearestBelow) {
        const distanceAbove = Math.abs(probeViewportY - nearestAbove.bottom);
        const distanceBelow = Math.abs(nearestBelow.top - probeViewportY);
        setDashboardActiveHash(distanceBelow < distanceAbove ? nearestBelow.hash : nearestAbove.hash);
        return;
    }

    if (nearestAbove) {
        setDashboardActiveHash(nearestAbove.hash);
        return;
    }

    setDashboardActiveHash(nearestBelow ? nearestBelow.hash : '#top');
}

function scheduleDashboardNavUpdate() {
    if (dashboardScrollFrame !== null) {
        return;
    }

    dashboardScrollFrame = window.requestAnimationFrame(() => {
        dashboardScrollFrame = null;
        updateDashboardActiveFromViewport();
    });
}

document.addEventListener('DOMContentLoaded', () => {
    // Set initial active hash
    setDashboardActiveHash(window.location.hash && window.location.hash !== '#'
        ? window.location.hash
        : '#top');

    // Setup IntersectionObserver for auto-tracking
    if ('IntersectionObserver' in window && DASHBOARD_TARGETS.length > 0) {
        dashboardObserver = new IntersectionObserver(() => {
            scheduleDashboardNavUpdate();
        }, {
            root: null,
            threshold: [0.15, 0.3, 0.45, 0.6, 0.75],
            rootMargin: '-10% 0px -55% 0px'
        });

        DASHBOARD_TARGETS.forEach((target) => dashboardObserver.observe(target.element));
    }

    // Handle manual nav link clicks
    DASHBOARD_NAV_LINKS.forEach((link) => {
        link.addEventListener('click', () => {
            const clickedHash = link.getAttribute('href');
            if (clickedHash) {
                setDashboardActiveHash(clickedHash);
            }

            window.requestAnimationFrame(scheduleDashboardNavUpdate);

            // Close sidebar on mobile when clicking a link
            const { shell, sidebar, hamburgerBtn } = getDashboardElements();
            const isMobile = window.innerWidth <= 991.98;
            if (isMobile && sidebar && sidebar.classList.contains('expanded')) {
                closeMobileSidebar(sidebar, shell, hamburgerBtn);
            }
        });
    });

    // Hamburger menu toggle
    const { shell, sidebar, hamburgerBtn } = getDashboardElements();
    if (hamburgerBtn) {
        const backdrop = ensureSidebarBackdrop(shell);
        const isMobile = () => window.innerWidth <= 991.98;

        if (sidebar) {
            const persistedCollapse = localStorage.getItem(DASHBOARD_COLLAPSE_KEY) === 'true';
            if (persistedCollapse && !isMobile()) {
                shell?.classList.add('sidebar-collapsed');
            }
            updateHamburgerState(hamburgerBtn, sidebar.classList.contains('expanded') || shell?.classList.contains('sidebar-collapsed'));
        }

        hamburgerBtn.addEventListener('click', () => {
            if (!sidebar) {
                return;
            }

            if (isMobile()) {
                const isExpanded = sidebar.classList.toggle('expanded');
                shell?.classList.toggle('mobile-sidebar-open', isExpanded);
                updateHamburgerState(hamburgerBtn, isExpanded);

                if (isExpanded) {
                    document.body.style.overflow = 'hidden';
                } else {
                    document.body.style.overflow = 'auto';
                }
                return;
            }

            const isCollapsed = shell?.classList.toggle('sidebar-collapsed') ?? false;
            updateHamburgerState(hamburgerBtn, isCollapsed);
            localStorage.setItem(DASHBOARD_COLLAPSE_KEY, String(isCollapsed));
            document.body.style.overflow = 'auto';
        });

        backdrop?.addEventListener('click', () => {
            if (!isMobile()) {
                return;
            }

            closeMobileSidebar(sidebar, shell, hamburgerBtn);
        });

        window.addEventListener('resize', () => {
            if (!sidebar) {
                return;
            }

            if (!isMobile()) {
                sidebar.classList.remove('expanded');
                shell?.classList.remove('mobile-sidebar-open');
                document.body.style.overflow = 'auto';
                updateHamburgerState(hamburgerBtn, shell?.classList.contains('sidebar-collapsed'));
                return;
            }

            shell?.classList.remove('sidebar-collapsed');
            localStorage.setItem(DASHBOARD_COLLAPSE_KEY, 'false');
            updateHamburgerState(hamburgerBtn, sidebar.classList.contains('expanded'));
            if (!sidebar.classList.contains('expanded')) {
                document.body.style.overflow = 'auto';
            }
        });
    }

    scheduleDashboardNavUpdate();
});

window.addEventListener('scroll', scheduleDashboardNavUpdate, { passive: true });
window.addEventListener('resize', scheduleDashboardNavUpdate);
window.addEventListener('hashchange', scheduleDashboardNavUpdate);