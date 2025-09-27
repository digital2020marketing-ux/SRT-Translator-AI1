
import React, { useState, useEffect } from 'react';
import { ArrowUpIcon } from './IconComponents';

const BackToTopButton: React.FC = () => {
    const [isVisible, setIsVisible] = useState(false);

    const toggleVisibility = () => {
        if (window.pageYOffset > 300) {
            setIsVisible(true);
        } else {
            setIsVisible(false);
        }
    };

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth',
        });
    };

    useEffect(() => {
        window.addEventListener('scroll', toggleVisibility);
        return () => {
            window.removeEventListener('scroll', toggleVisibility);
        };
    }, []);

    return (
        <button
            type="button"
            onClick={scrollToTop}
            className={`fixed bottom-5 right-5 p-3 rounded-full bg-brand-primary text-white shadow-lg hover:bg-brand-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary dark:focus:ring-offset-slate-900 transition-all duration-300 transform ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
            aria-label="Scroll to top"
        >
            <ArrowUpIcon className="w-6 h-6" />
        </button>
    );
};

export default BackToTopButton;
