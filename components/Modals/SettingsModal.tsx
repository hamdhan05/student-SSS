import Modal from '@/components/UI/Modal';
import { useTheme } from '@/lib/context/ThemeContext';
import Button from '@/components/UI/Button';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
    const { theme, toggleTheme, fontSize, setFontSize } = useTheme();

    if (!isOpen) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Settings">
            <div className="space-y-8">
                {/* Theme Settings */}
                <div>
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <span>🎨</span> Appearance
                    </h3>
                    <div className="bg-white bg-opacity-5 rounded-lg p-4 border border-gray-700">
                        <div className="flex items-center justify-between">
                            <span className="text-gray-300">Theme Mode</span>
                            <button
                                onClick={toggleTheme}
                                className={`relative inline-flex h-8 w-16 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${theme === 'dark' ? 'bg-blue-600' : 'bg-gray-600'
                                    }`}
                            >
                                <span
                                    className={`${theme === 'dark' ? 'translate-x-9' : 'translate-x-1'
                                        } inline-block h-6 w-6 transform rounded-full bg-white transition-transform duration-200 shadow-sm`}
                                />
                                <span className="sr-only">Toggle Theme</span>
                            </button>
                        </div>
                        <p className="text-sm text-gray-400 mt-2">
                            Current: <span className="capitalize text-white font-medium">{theme}</span>
                        </p>
                    </div>
                </div>

                {/* Font Size Settings */}
                <div>
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <span>Aa</span> Typography
                    </h3>
                    <div className="bg-white bg-opacity-5 rounded-lg p-4 border border-gray-700">
                        <label className="block text-sm text-gray-300 mb-4">Font Size scaling</label>
                        <div className="flex items-center justify-between gap-2 bg-black bg-opacity-30 p-1 rounded-lg">
                            {(['normal', 'large', 'xlarge'] as const).map((size) => (
                                <button
                                    key={size}
                                    onClick={() => setFontSize(size)}
                                    className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${fontSize === size
                                        ? 'bg-blue-600 text-white shadow-md'
                                        : 'text-gray-400 hover:text-white hover:bg-white hover:bg-opacity-5'
                                        }`}
                                >
                                    {size === 'normal' ? 'Normal' : size === 'large' ? 'Large' : 'Extra Large'}
                                </button>
                            ))}
                        </div>
                        <div className="mt-4 p-3 bg-white bg-opacity-5 rounded text-gray-300 border-l-4 border-blue-500">
                            <p style={{ fontSize: fontSize === 'normal' ? '1rem' : fontSize === 'large' ? '1.1rem' : '1.25rem' }}>
                                The quick brown fox jumps over the lazy dog.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-gray-700">
                    <Button onClick={onClose} className="bg-white text-black hover:bg-gray-200">
                        Done
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
