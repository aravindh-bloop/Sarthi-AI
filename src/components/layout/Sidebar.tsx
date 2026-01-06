import { useNavigate, NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    LayoutDashboard,
    Calendar,
    Sprout,
    Newspaper,
    Settings,
    Menu,
    X,
    LogOut,
    Archive
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase';
import LanguageSwitcher from '../LanguageSwitcher';

const navItems = [
    { icon: LayoutDashboard, label: 'navigation.dashboard', path: '/dashboard' },
    { icon: Calendar, label: 'navigation.planner', path: '/planner' },
    { icon: Sprout, label: 'navigation.health', path: '/health' },
    //   { icon: ClipboardList, label: 'Tasks', path: '/tasks' }, // Merged with Planner for now
    { icon: Newspaper, label: 'navigation.news', path: '/news' },
    { icon: Archive, label: 'navigation.inventory', path: '/inventory' },
    { icon: Settings, label: 'navigation.settings', path: '/settings' },
];

interface SidebarProps {
    isOpen: boolean;
    onToggle: () => void;
}

export default function Sidebar({ isOpen, onToggle }: SidebarProps) {
    const navigate = useNavigate();
    const { t } = useTranslation();

    const handleLogout = async () => {
        try {
            await signOut(auth);
            navigate('/login');
        } catch (error) {
            console.error("Logout failed", error);
        }
    };

    return (
        <>
            {/* --- MOBILE: Menu Button & Drawer --- */}

            {/* Mobile Menu Button */}
            <button
                onClick={onToggle}
                className="fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md lg:hidden text-gray-700 hover:text-green-600 transition-colors"
            >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Mobile Overlay */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onToggle}
                        className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
                    />
                )}
            </AnimatePresence>

            {/* Mobile Sidebar (Drawer) */}
            <aside className={`
                fixed top-0 left-0 z-40 h-screen bg-white shadow-2xl transition-transform duration-300 ease-in-out w-72 lg:hidden flex flex-col
                ${isOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                <div className="h-20 flex items-center px-6 border-b border-gray-100 justify-between">
                    <div className="flex items-center">
                        <img src="/sarthi_logo.png" alt="Sarthi AI" className="w-10 h-10 object-contain mr-3" />
                        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-emerald-600">
                            {t('app.title')}
                        </span>
                    </div>
                </div>

                {/* Mobile Language Switcher Area */}
                <div className="px-6 py-2">
                    <LanguageSwitcher />
                </div>

                <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            onClick={onToggle}
                            className={({ isActive }) => `
                                flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-200
                                ${isActive
                                    ? 'bg-green-50 text-green-700 font-semibold shadow-sm'
                                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}
                            `}
                        >
                            <item.icon className="w-5 h-5" />
                            <span>{t(item.label)}</span>
                        </NavLink>
                    ))}
                </nav>

                <div className="p-4 border-t border-gray-100 mb-safe">
                    <button onClick={handleLogout} className="flex items-center gap-3 w-full px-4 py-3 text-gray-500 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all">
                        <LogOut className="w-5 h-5" />
                        <span>{t('navigation.signOut')}</span>
                    </button>
                </div>
            </aside>


            {/* --- DESKTOP: Top Navigation Bar --- */}

            <header className="hidden lg:flex fixed top-0 w-full z-30 bg-white/70 backdrop-blur-md border-b border-white/50 shadow-sm h-16 items-center justify-between px-8 transition-colors">
                {/* Logo */}
                <div className="flex items-center gap-3">
                    <img src="/sarthi_logo.png" alt="Sarthi AI" className="w-10 h-10 object-contain" />
                    <span className="text-xl font-bold text-gray-800 tracking-tight">
                        {t('app.title')}
                    </span>
                </div>

                {/* Nav Links */}
                <nav className="flex items-center gap-1 bg-gray-100/50 p-1.5 rounded-2xl border border-gray-200/50">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) => `
                                flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 relative
                                ${isActive
                                    ? 'text-green-700 bg-white shadow-sm'
                                    : 'text-gray-500 hover:text-gray-800 hover:bg-gray-200/50'}
                            `}
                        >
                            {({ isActive }) => (
                                <>
                                    <item.icon className={`w-4 h-4 ${isActive ? 'fill-green-700/10' : ''}`} />
                                    <span>{t(item.label)}</span>
                                </>
                            )}
                        </NavLink>
                    ))}
                </nav>

                {/* Actions */}
                <div className="flex items-center gap-4">
                    <LanguageSwitcher />
                    <div className="h-8 w-px bg-gray-200" />
                    <button
                        onClick={handleLogout}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title={t('navigation.signOut')}
                    >
                        <LogOut className="w-5 h-5" />
                    </button>
                    <div className="w-9 h-9 bg-green-100/50 rounded-full border border-green-200 p-0.5">
                        <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="User" className="w-full h-full rounded-full" />
                    </div>
                </div>
            </header>
        </>
    );
}
