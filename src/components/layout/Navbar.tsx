import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  BookOpen,
  Globe,
  User,
  LogOut,
  Bell,
  Menu,
  X,
  Sparkles,
  Shield,
  GraduationCap,
  Users,
  ChevronDown,
} from 'lucide-react';
import { Role } from '../../types';

interface NavbarProps {
  onOpenAdmission: () => void;
  onOpenLogin: () => void;
  onOpenNotifications: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenAdmission,
  onOpenLogin,
  onOpenNotifications,
}) => {
  const {
    language,
    toggleLanguage,
    t,
    currentUser,
    currentRole,
    logout,
    currentView,
    setCurrentView,
    unreadNotificationsCount,
  } = useApp();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: t('home'), view: 'landing', href: '#home' },
    { name: t('about'), view: 'landing', href: '#about' },
    { name: t('courses'), view: 'landing', href: '#courses' },
    { name: t('howItWorks'), view: 'landing', href: '#how-it-works' },
    { name: t('admission'), action: onOpenAdmission },
    { name: t('contact'), view: 'landing', href: '#contact' },
  ];

  const handleLinkClick = (link: (typeof navLinks)[0]) => {
    if (link.action) {
      link.action();
    } else if (link.href) {
      if (currentView !== 'landing') {
        setCurrentView('landing');
      }
      const el = document.querySelector(link.href);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
    setMobileMenuOpen(false);
  };

  const getRoleBadge = (role?: Role | null) => {
    switch (role) {
      case 'super_admin':
        return { label: 'Super Admin', bg: 'bg-purple-100 text-purple-800 border-purple-200' };
      case 'admin':
        return { label: 'Admin', bg: 'bg-blue-100 text-blue-800 border-blue-200' };
      case 'teacher':
        return { label: 'Teacher', bg: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
      case 'student':
        return { label: 'Student', bg: 'bg-sky-100 text-sky-800 border-sky-200' };
      default:
        return { label: 'Guest', bg: 'bg-slate-100 text-slate-800 border-slate-200' };
    }
  };

  const roleInfo = getRoleBadge(currentRole);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      {/* Main Nav (Top bar removed per user request, public page strictly displays relevant info) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo */}
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => setCurrentView('landing')}
          >
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-700 to-blue-900 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl sm:text-2xl font-black tracking-tight text-blue-900 font-sans">
                  KANZ UT TAJWEED
                </span>
              </div>
              <p className="text-[11px] font-medium text-slate-500 tracking-wider">
                {language === 'ur' ? 'آن لائن قرآن و تجوید اکیڈمی' : 'ONLINE QUR’AN & TAJWEED ACADEMY'}
              </p>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {navLinks.map((link, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleLinkClick(link)}
                className="px-3 py-2 text-sm font-medium text-slate-700 hover:text-blue-600 rounded-lg hover:bg-blue-50/80 transition-colors"
              >
                {link.name}
              </button>
            ))}
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden sm:flex items-center gap-3">
            {/* Language Switcher: English | اردو */}
            <div className="flex items-center bg-slate-100 rounded-lg p-0.5 border border-slate-200 text-xs">
              <button
                type="button"
                onClick={() => language !== 'en' && toggleLanguage()}
                className={`px-2.5 py-1 rounded-md font-semibold transition-colors ${
                  language === 'en'
                    ? 'bg-white text-blue-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                English
              </button>
              <button
                type="button"
                onClick={() => language !== 'ur' && toggleLanguage()}
                className={`px-2.5 py-1 rounded-md font-semibold transition-colors ${
                  language === 'ur'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                اردو
              </button>
            </div>

            {currentUser ? (
              <div className="flex items-center gap-2">
                {/* Notifications Bell */}
                <button
                  type="button"
                  onClick={onOpenNotifications}
                  className="relative p-2 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors"
                  aria-label="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadNotificationsCount > 0 && (
                    <span className="absolute top-1 end-1 w-4 h-4 bg-red-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center animate-pulse">
                      {unreadNotificationsCount}
                    </span>
                  )}
                </button>

                {/* Dashboard Button */}
                <button
                  type="button"
                  onClick={() => setCurrentView('dashboard')}
                  className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all shadow-xs ${
                    currentView === 'dashboard'
                      ? 'bg-blue-700 text-white shadow-blue-500/20'
                      : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                  }`}
                >
                  <User className="w-4 h-4" />
                  <span>{t('dashboard')}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded border ${roleInfo.bg}`}>
                    {roleInfo.label}
                  </span>
                </button>

                {/* Logout Button */}
                <button
                  type="button"
                  onClick={logout}
                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title={t('logout')}
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={onOpenLogin}
                  className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-blue-700 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
                >
                  {t('login')}
                </button>

                <button
                  type="button"
                  onClick={onOpenAdmission}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 transition-all"
                >
                  <span>{t('applyForAdmission')}</span>
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu & Lang Button */}
          <div className="flex sm:hidden items-center gap-2">
            {/* Mobile Language Toggle */}
            <button
              type="button"
              onClick={toggleLanguage}
              className="px-2 py-1 rounded bg-slate-100 text-xs font-semibold text-slate-700 border border-slate-200"
            >
              {language === 'en' ? 'اردو' : 'English'}
            </button>

            <button
              type="button"
              onClick={onOpenNotifications}
              className="p-2 text-slate-600 relative"
            >
              <Bell className="w-5 h-5" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute top-1 end-1 w-3.5 h-3.5 bg-red-500 rounded-full" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-700 hover:bg-slate-100 rounded-lg"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3 shadow-xl animate-in slide-in-from-top-2 duration-200">
          {currentUser && (
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-semibold text-slate-500 uppercase">{t('role')}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium border ${roleInfo.bg}`}>
                {roleInfo.label}
              </span>
            </div>
          )}

          <div className="space-y-1">
            {navLinks.map((link, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleLinkClick(link)}
                className="w-full text-start px-3 py-2.5 text-base font-medium text-slate-800 hover:bg-blue-50 hover:text-blue-700 rounded-lg"
              >
                {link.name}
              </button>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-100 space-y-2">
            {currentUser ? (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setCurrentView('dashboard');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-2.5 px-4 text-center rounded-lg font-semibold bg-blue-600 text-white"
                >
                  {t('dashboard')} ({roleInfo.label})
                </button>
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-2.5 px-4 text-center rounded-lg font-semibold border border-red-200 text-red-600 hover:bg-red-50"
                >
                  {t('logout')}
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => {
                    onOpenLogin();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-2.5 px-4 text-center rounded-lg font-semibold border border-slate-300 text-slate-700 hover:bg-slate-50"
                >
                  {t('login')}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onOpenAdmission();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-2.5 px-4 text-center rounded-lg font-semibold bg-blue-600 text-white"
                >
                  {t('applyForAdmission')}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
