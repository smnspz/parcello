/**
 * Copy text to clipboard with fallback for older browsers/mobile
 */
export async function copyToClipboard(text: string): Promise<void> {
    try {
        // Try modern clipboard API first
        if (navigator.clipboard && navigator.clipboard.writeText) {
            await navigator.clipboard.writeText(text);
            return;
        }

        // Fallback for older browsers/mobile
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);

        if (!successful) {
            throw new Error('Copy command failed');
        }
    } catch (error) {
        console.error('Copy error:', error);
        throw error;
    }
}
