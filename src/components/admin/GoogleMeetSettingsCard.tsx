import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  googleSignIn,
  googleLogout,
  initGoogleAuth,
  getCachedAccessToken,
  ACADEMY_MEET_EMAIL,
} from '../../lib/googleMeetService';
import {
  Video,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Calendar,
  Sparkles,
  Link,
  Check,
} from 'lucide-react';
import { User } from 'firebase/auth';

export const GoogleMeetSettingsCard: React.FC = () => {
  const { groups, students, classes, syncAllMeetLinks, language } = useApp();

  const [googleUser, setGoogleUser] = useState<User | null>(null);
  const [hasToken, setHasToken] = useState<boolean>(false);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const unsub = initGoogleAuth(
      (user, token) => {
        setGoogleUser(user);
        setHasToken(!!token);
      },
      () => {
        setGoogleUser(null);
        setHasToken(false);
      }
    );
    // Also check initial token
    setHasToken(!!getCachedAccessToken());
    return () => {
      if (unsub) unsub();
    };
  }, []);

  const handleGoogleSignIn = async () => {
    try {
      setIsSigningIn(true);
      setErrorMessage(null);
      const res = await googleSignIn();
      if (res) {
        setGoogleUser(res.user);
        setHasToken(true);
      }
    } catch (err: any) {
      console.error('Sign in error:', err);
      setErrorMessage(err?.message || 'Google Sign-In was cancelled or failed.');
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleGoogleLogout = async () => {
    try {
      await googleLogout();
      setGoogleUser(null);
      setHasToken(false);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSyncAll = async () => {
    try {
      setIsSyncing(true);
      setSyncResult(null);
      setErrorMessage(null);
      const count = await syncAllMeetLinks();
      setSyncResult(
        language === 'ur'
          ? `کامیابی! تمام ${count} کلاسوں اور گروپس کے منفرد گوگل میٹ لنکس بن کر فائر اسٹور میں محفوظ ہو گئے۔`
          : `Success! Synchronized unique Google Meet links for all ${count} groups, 1-on-1 students, and classes to Firestore.`
      );
    } catch (err: any) {
      console.error('Sync error:', err);
      setErrorMessage(err?.message || 'Failed to sync Google Meet links.');
    } finally {
      setIsSyncing(false);
    }
  };

  const uniqueMeetLinksCount = new Set(
    [
      ...groups.map((g) => g.meetLink),
      ...students.map((s) => s.meetLink).filter(Boolean),
      ...classes.map((c) => c.meetLink).filter(Boolean),
    ]
  ).size;

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shadow-xs">
            <Video className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-slate-900">Google Meet & Calendar Integration</h3>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                Active
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Unique Google Meet rooms automatically provisioned for every Group Class and One-to-One session.
            </p>
          </div>
        </div>

        {/* Target Academy Google Account */}
        <div className="text-start sm:text-end text-xs">
          <span className="text-slate-400 block font-medium">Academy Google Account</span>
          <span className="font-bold text-slate-900 font-mono">{ACADEMY_MEET_EMAIL}</span>
        </div>
      </div>

      {/* Integration Status Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
          <span className="text-slate-500 font-medium block">Active Groups</span>
          <span className="text-xl font-extrabold text-slate-900">{groups.length}</span>
          <span className="text-[11px] text-blue-600 block">Each has a dedicated Meet room</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
          <span className="text-slate-500 font-medium block">One-to-One Students</span>
          <span className="text-xl font-extrabold text-slate-900">
            {students.filter((s) => s.classType === 'one_to_one').length}
          </span>
          <span className="text-[11px] text-emerald-600 block">Each has personal Meet room</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
          <span className="text-slate-500 font-medium block">Active Scheduled Classes</span>
          <span className="text-xl font-extrabold text-slate-900">{classes.length}</span>
          <span className="text-[11px] text-purple-600 block">Linked to teacher & student Join buttons</span>
        </div>
      </div>

      {/* Feedback Messages */}
      {syncResult && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{syncResult}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* OAuth Connection & Controls */}
      <div className="p-5 rounded-2xl bg-blue-50/60 border border-blue-200 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              <span>Google Account Authorization (Workspace Scopes)</span>
            </h4>
            <p className="text-xs text-slate-600">
              {googleUser
                ? `Authorized as: ${googleUser.email || googleUser.displayName} (Calendar & Meet APIs active)`
                : `Connect ${ACADEMY_MEET_EMAIL} to manage Google Calendar events and Google Meet spaces directly via Google APIs.`}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {googleUser ? (
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 font-bold text-xs">
                  <Check className="w-3.5 h-3.5" />
                  <span>Connected</span>
                </span>
                <button
                  type="button"
                  onClick={handleGoogleLogout}
                  className="px-3 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 font-semibold text-xs"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isSigningIn}
                className="gsi-material-button inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 font-semibold text-xs shadow-xs cursor-pointer disabled:opacity-60"
              >
                <svg className="w-4 h-4" viewBox="0 0 48 48">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                </svg>
                <span>{isSigningIn ? 'Connecting...' : 'Sign in with Google'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Sync All Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-blue-200/70">
          <div className="text-xs text-blue-900">
            <strong>Automatic Provisioning:</strong> Generate or refresh unique Google Meet links for every Group Class and One-to-One student class, updating Firestore so teacher and students join the exact same link.
          </div>

          <button
            type="button"
            onClick={handleSyncAll}
            disabled={isSyncing}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-all shrink-0 cursor-pointer disabled:opacity-60"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Synchronizing with Firestore...' : 'Sync & Generate All Meet Links'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
