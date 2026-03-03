export default function ChevronDownIcon({
    className = 'w-4 h-4',
}: {
    className?: string;
}) {
    return (
        <svg
            className={className}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
        >
            <path
                d="M6 9L12 15L18 9"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}
