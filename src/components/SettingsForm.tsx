import React, { useState, useEffect } from 'react';
import { EyeClosedIcon, EyeOpenIcon } from './icons';
import DropdownMenu from './DropdownMenu';
import {
    getOrCreateDeviceToken,
    loadUserConfig,
    saveUserConfig,
} from '../lib/utils/storage';
import { copyToClipboard } from '../lib/utils/clipboard';
import { ToastContainer, type ToastMessage } from './Toast';

export default function SettingsForm() {
    const [deviceCode, setDeviceCode] = useState<string>('');
    const [provider, setProvider] = useState<string>('');
    const [apiKey, setApiKey] = useState<string>('');
    const [showApiKey, setShowApiKey] = useState<boolean>(false);
    const [messages, setMessages] = useState<ToastMessage[]>([]);

    // Load saved config on mount
    useEffect(() => {
        const token = localStorage.getItem('userToken');
        if (token) {
            setDeviceCode(token);
        }

        const config = loadUserConfig();
        if (config) {
            setProvider(config.provider);
            setApiKey(config.apiKey);
        }
    }, []);

    // Add a toast message
    const addMessage = (type: 'success' | 'error', text: string) => {
        const newMessage: ToastMessage = {
            id: Date.now().toString() + Math.random(),
            type,
            text,
        };
        setMessages((prev) => [...prev, newMessage]);
    };

    // Dismiss a toast message
    const dismissMessage = (id: string) => {
        setMessages((prev) => prev.filter((msg) => msg.id !== id));
    };

    // Generate new device code
    const generateDeviceCode = async () => {
        const newToken = getOrCreateDeviceToken();
        setDeviceCode(newToken);

        try {
            await copyToClipboard(newToken);
            addMessage('success', 'Device code generated and copied!');
        } catch {
            addMessage('error', 'Device code generated but failed to copy');
        }
    };

    // Save configuration
    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();

        if (!deviceCode) {
            addMessage('error', 'Please generate or enter a device code');
            return;
        }

        if (!provider) {
            addMessage('error', 'Please select a provider');
            return;
        }

        if (!apiKey) {
            addMessage('error', 'Please enter an API key');
            return;
        }

        try {
            // Save device code
            localStorage.setItem('userToken', deviceCode);
            // Save provider config
            saveUserConfig(provider, apiKey);
            addMessage('success', 'Settings saved successfully!');
        } catch {
            addMessage('error', 'Failed to save settings');
        }
    };

    return (
        <>
            <ToastContainer messages={messages} onDismiss={dismissMessage} />
            <div className="max-w-2xl mx-auto">
                {/* Unified Settings Form */}
                <form
                    onSubmit={handleSave}
                    className="rounded-lg border p-6"
                    style={{
                        backgroundColor: 'var(--color-surface)',
                        borderColor: 'var(--color-border)',
                    }}
                >
                    <h2
                        className="text-lg font-semibold mb-6"
                        style={{ color: 'var(--color-text)' }}
                    >
                        Settings
                    </h2>

                    {/* Device Code */}
                    <div className="mb-6">
                        <label
                            htmlFor="deviceCode"
                            className="block text-sm font-medium mb-2"
                            style={{ color: 'var(--color-text)' }}
                        >
                            Device Code
                        </label>
                        <p
                            className="text-xs mb-2"
                            style={{ color: 'var(--color-text-muted)' }}
                        >
                            Your unique device identifier. Generate a new one or
                            enter an existing code.
                        </p>
                        <div className="flex gap-2">
                            <input
                                id="deviceCode"
                                type="text"
                                value={deviceCode}
                                onChange={(e) => setDeviceCode(e.target.value)}
                                className="flex-1 px-4 py-2 rounded-lg border font-mono text-sm"
                                style={{
                                    backgroundColor: 'var(--color-bg)',
                                    borderColor: 'var(--color-border)',
                                    color: 'var(--color-text)',
                                }}
                                placeholder="Enter or generate a device code"
                            />
                            <button
                                type="button"
                                onClick={generateDeviceCode}
                                className="px-4 py-2 rounded-lg border font-medium transition-opacity hover:opacity-80 whitespace-nowrap"
                                style={{
                                    backgroundColor: 'var(--color-surface)',
                                    borderColor: 'var(--color-border)',
                                    color: 'var(--color-text)',
                                }}
                                aria-label="Generate device code"
                            >
                                Generate
                            </button>
                        </div>
                    </div>

                    {/* Provider Selector */}
                    <div className="mb-6">
                        <p
                            className="text-xs mb-4"
                            style={{ color: 'var(--color-text-muted)' }}
                        >
                            These fields are only needed if your carrier is not
                            automatically supported.{' '}
                            <a
                                href="https://www.trackingmore.com/supported-carriers.html"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="underline hover:no-underline"
                                style={{ color: 'var(--color-accent)' }}
                            >
                                View supported carriers
                            </a>
                        </p>
                        <DropdownMenu
                            label="Tracking Provider"
                            value={provider}
                            onChange={setProvider}
                            placeholder="Select a provider"
                            options={[
                                {
                                    value: 'trackingmore',
                                    label: 'TrackingMore',
                                },
                                { value: '17track', label: '17TRACK' },
                            ]}
                            required
                        />
                    </div>

                    {/* API Key Input */}
                    <div className="mb-6">
                        <label
                            htmlFor="apiKey"
                            className="block text-sm font-medium mb-2"
                            style={{ color: 'var(--color-text)' }}
                        >
                            API Key
                        </label>
                        <div className="flex gap-2">
                            <input
                                id="apiKey"
                                type={showApiKey ? 'text' : 'password'}
                                value={apiKey}
                                onChange={(e) => setApiKey(e.target.value)}
                                className="flex-1 px-4 py-2 rounded-lg border"
                                style={{
                                    backgroundColor: 'var(--color-bg)',
                                    borderColor: 'var(--color-border)',
                                    color: 'var(--color-text)',
                                }}
                                placeholder="Enter your API key"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowApiKey(!showApiKey)}
                                className="w-12 p-2 rounded-lg border transition-opacity hover:opacity-80 flex items-center justify-center"
                                style={{
                                    backgroundColor: 'var(--color-surface)',
                                    borderColor: 'var(--color-border)',
                                    color: 'var(--color-text)',
                                }}
                                aria-label={
                                    showApiKey ? 'Hide API key' : 'Show API key'
                                }
                            >
                                {showApiKey ? (
                                    <EyeClosedIcon />
                                ) : (
                                    <EyeOpenIcon />
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Save Button */}
                    <div className="flex justify-end">
                        <button
                            type="submit"
                            className="px-6 py-2 rounded-lg font-medium transition-opacity hover:opacity-90"
                            style={{
                                backgroundColor: 'var(--color-accent)',
                                color: 'white',
                            }}
                        >
                            Save Settings
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
}
