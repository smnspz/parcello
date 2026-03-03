import { useState, useRef, useEffect } from 'react';
import { ChevronDownIcon } from './icons';

interface DropdownOption {
    value: string;
    label: string;
}

interface DropdownMenuProps {
    label: string;
    value: string;
    options: DropdownOption[];
    placeholder?: string;
    onChange: (value: string) => void;
}

export default function DropdownMenu({
    label,
    value,
    options,
    placeholder = 'Select an option',
    onChange,
}: DropdownMenuProps) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const selectedOption = options.find((opt) => opt.value === value);

    return (
        <div className="w-full" ref={dropdownRef}>
            <label
                className="block text-sm font-medium mb-2"
                style={{ color: 'var(--color-text)' }}
            >
                {label}
            </label>
            <div className="relative">
                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex items-center justify-between w-full text-left px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors"
                    style={{
                        backgroundColor: 'var(--color-bg)',
                        borderColor: 'var(--color-border)',
                        color: selectedOption
                            ? 'var(--color-text)'
                            : 'var(--color-text-muted)',
                    }}
                    aria-haspopup="listbox"
                    aria-expanded={isOpen}
                >
                    <span>
                        {selectedOption ? selectedOption.label : placeholder}
                    </span>
                    <ChevronDownIcon
                        className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    />
                </button>

                <ul
                    className="w-full rounded-lg border overflow-hidden transition-all duration-300 ease-in-out"
                    style={{
                        backgroundColor: 'var(--color-surface)',
                        borderColor: 'var(--color-border)',
                        maxHeight: isOpen ? '300px' : '0',
                        marginTop: isOpen ? '0.75rem' : '0',
                        paddingTop: isOpen ? '0.5rem' : '0',
                        paddingBottom: isOpen ? '0.5rem' : '0',
                        borderWidth: isOpen ? '1px' : '0',
                    }}
                    role="listbox"
                >
                    {options.map((option) => {
                        const isSelected = value === option.value;
                        return (
                            <li
                                key={option.value}
                                onClick={() => {
                                    onChange(option.value);
                                    setIsOpen(false);
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        onChange(option.value);
                                        setIsOpen(false);
                                    }
                                }}
                                className={`px-4 py-2 cursor-pointer transition-colors ${!isSelected ? 'hover-bg-main' : ''}`}
                                style={{
                                    color: isSelected
                                        ? 'white'
                                        : 'var(--color-text)',
                                    backgroundColor: isSelected
                                        ? 'var(--color-accent)'
                                        : 'transparent',
                                }}
                                role="option"
                                aria-selected={isSelected}
                                tabIndex={0}
                            >
                                {option.label}
                            </li>
                        );
                    })}
                </ul>
            </div>
        </div>
    );
}
