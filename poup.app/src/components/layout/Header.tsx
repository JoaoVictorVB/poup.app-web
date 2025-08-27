import { ChevronDown, LogOut, User } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import type { ActiveView } from '../../types';

interface HeaderProps {
  onNavigate: (view: ActiveView) => void;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ onNavigate, onLogout }) => {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [dropdownRef]);

    return (
        <header className="bg-white shadow-sm sticky top-0 z-30">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <div className="flex items-center space-x-2">
                        <svg className="w-8 h-8 text-blue-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20Z" fill="currentColor"/><path d="M12 6C9.79 6 8 7.79 8 10C8 12.21 9.79 14 12 14C14.21 14 16 12.21 16 10C16 7.79 14.21 6 12 6ZM12 12C10.9 12 10 11.1 10 10C10 8.9 10.9 8 12 8C13.1 8 14 8.9 14 10C14 11.1 13.1 12 12 12Z" fill="currentColor"/></svg>
                        <h1 className="text-2xl font-bold text-gray-800">poup.app</h1>
                    </div>
                    <div className="relative" ref={dropdownRef}>
                        <button onClick={() => setDropdownOpen(!dropdownOpen)} className="flex items-center space-x-3 cursor-pointer p-2 rounded-lg hover:bg-gray-100">
                            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 font-semibold">B</div>
                            <span className="text-gray-700 font-medium hidden sm:block">bellamy</span>
                            <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                        </button>
                        {dropdownOpen && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-40">
                                <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('profile'); setDropdownOpen(false); }} className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"><User size={16} className="mr-2" /> Perfil</a>
                                <a href="#" onClick={(e) => { e.preventDefault(); onLogout(); setDropdownOpen(false); }} className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"><LogOut size={16} className="mr-2" /> Sair</a>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;