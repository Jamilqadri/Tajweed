import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { KeyRound, Eye, EyeOff, CheckCircle2, AlertCircle, X } from 'lucide-react';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, changePassword, language } = useApp();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !currentUser) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const cleanPass = newPassword.trim();
    const cleanConfirm = confirmPassword.trim();

    if (cleanPass.length < 4) {
      setErrorMsg(
        language === 'ur'
          ? 'پاس ورڈ کم از کم 4 حروف یا ہندسوں پر مشتمل ہونا چاہیے۔'
          : 'Password must be at least 4 characters long.'
      );
      return;
    }

    if (cleanPass !== cleanConfirm) {
      setErrorMsg(
        language === 'ur'
          ? 'نئے پاس ورڈ کی تصدیق مماثل نہیں ہے۔'
          : 'New password and confirmation do not match.'
      );
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const res = changePassword(currentUser.id, cleanPass);
      setIsSubmitting(false);
      if (res) {
        setSuccessMsg(
          language === 'ur'
            ? 'آپ کا پاس ورڈ کامیابی کے ساتھ تبدیل کر دیا گیا ہے!'
            : 'Password changed successfully!'
        );
        setTimeout(() => {
          setNewPassword('');
          setConfirmPassword('');
          setSuccessMsg('');
          onClose();
        }, 1500);
      } else {
        setErrorMsg(
          language === 'ur'
            ? 'پاس ورڈ تبدیل کرنے میں خرابی پیش آئی۔'
            : 'Failed to change password. Please try again.'
        );
      }
    }, 400);
  };

  const handleClose = () => {
    setNewPassword('');
    setConfirmPassword('');
    setErrorMsg('');
    setSuccessMsg('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-900 text-white p-6 relative">
          <button
            type="button"
            onClick={handleClose}
            className="absolute top-4 end-4 text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 text-blue-200 text-xs font-semibold uppercase tracking-wider mb-1">
            <KeyRound className="w-4 h-4" />
            <span>{language === 'ur' ? 'اکاؤنٹ سیکورٹی' : 'Account Security'}</span>
          </div>
          <h3 className="text-xl font-bold">
            {language === 'ur' ? 'پاس ورڈ تبدیل کریں' : 'Change Password'}
          </h3>
          <p className="text-xs text-blue-100 mt-1">
            {language === 'ur'
              ? `لاگ ان صارف: ${currentUser.name} (${currentUser.role})`
              : `Logged in as: ${currentUser.name} (${currentUser.role})`}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="flex items-center gap-2 p-3 bg-emerald-50 text-emerald-800 text-xs rounded-xl border border-emerald-200">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span className="font-semibold">{successMsg}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {language === 'ur' ? 'نیا پاس ورڈ' : 'New Password'} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder={language === 'ur' ? 'نیا پاس ورڈ درج کریں' : 'Enter new password'}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-600 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 end-0 pe-3 flex items-center text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {language === 'ur' ? 'نئے پاس ورڈ کی تصدیق' : 'Confirm New Password'} <span className="text-red-500">*</span>
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder={language === 'ur' ? 'دوبارہ نیا پاس ورڈ درج کریں' : 'Re-enter new password'}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-600"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              {language === 'ur' ? 'منسوخ کریں' : 'Cancel'}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-md shadow-blue-500/20 disabled:opacity-50 flex items-center gap-1.5"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>
                {isSubmitting
                  ? language === 'ur'
                    ? 'محفوظ ہو رہا ہے...'
                    : 'Saving...'
                  : language === 'ur'
                  ? 'محفوظ کریں'
                  : 'Update Password'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
