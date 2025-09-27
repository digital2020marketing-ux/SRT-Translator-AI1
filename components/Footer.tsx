
import React from 'react';

const Footer: React.FC = () => {
    return (
        <footer className="w-full py-6 mt-12 bg-slate-100 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700">
            <div className="container mx-auto px-4 text-center text-sm text-slate-500 dark:text-slate-400">
                <p>Software ini dibuat oleh Dede Hery Suryana.</p>
                <p className="mt-1">Isi materi terjemahan di luar tanggung jawab pembuat.</p>
            </div>
        </footer>
    );
};

export default Footer;
