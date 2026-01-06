import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Languages, ChevronDown } from 'lucide-react';

export default function LanguageSwitcher() {
    const { i18n } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const changeLanguage = (lng: string) => {
        i18n.changeLanguage(lng);
        setIsOpen(false);
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`p-2 bg-white/80 hover:bg-white rounded-xl text-gray-600 hover:text-green-600 transition-colors shadow-sm flex items-center gap-2 ${isOpen ? 'ring-2 ring-green-100 bg-white text-green-700' : ''}`}
            >
                <Languages className="w-5 h-5" />
                <span className="text-sm font-medium hidden md:block">
                    {i18n.language === 'ta' ? 'தமிழ்' : 'English'}
                </span>
                <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''} opacity-50`} />
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-32 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50 animate-in fade-in zoom-in-95 duration-100">
                    <button
                        onClick={() => changeLanguage('en')}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-green-50 hover:text-green-700 transition-colors ${i18n.language === 'en' ? 'font-bold text-green-700 bg-green-50' : 'text-gray-700'
                            }`}
                    >
                        English
                    </button>
                    <button
                        onClick={() => changeLanguage('ta')}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-green-50 hover:text-green-700 transition-colors ${i18n.language === 'ta' ? 'font-bold text-green-700 bg-green-50' : 'text-gray-700'
                            }`}
                    >
                        தமிழ்
                    </button>
                </div>
            )}
        </div>
    );
}
