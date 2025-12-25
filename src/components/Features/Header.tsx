import React from 'react';
import { Button } from '../ModernComponents';
import { Language } from '../../translations';

interface HeaderProps {
    title: string;
    subtitle: string;
    language: Language;
    setLanguage: (lang: Language) => void;
}

export const Header: React.FC<HeaderProps> = ({ title, subtitle, language, setLanguage }) => {
    return (
        <header className="w-full bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
                <div className="flex flex-col">
                    <h1 className="text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
                        <span className="text-blue-600">◆</span> {title}
                    </h1>
                </div>
                
                <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg">
                    <button 
                        onClick={() => setLanguage('zh')}
                        className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${language === 'zh' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        中文
                    </button>
                    <button 
                        onClick={() => setLanguage('en')}
                        className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${language === 'en' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        EN
                    </button>
                </div>
            </div>
        </header>
    );
};
