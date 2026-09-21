import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Shield, Check, X, UserCheck, AlertCircle } from 'lucide-react';

interface SuperAdminNameModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SuperAdminNameModal: React.FC<SuperAdminNameModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { currentUser, updateSuperAdminName } = useApp();
  const [name, setName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && currentUser) {
      setName(currentUser.name || '');
      setError('');
      setSuccess(false);
    }
  }, [isOpen, currentUser]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Super Admin name cannot be blank.');
      return;
    }

    setIsSaving(true);
    setError('');
    try {
      const res = await updateSuperAdminName(trimmed);
      if (res) {
        setSuccess(true);
        setTimeout(() => {
          onClose();
        }, 900);
      } else {
        setError('Failed to update Super Admin name. Please try again.');
      }
    } catch (err: any) {
      setError(err?.message || 'Error updating name.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        id="super-admin-name-modal"
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-blue-900 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-500/30 border border-purple-400/40 flex items-center justify-center text-purple-200">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Change Super Admin Name</h3>
              <p className="text-xs text-purple-200">Update global executive display name</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-purple-200 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
              <Check className="w-4 h-4 shrink-0" />
              <span>Super Admin name successfully updated!</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Super Admin Full Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Maulana Qari Farhan Azhari"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20 outline-hidden font-medium"
              autoFocus
            />
            <span className="block text-[11px] text-slate-500 mt-1">
              This name will be displayed across the Super Admin console, audit logs, and reports.
            </span>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving || !name.trim()}
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-purple-500/20 transition-all"
            >
              {isSaving ? (
                <span>Saving...</span>
              ) : (
                <>
                  <UserCheck className="w-4 h-4" />
                  <span>Update Name</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
