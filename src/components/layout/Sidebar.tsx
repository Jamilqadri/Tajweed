import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  UserCheck,
  GraduationCap,
  Users,
  BookOpen,
  Calendar,
  Layers,
  CreditCard,
  FileSpreadsheet,
  Settings,
  LogOut,
  Shield,
  User,
  History,
  Clock,
  X,
} from 'lucide-react';
import { TeacherGenderIcon } from '../common/TeacherGenderIcon';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  isOpenMobile,
  onCloseMobile,
}) => {
  const { currentRole, currentUser, currentAdmin, currentTeacher, logout, t, language } = useApp();

  // Determine which navigation items to show based on role & permissions
  const getNavItems = () => {
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

    return [{ id: 'overview', label: t('menuOverview'), icon: LayoutDashboard }];
  };

  const navItems = getNavItems();

  const handleSelect = (id: string) => {
    onSelectTab(id);
    onCloseMobile();
  };

  const sidebarContent = (
    <div className="h-full flex flex-col justify-between bg-white border-e border-slate-200 w-64 select-none">
      {/* User Info Header */}
      <div>
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative shrink-0">
              <img
                src={currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                alt={currentUser?.name}
                className="w-10 h-10 rounded-xl object-cover border border-slate-200 shadow-xs"
              />
              {currentRole === 'teacher' && (
                <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-xs">
                  <TeacherGenderIcon
                    gender={currentTeacher?.gender}
                    teacherName={currentUser?.name}
                    size={14}
                  />
                </div>
              )}
            </div>
            <div className="overflow-hidden">
              <div className="font-bold text-sm text-slate-900 truncate flex items-center gap-1.5">
                <span>{currentUser?.name}</span>
                {currentRole === 'teacher' && (
                  <TeacherGenderIcon
                    gender={currentTeacher?.gender}
                    teacherName={currentUser?.name}
                    variant="badge"
                    size={11}
                  />
                )}
              </div>
              <div className="text-[11px] font-semibold text-blue-600 uppercase tracking-wider">
                {currentRole?.replace('_', ' ')}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onCloseMobile}
            className="lg:hidden text-slate-400 hover:text-slate-700 p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation List */}
        <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-210px)]">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelect(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                    : 'text-slate-600 hover:text-blue-700 hover:bg-blue-50/70'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-600'}`} />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Controls */}
      <div className="p-4 border-t border-slate-100">
        <button
          type="button"
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50 border border-red-200 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>{t('logout')}</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:block shrink-0">{sidebarContent}</aside>

      {/* Mobile Drawer */}
      {isOpenMobile && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs"
            onClick={onCloseMobile}
          />
          <div className="relative z-10 animate-in slide-in-from-start duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
