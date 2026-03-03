import { useState, useEffect } from 'react';
import {
    MenuIcon,
    CloseIcon,
    HomeIcon,
    PackageIcon,
    DeliveryIcon,
    CheckCircleIcon,
    SettingsIcon,
} from './icons';

type Theme = 'system' | 'light' | 'dark';

export default function Sidebar() {
    const [isOpen, setIsOpen] = useState(false);
    const [theme, setTheme] = useState<Theme>('system');

    useEffect(() => {
        // Load theme preference from localStorage
        const savedTheme = localStorage.getItem('theme-preference') as Theme;
        if (savedTheme) {
            setTheme(savedTheme);
            applyTheme(savedTheme);
        }
    }, []);

    const applyTheme = (newTheme: Theme) => {
        const html = document.documentElement;

        if (newTheme === 'system') {
            html.removeAttribute('data-theme');
        } else {
            html.setAttribute('data-theme', newTheme);
        }
    };

    const handleThemeChange = (newTheme: Theme) => {
        setTheme(newTheme);
        localStorage.setItem('theme-preference', newTheme);
        applyTheme(newTheme);
    };

    return (
        <>
            {/* Mobile menu button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed top-4 right-4 z-50 p-2 rounded-lg lg:hidden focus:outline-none focus:ring-2"
                style={{
                    backgroundColor: 'var(--color-surface)',
                    color: 'var(--color-text)',
                    borderColor: 'var(--color-border)',
                }}
                aria-label="Toggle sidebar"
            >
                {isOpen ? <CloseIcon /> : <MenuIcon />}
            </button>

            {/* Backdrop for mobile */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-30 backdrop-blur-sm lg:hidden"
                    onClick={() => setIsOpen(false)}
                    aria-hidden="true"
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 z-40 w-64 border-r transform transition-transform duration-300 lg:translate-x-0 lg:static ${
                    isOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
                style={{
                    backgroundColor: 'var(--color-surface)',
                    borderColor: 'var(--color-border)',
                }}
            >
                <div className="flex flex-col h-full">
                    {/* Logo */}
                    <div
                        className="flex items-center justify-start px-6 py-6 border-b"
                        style={{ borderColor: 'var(--color-border)' }}
                    >
                        <svg
                            className="w-8 h-8 shrink-0"
                            viewBox="0 0 64 64"
                            fill="none"
                        >
                            {/* Top face */}
                            <path
                                d="M12 16 L32 8 L52 16 L32 24 Z"
                                fill="#D4621A"
                            />
                            {/* Left face */}
                            <path
                                d="M12 16 L12 44 L32 52 L32 24 Z"
                                fill="#B8531A"
                            />
                            {/* Right face */}
                            <path
                                d="M32 24 L32 52 L52 44 L52 16 Z"
                                fill="#E67321"
                            />
                            {/* Tape on front */}
                            <line
                                x1="32"
                                y1="24"
                                x2="32"
                                y2="52"
                                stroke="#3A7CA5"
                                strokeWidth="1.5"
                                strokeDasharray="2,2"
                            />
                        </svg>
                        <span
                            className="ml-3 text-xl font-semibold leading-none"
                            style={{ color: 'var(--color-text)' }}
                        >
                            Parcello
                        </span>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-4 py-6 overflow-y-auto">
                        {/* Shipments Section */}
                        <div className="mb-6">
                            <h3
                                className="px-3 mb-2 text-xs font-semibold uppercase"
                                style={{ color: 'var(--color-text-muted)' }}
                            >
                                Shipments
                            </h3>
                            <div className="space-y-1">
                                <a
                                    href="/"
                                    className="flex items-center px-3 py-2 rounded-lg transition-colors hover-bg-main"
                                    style={{ color: 'var(--color-text)' }}
                                >
                                    <HomeIcon />
                                    <span className="ml-3">Dashboard</span>
                                </a>
                                <a
                                    href="/packages"
                                    className="flex items-center px-3 py-2 rounded-lg transition-colors hover-bg-main"
                                    style={{ color: 'var(--color-text)' }}
                                >
                                    <PackageIcon />
                                    <span className="ml-3">All Packages</span>
                                </a>
                                <a
                                    href="/in-transit"
                                    className="flex items-center px-3 py-2 rounded-lg transition-colors hover-bg-main"
                                    style={{ color: 'var(--color-text)' }}
                                >
                                    <DeliveryIcon />
                                    <span className="ml-3">In Transit</span>
                                </a>
                                <a
                                    href="/delivered"
                                    className="flex items-center px-3 py-2 rounded-lg transition-colors hover-bg-main"
                                    style={{ color: 'var(--color-text)' }}
                                >
                                    <CheckCircleIcon />
                                    <span className="ml-3">Delivered</span>
                                </a>
                                <h3
                                    className="pt-3 px-3 mb-2 text-xs font-semibold uppercase"
                                    style={{ color: 'var(--color-text-muted)' }}
                                >
                                    Options
                                </h3>
                                <a
                                    href="/settings"
                                    className="flex items-center px-3 py-2 rounded-lg transition-colors hover-bg-main"
                                    style={{ color: 'var(--color-text)' }}
                                >
                                    <SettingsIcon />
                                    <span className="ml-3">Settings</span>
                                </a>
                            </div>
                        </div>
                    </nav>

                    {/* Theme Selector */}
                    <div
                        className="px-4 py-3 border-t"
                        style={{ borderColor: 'var(--color-border)' }}
                    >
                        <div className="flex gap-2 justify-center">
                            <button
                                type="button"
                                onClick={() =>
                                    handleThemeChange(
                                        theme === 'light' ? 'system' : 'light',
                                    )
                                }
                                className="p-2 rounded-lg transition-opacity hover:opacity-80 flex items-center justify-center"
                                style={{
                                    backgroundColor:
                                        theme === 'light'
                                            ? 'var(--color-bg)'
                                            : 'transparent',
                                    color: 'var(--color-text)',
                                }}
                                aria-label="Light theme"
                                title="Light"
                            >
                                <svg
                                    className="w-5 h-5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                                    />
                                </svg>
                            </button>
                            <button
                                type="button"
                                onClick={() =>
                                    handleThemeChange(
                                        theme === 'dark' ? 'system' : 'dark',
                                    )
                                }
                                className="p-2 rounded-lg transition-opacity hover:opacity-80 flex items-center justify-center"
                                style={{
                                    backgroundColor:
                                        theme === 'dark'
                                            ? 'var(--color-bg)'
                                            : 'transparent',
                                    color: 'var(--color-text)',
                                }}
                                aria-label="Dark theme"
                                title="Dark"
                            >
                                <svg
                                    className="w-5 h-5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
}
