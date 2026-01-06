import React, { useState } from 'react';
import Sidebar from './Sidebar';


interface DashboardLayoutProps {
    children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <div className="min-h-screen bg-gradient-to-br from-stone-200 via-neutral-200 to-slate-300 flex flex-col">
            <Sidebar isOpen={isMobileMenuOpen} onToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)} />

            {/* Main Content Area */}
            <main className="flex-1 relative min-h-screen pt-20 px-4 md:px-8 pb-8 transition-all duration-300 w-full max-w-[1600px] mx-auto">
                {children}
            </main>
        </div>
    );
}
