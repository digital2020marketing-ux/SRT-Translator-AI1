
import React, { useState, useEffect } from 'react';
import { SunIcon, MoonIcon, SparklesIcon } from './IconComponents';

interface HeaderProps {
    theme: 'light' | 'dark';
    toggleTheme: () => void;
    userName: string;
}

const Header: React.FC<HeaderProps> = ({ theme, toggleTheme, userName }) => {
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm shadow-md' : 'bg-transparent'}`}>
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center h-20">
                    <div className="flex items-center gap-3">
                       <SparklesIcon className="w-8 h-8 text-brand-primary" />
                        <span className="text-xl font-bold tracking-tight text-slate-800 dark:text-slate-200">
                           Halo, {userName}!
                        </span>
                    </div>
                    <button
                        onClick={toggleTheme}
                        className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary dark:focus:ring-offset-slate-900 transition-colors"
                        aria-label="Toggle Dark Mode"
                    >
                        {theme === 'dark' ? <SunIcon className="w-6 h-6" /> : <MoonIcon className="w-6 h-6" />}
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Header;
