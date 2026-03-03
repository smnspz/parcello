import { useEffect } from 'react';

export interface ToastMessage {
    id: string;
    type: 'success' | 'error';
    text: string;
}

interface ToastProps {
    message: ToastMessage;
    onDismiss: (id: string) => void;
}

export function Toast({ message, onDismiss }: ToastProps) {
    useEffect(() => {
        const timer = setTimeout(() => {
            onDismiss(message.id);
        }, 3000);

        return () => clearTimeout(timer);
    }, [message.id, onDismiss]);

    return (
        <div
            className="rounded-md border backdrop-blur-md px-2 py-1.5 shadow-lg animate-slide-down mb-2"
            style={{
                backgroundColor:
                    message.type === 'success'
                        ? 'rgba(74, 124, 89, 0.2)'
                        : 'rgba(200, 146, 42, 0.2)',
                borderColor:
                    message.type === 'success'
                        ? 'var(--color-success)'
                        : 'var(--color-warning)',
                color: 'var(--color-text)',
            }}
            role="alert"
        >
            <strong className="block font-medium text-xs">
                {message.type === 'success' ? 'Success' : 'Error'}
            </strong>
            <p className="text-xs opacity-80">{message.text}</p>
        </div>
    );
}

interface ToastContainerProps {
    messages: ToastMessage[];
    onDismiss: (id: string) => void;
}

export function ToastContainer({ messages, onDismiss }: ToastContainerProps) {
    if (messages.length === 0) return null;

    // Only show the last 2 messages (most recent)
    const recentMessages = messages.slice(-2).reverse();

    return (
        <div
            className="fixed top-4 z-50 pointer-events-none"
            style={{
                left: '50%',
                transform: 'translateX(-50%)',
                width: 'calc(100% - 2rem)',
            }}
        >
            <div className="lg:ml-auto lg:mr-4 lg:w-80">
                {recentMessages.map((message) => (
                    <Toast
                        key={message.id}
                        message={message}
                        onDismiss={onDismiss}
                    />
                ))}
            </div>
        </div>
    );
}
