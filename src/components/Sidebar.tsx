import { useState } from 'react';

export default function Sidebar() {
    const [isOpen, setIsOpen] = useState(false);
    const [openSection, setOpenSection] = useState<string>('shipments');

    const toggleSection = (section: string) => {
        setOpenSection(openSection === section ? '' : section);
    };

    return (
        <>
            {/* Mobile menu button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed top-4 left-4 z-50 p-2 rounded-lg lg:hidden focus:outline-none focus:ring-2"
                style={{
                    backgroundColor: 'var(--color-surface)',
                    color: 'var(--color-text)',
                    borderColor: 'var(--color-border)',
                }}
                aria-label="Toggle sidebar"
            >
                <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    {isOpen ? (
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                        />
                    ) : (
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 6h16M4 12h16M4 18h16"
                        />
                    )}
                </svg>
            </button>

            {/* Backdrop for mobile */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-30 bg-black bg-opacity-50 lg:hidden"
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
                                    className="flex items-center px-3 py-2 rounded-lg transition-colors"
                                    style={{ color: 'var(--color-text)' }}
                                    onMouseEnter={(e) =>
                                        (e.currentTarget.style.backgroundColor =
                                            'var(--color-bg)')
                                    }
                                    onMouseLeave={(e) =>
                                        (e.currentTarget.style.backgroundColor =
                                            'transparent')
                                    }
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
                                            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                                        />
                                    </svg>
                                    <span className="ml-3">Dashboard</span>
                                </a>
                                <a
                                    href="/packages"
                                    className="flex items-center px-3 py-2 rounded-lg transition-colors"
                                    style={{ color: 'var(--color-text)' }}
                                    onMouseEnter={(e) =>
                                        (e.currentTarget.style.backgroundColor =
                                            'var(--color-bg)')
                                    }
                                    onMouseLeave={(e) =>
                                        (e.currentTarget.style.backgroundColor =
                                            'transparent')
                                    }
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
                                            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                                        />
                                    </svg>
                                    <span className="ml-3">All Packages</span>
                                </a>
                                <a
                                    href="/in-transit"
                                    className="flex items-center px-3 py-2 rounded-lg transition-colors"
                                    style={{ color: 'var(--color-text)' }}
                                    onMouseEnter={(e) =>
                                        (e.currentTarget.style.backgroundColor =
                                            'var(--color-bg)')
                                    }
                                    onMouseLeave={(e) =>
                                        (e.currentTarget.style.backgroundColor =
                                            'transparent')
                                    }
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
                                            d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                                        />
                                    </svg>
                                    <span className="ml-3">In Transit</span>
                                </a>
                                <a
                                    href="/delivered"
                                    className="flex items-center px-3 py-2 rounded-lg transition-colors"
                                    style={{ color: 'var(--color-text)' }}
                                    onMouseEnter={(e) =>
                                        (e.currentTarget.style.backgroundColor =
                                            'var(--color-bg)')
                                    }
                                    onMouseLeave={(e) =>
                                        (e.currentTarget.style.backgroundColor =
                                            'transparent')
                                    }
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
                                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                        />
                                    </svg>
                                    <span className="ml-3">Delivered</span>
                                </a>
                            </div>
                        </div>

                        {/* Settings Section */}
                        <div>
                            <button
                                onClick={() => toggleSection('settings')}
                                className="flex items-center justify-between w-full px-3 mb-2 text-xs font-semibold uppercase transition-colors"
                                style={{ color: 'var(--color-text-muted)' }}
                            >
                                <span>Settings</span>
                                <svg
                                    className={`w-4 h-4 transform transition-transform ${openSection === 'settings' ? 'rotate-180' : ''}`}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M19 9l-7 7-7-7"
                                    />
                                </svg>
                            </button>
                            {openSection === 'settings' && (
                                <div className="space-y-1 mt-2">
                                    <a
                                        href="/settings"
                                        className="flex items-center px-3 py-2 rounded-lg transition-colors"
                                        style={{ color: 'var(--color-text)' }}
                                        onMouseEnter={(e) =>
                                            (e.currentTarget.style.backgroundColor =
                                                'var(--color-bg)')
                                        }
                                        onMouseLeave={(e) =>
                                            (e.currentTarget.style.backgroundColor =
                                                'transparent')
                                        }
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
                                                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                                            />
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                            />
                                        </svg>
                                        <span className="ml-3">
                                            Provider Config
                                        </span>
                                    </a>
                                    <a
                                        href="/settings#device-code"
                                        className="flex items-center px-3 py-2 rounded-lg transition-colors"
                                        style={{ color: 'var(--color-text)' }}
                                        onMouseEnter={(e) =>
                                            (e.currentTarget.style.backgroundColor =
                                                'var(--color-bg)')
                                        }
                                        onMouseLeave={(e) =>
                                            (e.currentTarget.style.backgroundColor =
                                                'transparent')
                                        }
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
                                                d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                                            />
                                        </svg>
                                        <span className="ml-3">
                                            Device Code
                                        </span>
                                    </a>
                                </div>
                            )}
                        </div>
                    </nav>
                </div>
            </aside>
        </>
    );
}
