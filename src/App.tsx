import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { LandingPage } from './components/landing/LandingPage';
import { AdmissionFormModal } from './components/admission/AdmissionFormModal';
import { LoginModal } from './components/auth/LoginModal';
import { ClassMeetModal } from './components/classroom/ClassMeetModal';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { TeacherDashboard } from './components/teacher/TeacherDashboard';
import { StudentDashboard } from './components/student/StudentDashboard';

const AppContent: React.FC = () => {
  const {
    currentView,
    currentRole,
    activeTab,
    setActiveTab,
    isSidebarOpen,
    setSidebarOpen,
    activeMeetingClass,
    setActiveMeetingClass,
  } = useApp();

  const [isAdmissionOpen, setIsAdmissionOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-blue-600 selection:text-white">
      {/* Universal Top Navigation */}
      <Navbar
        onOpenAdmission={() => {
          setIsLoginOpen(false);
          setIsAdmissionOpen(true);
        }}
        onOpenLogin={() => {
          setIsAdmissionOpen(false);
          setIsLoginOpen(true);
        }}
        onOpenNotifications={() => setActiveTab('notifications')}
      />

      {/* Main Content Router */}
      {currentView === 'landing' ? (
        <main className="flex-1">
          <LandingPage
            onOpenAdmission={() => {
              setIsLoginOpen(false);
              setIsAdmissionOpen(true);
            }}
            onOpenLogin={() => {
              setIsAdmissionOpen(false);
              setIsLoginOpen(true);
            }}
          />
        </main>
      ) : (
        <div className="flex-1 flex overflow-hidden">
          {/* Dynamic Role-Based Sidebar */}
          <Sidebar
            currentTab={activeTab}
            onSelectTab={setActiveTab}
            isOpenMobile={isSidebarOpen}
            onCloseMobile={() => setSidebarOpen(false)}
          />

          {/* Main Dashboard Workspace */}
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto pb-12">
              {(currentRole === 'super_admin' || currentRole === 'admin') && (
                <AdminDashboard currentTab={activeTab} onSelectTab={setActiveTab} />
              )}
              {currentRole === 'teacher' && (
                <TeacherDashboard currentTab={activeTab} onSelectTab={setActiveTab} />
              )}
              {currentRole === 'student' && (
                <StudentDashboard currentTab={activeTab} onSelectTab={setActiveTab} />
              )}
            </div>
          </main>
        </div>
      )}

      {/* 14-Field Student Admission Form Modal with Auto-ID */}
      <AdmissionFormModal
        isOpen={isAdmissionOpen}
        onClose={() => setIsAdmissionOpen(false)}
        onOpenLogin={() => {
          setIsAdmissionOpen(false);
          setIsLoginOpen(true);
        }}
      />

      {/* Dual Student & Staff Login Modal with 1-Click Demo Profiles */}
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onOpenAdmission={() => {
          setIsLoginOpen(false);
          setIsAdmissionOpen(true);
        }}
      />

      {/* Live Video Class Tajweed Classroom Modal */}
      {activeMeetingClass && (
        <ClassMeetModal
          classItem={activeMeetingClass}
          onClose={() => setActiveMeetingClass(null)}
        />
      )}
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
