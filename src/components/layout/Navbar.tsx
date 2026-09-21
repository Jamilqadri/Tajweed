import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  BookOpen,
  User,
  LogOut,
  Bell,
  Menu,
  X,
  LayoutDashboard,
  UserCheck,
  GraduationCap,
  Users,
  Calendar,
  Layers,
  CreditCard,
  FileSpreadsheet,
  Settings,
  Shield,
  History,
  Clock,
  Globe,
  ExternalLink,
} from 'lucide-react';
import { Role } from '../../types';
import { TeacherGenderIcon } from '../common/TeacherGenderIcon';

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
    currentAdmin,
    currentTeacher,
    activeTab,
    setActiveTab,
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

  const getRoleNavItems = () => {
    if (currentRole === 'super_admin') {
      return [
        { id: 'overview', label: t('menuOverview'), icon: LayoutDashboard },
        { id: 'admin_management', label: t('menuAdminManagement'), icon: Shield },
        { id: 'admissions', label: t('menuAdmissions'), icon: UserCheck },
        { id: 'students', label: t('menuStudents'), icon: Users },
        { id: 'teachers', label: t('menuTeachers'), icon: GraduationCap },
        { id: 'courses', label: t('menuCourses'), icon: BookOpen },
        { id: 'groups', label: t('menuGroups'), icon: Layers },
        { id: 'classes', label: t('menuClasses'), icon: Calendar },
        { id: 'fees', label: t('menuFees'), icon: CreditCard },
        { id: 'schedule', label: t('menuSchedule'), icon: Clock },
        { id: 'google_sheets', label: t('menuGoogleSheets'), icon: FileSpreadsheet },
        { id: 'activity_logs', label: t('menuActivityLogs'), icon: History },
        { id: 'settings', label: t('menuSettings'), icon: Settings },
      ];
    }

    if (currentRole === 'admin') {
      const perms = currentAdmin?.permissions || {
        admissions: true,
        students: true,
        teachers: true,
        courses: true,
        groups: true,
        classes: true,
        fees: true,
        reports: true,
        settings: true,
      };

      const items = [{ id: 'overview', label: t('menuOverview'), icon: LayoutDashboard }];

      if (perms.admissions) items.push({ id: 'admissions', label: t('menuAdmissions'), icon: UserCheck });
      if (perms.students) items.push({ id: 'students', label: t('menuStudents'), icon: Users });
      if (perms.teachers) items.push({ id: 'teachers', label: t('menuTeachers'), icon: GraduationCap });
      if (perms.courses) items.push({ id: 'courses', label: t('menuCourses'), icon: BookOpen });
      if (perms.groups) items.push({ id: 'groups', label: t('menuGroups'), icon: Layers });
      if (perms.classes) items.push({ id: 'classes', label: t('menuClasses'), icon: Calendar });
      if (perms.fees) items.push({ id: 'fees', label: t('menuFees'), icon: CreditCard });
      items.push({ id: 'schedule', label: t('menuSchedule'), icon: Clock });
      items.push({ id: 'google_sheets', label: t('menuGoogleSheets'), icon: FileSpreadsheet });
      if (perms.settings) items.push({ id: 'settings', label: t('menuSettings'), icon: Settings });

      return items;
    }

    if (currentRole === 'teacher') {
      return [
        { id: 'overview', label: t('menuOverview'), icon: LayoutDashboard },
        { id: 'my_schedule', label: t('menuMySchedule'), icon: Clock },
        { id: 'my_students', label: t('menuMyStudents'), icon: Users },
        { id: 'my_groups', label: t('menuMyGroups'), icon: Layers },
        { id: 'my_profile', label: t('menuProfile'), icon: User },
      ];
    }

    if (currentRole === 'student') {
      return [
        { id: 'overview', label: t('menuOverview'), icon: LayoutDashboard },
        { id: 'my_courses', label: t('menuMyCourses'), icon: BookOpen },
        { id: 'my_classes', label: t('menuMyClasses'), icon: Calendar },
        { id: 'my_fees', label: t('menuMyFees'), icon: CreditCard },
        { id: 'profile', label: t('menuProfile'), icon: User },
      ];
    }

    return [];
  };

  const handleRoleTabSelect = (tabId: string) => {
    if (currentView !== 'dashboard') {
      setCurrentView('dashboard');
    }
    setActiveTab(tabId);
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
        <div className="sm:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3 shadow-xl animate-in slide-in-from-top-2 duration-200 max-h-[85vh] overflow-y-auto">
          {currentUser ? (
            /* Logged-In Mobile Navigation: STRICTLY ROLE-BASED OPTIONS ONLY */
            <div className="space-y-3">
              {/* User Identity Card with Role Badge & Teacher Gender Icon */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="relative shrink-0">
                    <img
                      src={currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                      alt={currentUser.name}
                      className="w-10 h-10 rounded-xl object-cover border border-slate-300 shadow-2xs"
                    />
                    {currentRole === 'teacher' && (
                      <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-xs">
                        <TeacherGenderIcon
                          gender={currentTeacher?.gender}
                          teacherName={currentUser.name}
                          size={14}
                        />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h4 className="font-bold text-sm text-slate-900 truncate">{currentUser.name}</h4>
                      {currentRole === 'teacher' && (
                        <TeacherGenderIcon
                          gender={currentTeacher?.gender}
                          teacherName={currentUser.name}
                          variant="badge"
                          size={12}
                        />
                      )}
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border inline-block mt-0.5 ${roleInfo.bg}`}>
                      {roleInfo.label}
                    </span>
                  </div>
                </div>

                {/* Quick Lang Switch */}
                <button
                  type="button"
                  onClick={toggleLanguage}
                  className="shrink-0 px-2 py-1 rounded-lg bg-white text-xs font-semibold text-slate-700 border border-slate-200 hover:bg-slate-100"
                >
                  {language === 'en' ? 'اردو' : 'English'}
                </button>
              </div>

              {/* Role-Specific Navigation Menu Items */}
              <div className="space-y-1 pt-1">
                <div className="px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  {language === 'ur' ? 'آپ کا کردار مینو' : `${roleInfo.label} Menu`}
                </div>
                {getRoleNavItems().map((item) => {
                  const Icon = item.icon;
                  const isCurrentActive = currentView === 'dashboard' && activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleRoleTabSelect(item.id)}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 text-sm font-semibold rounded-xl transition-all ${
                        isCurrentActive
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'text-slate-700 hover:bg-slate-100 hover:text-blue-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`w-4 h-4 shrink-0 ${isCurrentActive ? 'text-white' : 'text-slate-500'}`} />
                        <span>{item.label}</span>
                      </div>
                      {isCurrentActive && (
                        <span className="w-2 h-2 rounded-full bg-white" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* View Public Website Switch & Logout */}
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <button
                  type="button"
                  onClick={() => {
                    setCurrentView(currentView === 'landing' ? 'dashboard' : 'landing');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-2.5 px-4 text-center rounded-xl font-semibold border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs flex items-center justify-center gap-2"
                >
                  <Globe className="w-3.5 h-3.5 text-blue-600" />
                  <span>
                    {currentView === 'landing'
                      ? (language === 'ur' ? 'ڈیش بورڈ پر واپس جائیں' : 'Back to Dashboard')
                      : (language === 'ur' ? 'عوامی ویب سائٹ دیکھیں' : 'View Public Website')}
                  </span>
                </button>

                {/* Logout Button: Strictly kept visible in this same menu */}
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-2.5 px-4 text-center rounded-xl font-bold border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 transition-colors text-sm flex items-center justify-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>{t('logout')}</span>
                </button>
              </div>
            </div>
          ) : (
            /* Guest Public Navigation (when not logged in) */
            <div className="space-y-3">
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
              </div>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
