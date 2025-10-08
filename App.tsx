
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { translateSrt } from './services/geminiService';
import Header from './components/Header';
import Footer from './components/Footer';
import BackToTopButton from './components/BackToTopButton';
import { SparklesIcon, TranslateIcon, UserIcon, ClipboardIcon, ClipboardCheckIcon, TrashIcon, ArrowUpTrayIcon, ArrowDownTrayIcon, KeyIcon } from './components/IconComponents';

const App: React.FC = () => {
    const [theme, setTheme] = useState<'light' | 'dark'>('dark');
    
    const [apiKey, setApiKey] = useState<string>('');
    const [tempApiKey, setTempApiKey] = useState<string>('');
    const [isApiKeySubmitted, setIsApiKeySubmitted] = useState<boolean>(false);

    const [userName, setUserName] = useState<string>('');
    const [tempUserName, setTempUserName] = useState<string>('');
    const [isNameSubmitted, setIsNameSubmitted] = useState<boolean>(false);
    
    const [inputText, setInputText] = useState<string>('');
    const [outputText, setOutputText] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [isCopied, setIsCopied] = useState<boolean>(false);
    const [originalFileName, setOriginalFileName] = useState<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [theme]);

    useEffect(() => {
        const storedApiKey = localStorage.getItem('gemini-api-key');
        if (storedApiKey) {
            setApiKey(storedApiKey);
            setIsApiKeySubmitted(true);
        }
    }, []);

    const toggleTheme = () => {
        setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
    };

    const handleApiKeySubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (tempApiKey.trim()) {
            const trimmedKey = tempApiKey.trim();
            setApiKey(trimmedKey);
            localStorage.setItem('gemini-api-key', trimmedKey);
            setIsApiKeySubmitted(true);
        }
    };

    const handleNameSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (tempUserName.trim()) {
            setUserName(tempUserName.trim());
            setIsNameSubmitted(true);
        }
    };

    const handleTranslate = useCallback(async () => {
        if (!inputText.trim()) {
            setError("Please enter some SRT text to translate.");
            return;
        }
        if (!apiKey) {
            setError("API Key tidak ditemukan. Mohon segarkan halaman dan masukkan kembali.");
            setIsApiKeySubmitted(false); // Force re-entry
            return;
        }

        setIsLoading(true);
        setError(null);
        setOutputText('');
        setIsCopied(false);

        try {
            const result = await translateSrt(inputText, apiKey);
            setOutputText(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : "An unknown error occurred.");
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [inputText, apiKey]);
    
    const fallbackCopyTextToClipboard = (text: string) => {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        
        textArea.style.top = "0";
        textArea.style.left = "0";
        textArea.style.position = "fixed";

        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        try {
            const successful = document.execCommand('copy');
            if (successful) {
                setIsCopied(true);
                setTimeout(() => setIsCopied(false), 2000);
            } else {
                 setError('Gagal menyalin teks.');
            }
        } catch (err) {
            console.error('Fallback copy failed:', err);
            setError('Gagal menyalin teks.');
        }

        document.body.removeChild(textArea);
    };

    const handleCopy = () => {
        if (!outputText) return;

        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(outputText).then(() => {
                setIsCopied(true);
                setTimeout(() => setIsCopied(false), 2000);
            }).catch(err => {
                console.error('Async copy failed:', err);
                fallbackCopyTextToClipboard(outputText);
            });
        } else {
            fallbackCopyTextToClipboard(outputText);
        }
    };

    const handleClear = () => {
        setInputText('');
        setOutputText('');
        setError(null);
        setOriginalFileName(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };
    
    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setOriginalFileName(file.name);
            const reader = new FileReader();
            reader.onload = (event) => {
                setInputText(event.target?.result as string);
            };
            reader.onerror = () => {
                setError("Gagal membaca file. Silakan coba lagi.");
            };
            reader.readAsText(file);
        }
    };

    const handleDownload = () => {
        if (!outputText) return;

        const fileName = originalFileName
            ? originalFileName.replace(/\.srt$/i, '') + '_indo.srt'
            : 'translated_subtitle_indo.srt';

        const blob = new Blob([outputText], { type: 'text/srt;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const ApiKeyInputScreen = () => (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 animate-fade-in">
            <div className="w-full max-w-md text-center bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700">
                <KeyIcon className="w-16 h-16 mx-auto text-brand-primary" />
                <h1 className="text-3xl font-bold mt-4 text-slate-900 dark:text-white">Masukkan API Key Anda</h1>
                <p className="mt-2 text-slate-600 dark:text-slate-400">
                    Untuk menggunakan alat ini, Anda memerlukan Google AI API key. Kunci Anda akan disimpan dengan aman di browser Anda.
                </p>
                 <p className="mt-2 text-sm text-slate-500">
                    Belum punya kunci? Dapatkan di{' '}
                    <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-brand-primary hover:underline">
                        Google AI Studio
                    </a>.
                </p>
                <form onSubmit={handleApiKeySubmit} className="mt-8 flex flex-col gap-4">
                    <div className="relative">
                        <KeyIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                            type="password"
                            value={tempApiKey}
                            onChange={(e) => setTempApiKey(e.target.value)}
                            placeholder="Masukkan Google AI API Key Anda"
                            className="w-full pl-10 pr-4 py-3 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-brand-primary focus:outline-none transition"
                            required
                        />
                    </div>
                    <button type="submit" className="w-full bg-brand-primary hover:bg-brand-secondary text-white font-bold py-3 px-4 rounded-lg transition duration-300 transform hover:scale-105 shadow-lg">
                        Simpan & Lanjutkan
                    </button>
                </form>
            </div>
        </div>
    );

    const NameInputScreen = () => (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 animate-fade-in">
            <div className="w-full max-w-md text-center bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700">
                <SparklesIcon className="w-16 h-16 mx-auto text-brand-primary" />
                <h1 className="text-3xl font-bold mt-4 text-slate-900 dark:text-white">Selamat Datang, Kak!</h1>
                <p className="mt-2 text-slate-600 dark:text-slate-400">Ini adalah AI Penerjemah Subtitle. Boleh tahu nama Kakak siapa?</p>
                <form onSubmit={handleNameSubmit} className="mt-8 flex flex-col gap-4">
                    <div className="relative">
                        <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                            type="text"
                            value={tempUserName}
                            onChange={(e) => setTempUserName(e.target.value)}
                            placeholder="Masukkan nama Anda"
                            className="w-full pl-10 pr-4 py-3 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-brand-primary focus:outline-none transition"
                            required
                        />
                    </div>
                    <button type="submit" className="w-full bg-brand-primary hover:bg-brand-secondary text-white font-bold py-3 px-4 rounded-lg transition duration-300 transform hover:scale-105 shadow-lg">
                        Mulai Menerjemahkan
                    </button>
                </form>
            </div>
        </div>
    );

    const TranslatorScreen = () => (
        <div className="flex flex-col min-h-screen">
            <Header theme={theme} toggleTheme={toggleTheme} userName={userName} />
            <main className="flex-grow container mx-auto px-4 py-8 mt-20">
                <div className="text-center mb-8 animate-slide-in-up">
                    <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-5xl md:text-6xl">
                        SRT <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-brand-secondary">Subtitle</span> Translator
                    </h1>
                    <p className="mt-4 max-w-2xl mx-auto text-lg text-slate-600 dark:text-slate-400">
                        Unggah atau tempel konten SRT Anda untuk mendapatkan terjemahan Bahasa Indonesia berkualitas premium.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10">
                    {/* Input Column */}
                    <div className="flex flex-col animate-slide-in-up" style={{ animationDelay: '100ms' }}>
                        <label htmlFor="input-srt" className="text-lg font-semibold mb-2">English SRT</label>
                        <textarea
                            id="input-srt"
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            placeholder="1&#10;00:00:10,000 --> 00:00:12,000&#10;Break a leg, buddy!"
                            className="w-full h-96 p-4 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl shadow-sm focus:ring-2 focus:ring-brand-primary focus:outline-none transition resize-none text-sm font-mono"
                        />
                         <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept=".srt" className="hidden" aria-hidden="true" />
                        <div className="mt-4 flex items-stretch gap-4">
                            <button
                                onClick={handleTranslate}
                                disabled={isLoading || !inputText.trim()}
                                className="flex-grow w-full flex items-center justify-center gap-2 bg-brand-primary hover:bg-brand-secondary text-white font-bold py-3 px-4 rounded-lg transition duration-300 transform hover:scale-105 shadow-lg disabled:bg-slate-400 disabled:dark:bg-slate-600 disabled:cursor-not-allowed disabled:transform-none"
                            >
                                {isLoading ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Menerjemahkan...
                                    </>
                                ) : (
                                    <>
                                        <TranslateIcon className="w-5 h-5" />
                                        Terjemahkan
                                    </>
                                )}
                            </button>
                             <button
                                onClick={handleUploadClick}
                                disabled={isLoading}
                                title="Unggah File"
                                aria-label="Unggah file SRT"
                                className="flex-shrink-0 flex items-center justify-center gap-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-bold py-3 px-4 rounded-lg transition duration-300 transform hover:scale-105 shadow-lg disabled:bg-slate-100 disabled:dark:bg-slate-800 disabled:text-slate-400 disabled:dark:text-slate-500 disabled:cursor-not-allowed disabled:transform-none"
                            >
                                <ArrowUpTrayIcon className="w-6 h-6" />
                            </button>
                            <button
                                onClick={handleClear}
                                disabled={(!inputText && !outputText) || isLoading}
                                title="Bersihkan"
                                aria-label="Bersihkan input dan output"
                                className="flex-shrink-0 flex items-center justify-center gap-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-bold py-3 px-4 rounded-lg transition duration-300 transform hover:scale-105 shadow-lg disabled:bg-slate-100 disabled:dark:bg-slate-800 disabled:text-slate-400 disabled:dark:text-slate-500 disabled:cursor-not-allowed disabled:transform-none"
                            >
                                <TrashIcon className="w-6 h-6" />
                            </button>
                        </div>
                    </div>

                    {/* Output Column */}
                    <div className="flex flex-col animate-slide-in-up" style={{ animationDelay: '200ms' }}>
                        <div className="flex justify-between items-center mb-2">
                             <label htmlFor="output-srt" className="text-lg font-semibold">Indonesian SRT</label>
                             {outputText && (
                                <div className="flex items-center gap-4">
                                    <button onClick={handleCopy} className="flex items-center gap-1.5 text-sm font-medium text-brand-primary hover:text-brand-secondary transition">
                                        {isCopied ? <ClipboardCheckIcon className="w-4 h-4 text-green-500"/> : <ClipboardIcon className="w-4 h-4"/>}
                                        {isCopied ? 'Disalin!' : 'Salin'}
                                    </button>
                                     <button onClick={handleDownload} className="flex items-center gap-1.5 text-sm font-medium text-brand-primary hover:text-brand-secondary transition">
                                        <ArrowDownTrayIcon className="w-4 h-4" />
                                        Unduh
                                    </button>
                                </div>
                             )}
                        </div>
                        <div className="w-full h-96 p-4 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl shadow-sm relative overflow-auto text-sm font-mono">
                            {isLoading && <div className="absolute inset-0 flex items-center justify-center bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
                                <p className="text-lg font-semibold">AI sedang berpikir...</p>
                            </div>}
                            {error && <div className="text-red-500 font-semibold p-4">{error}</div>}
                            <pre className="whitespace-pre-wrap break-words">{outputText}</pre>
                        </div>
                         {outputText && (
                            <div className="mt-4 p-3 bg-blue-100 dark:bg-blue-900/50 border border-blue-200 dark:border-blue-800 rounded-lg text-sm text-blue-800 dark:text-blue-200">
                                <p><strong>Tips:</strong> Ingat untuk menyimpan hasil dengan nama <strong>[nama_file]_subtitle_indo.srt</strong></p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
            <Footer />
            <BackToTopButton />
        </div>
    );

    if (!isApiKeySubmitted) {
        return <ApiKeyInputScreen />;
    }

    if (!isNameSubmitted) {
        return <NameInputScreen />;
    }

    return <TranslatorScreen />;
};

export default App;
