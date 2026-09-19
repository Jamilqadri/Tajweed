import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  X,
  Lock,
  User,
  ArrowRight,
  AlertCircle,
  Sparkles,
  CheckCircle2,
  Eye,
  EyeOff,
} from 'lucide-react';
import { Role } from '../../types';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAdmission: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onOpenAdmission,
}) => {
  const { t, login, identifyRole, language } = useApp();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [detectedRole, setDetectedRole] = useState<{ role: Role | null; name?: string; label?: string }>({
    role: null,
  });

  // Auto-detect role as the user types their ID, email, or mobile
  useEffect(() => {
    if (identifier.trim().length > 1) {
      const detection = identifyRole(identifier);
      setDetectedRole(detection);
    } else {
      setDetectedRole({ role: null });
    }
  }, [identifier, identifyRole]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) return;

    setErrorMsg('');
    setIsLoading(true);

    setTimeout(() => {
      const res = login(identifier, password);
      setIsLoading(false);
      if (res.success) {
        onClose();
      } else {
        setErrorMsg(
          res.message ||
            (language === 'ur'
              ? 'لاگ ان نامکمل رہا۔ برائے مہربانی اپنی آئی ڈی یا پاس ورڈ چیک کریں۔'
              : 'Login failed. Please verify your Student ID, Email, or Password.')
        );
      }
    }, 300);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-700 via-blue-800 to-blue-900 text-white p-6 relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 end-4 text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 text-blue-200 text-xs font-semibold uppercase tracking-wider mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{language === 'ur' ? 'کنز التجوید پورٹل' : 'Kanz Ut Tajweed Portal'}</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black">{t('login')}</h3>
          <p className="text-xs text-blue-100 mt-1 leading-relaxed">
            {language === 'ur'
              ? 'طالب علم، اساتذہ اور ایڈمن کے لیے ایک ہی آسان لاگ ان نظام'
              : 'Single unified login with automatic role detection for all users'}
          </p>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2.5 text-xs text-red-700">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Single Unified Identifier Input */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {language === 'ur'
                  ? 'لاگ ان آئی ڈی (طالب علم: اسٹوڈنٹ آئی ڈی | ایڈمن و استاد: ای میل)'
                  : 'Login ID (Students: Student ID | Admin & Teacher: Email)'}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 start-0 ps-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  autoFocus
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder={
                    language === 'ur'
                      ? 'طالب علم: 260901 | ایڈمن/استاد: ای میل ایڈریس'
                      : 'Student: 260901 | Admin/Teacher: Email'
                  }
                  className="w-full ps-10 pe-3.5 py-3 rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 text-sm text-slate-900 shadow-xs"
                />
              </div>

              {/* Automatic Role Detection Pill */}
              {detectedRole.role && (
                <div className="mt-2 p-2 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs text-emerald-900 animate-in fade-in duration-150">
                  <div className="flex items-center gap-1.5 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>
                      {language === 'ur' ? 'شناخت شدہ اکاؤنٹ:' : 'Detected Account:'}{' '}
                      <strong className="text-emerald-950">{detectedRole.label}</strong>
                    </span>
                  </div>
                  {detectedRole.name && (
                    <span className="text-[11px] text-emerald-700 truncate max-w-[140px]">
                      {detectedRole.name}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Password Input */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700">
                  {language === 'ur' ? 'پاس ورڈ' : 'Password'}
                </label>
                <span className="text-[10px] text-slate-500">
                  {language === 'ur'
                    ? 'طالب علم: موبائل کے آخری 6 ہندسے'
                    : 'Student: last 6 digits of mobile'}
                </span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 start-0 ps-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full ps-10 pe-10 py-3 rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 text-sm text-slate-900 shadow-xs"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 end-0 pe-3 flex items-center text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                {language === 'ur'
                  ? 'طالب علم کا پاس ورڈ تبدیل کرنے تک موبائل کے آخری 6 ہندسے رہے گا۔ تبدیلی کے بعد صرف نیا پاس ورڈ کام کرے گا۔'
                  : 'Student initial password is active until changed. After changing, only the new password works.'}
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span>{isLoading ? (language === 'ur' ? 'لاگ ان ہو رہے ہیں...' : 'Signing In...') : t('login')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Admission link */}
          <div className="text-center pt-3 border-t border-slate-100">
            <span className="text-xs text-slate-500">
              {language === 'ur' ? 'ابھی تک داخلہ نہیں لیا؟ ' : 'Not admitted yet? '}
            </span>
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenAdmission();
              }}
              className="text-xs font-bold text-blue-600 hover:text-blue-800"
            >
              {t('applyForAdmission')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
