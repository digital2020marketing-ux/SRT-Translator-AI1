
import React, { useState, useEffect, useCallback } from 'react';
import { translateSrt } from './services/geminiService';
import Header from './components/Header';
import Footer from './components/Footer';
import BackToTopButton from './components/BackToTopButton';
import { SparklesIcon, TranslateIcon, UserIcon, ClipboardIcon, ClipboardCheckIcon } from './components/IconComponents';

const App: React.FC = () => {
    const [theme, setTheme] = useState<'light' | 'dark'>('dark');
    const [userName, setUserName] = useState<string>('');
    const [tempUserName, setTempUserName] = useState<string>('');
    const [isNameSubmitted, setIsNameSubmitted] = useState<boolean>(false);
    
    const [inputText, setInputText] = useState<string>('');
    const [outputText, setOutputText] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [isCopied, setIsCopied] = useState<boolean>(false);

    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
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
        setIsLoading(true);
        setError(null);
        setOutputText('');
        setIsCopied(false);

        try {
            const result = await translateSrt(inputText);
            setOutputText(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : "An unknown error occurred.");
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [inputText]);
    
    const handleCopy = () => {
        if(outputText) {
            navigator.clipboard.writeText(outputText);
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        }
    };

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
                        Cukup tempel konten SRT Anda di bawah ini untuk mendapatkan terjemahan Bahasa Indonesia berkualitas premium.
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
                        <button
                            onClick={handleTranslate}
                            disabled={isLoading}
                            className="mt-4 w-full flex items-center justify-center gap-2 bg-brand-primary hover:bg-brand-secondary text-white font-bold py-3 px-4 rounded-lg transition duration-300 transform hover:scale-105 shadow-lg disabled:bg-slate-400 disabled:dark:bg-slate-600 disabled:cursor-not-allowed disabled:transform-none"
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
                    </div>

                    {/* Output Column */}
                    <div className="flex flex-col animate-slide-in-up" style={{ animationDelay: '200ms' }}>
                        <div className="flex justify-between items-center mb-2">
                             <label htmlFor="output-srt" className="text-lg font-semibold">Indonesian SRT</label>
                             {outputText && (
                                <button onClick={handleCopy} className="flex items-center gap-1.5 text-sm font-medium text-brand-primary hover:text-brand-secondary transition">
                                    {isCopied ? <ClipboardCheckIcon className="w-4 h-4 text-green-500"/> : <ClipboardIcon className="w-4 h-4"/>}
                                    {isCopied ? 'Disalin!' : 'Salin'}
                                </button>
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

    return isNameSubmitted ? <TranslatorScreen /> : <NameInputScreen />;
};

export default App;
