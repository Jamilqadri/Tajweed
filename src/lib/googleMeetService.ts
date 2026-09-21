import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, User, signOut } from 'firebase/auth';
import { app } from './firebase';

export const ACADEMY_MEET_EMAIL = 'Kanzuttahreer@gmail.com';

export const WORKSPACE_SCOPES = [
  'https://www.googleapis.com/auth/calendar.events',
  'https://www.googleapis.com/auth/meetings.space.created',
];

const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// Request designated Workspace scopes
WORKSPACE_SCOPES.forEach((scope) => provider.addScope(scope));
provider.setCustomParameters({
  prompt: 'select_account',
});

// In-memory token caching (mandated: never store in localStorage / sessionStorage)
let cachedAccessToken: string | null = null;
let isSigningIn = false;

/**
 * Initialize Google Auth State Listener
 */
export const initGoogleAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        cachedAccessToken = null;
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

/**
 * Perform Google Sign-In with Calendar and Meet Scopes
 */
export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Could not retrieve access token from Google sign-in credentials');
    }

    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Google Sign In error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

/**
 * Retrieve the active in-memory cached access token
 */
export const getCachedAccessToken = (): string | null => cachedAccessToken;

/**
 * Sign out of Google Workspace session and clear token cache
 */
export const googleLogout = async (): Promise<void> => {
  await signOut(auth);
  cachedAccessToken = null;
};

/**
 * Checks if a Google Meet link is a genuine, verified Google Meet URL
 * Filters out fake or dummy placeholders (e.g. kzt-*, knz-*, kan-*, etc.)
 */
export function isRealGoogleMeetLink(link?: string | null): boolean {
  if (!link) return false;
  const trimmed = link.trim().toLowerCase();
  if (
    trimmed === '' ||
    trimmed === 'https://meet.google.com/' ||
    trimmed === 'https://meet.google.com/new' ||
    trimmed.includes('kzt-') ||
    trimmed.includes('knz-') ||
    trimmed.includes('kan-') ||
    trimmed.includes('fake') ||
    trimmed.includes('dummy') ||
    trimmed.includes('qran-meet') ||
    trimmed.includes('kzt-meet') ||
    trimmed.includes('undefined')
  ) {
    return false;
  }
  return (
    (trimmed.startsWith('https://meet.google.com/') || trimmed.startsWith('meet.google.com/')) &&
    trimmed.replace(/^https?:\/\/meet\.google\.com\/?/, '').length >= 5
  );
}

/**
 * Return official launch link for a teacher starting a class
 * If a verified real link exists, returns it; otherwise returns official https://meet.google.com/new
 */
export function getLaunchMeetUrl(link?: string | null): string {
  if (isRealGoogleMeetLink(link)) {
    return normalizeMeetLink(link!);
  }
  return 'https://meet.google.com/new';
}

/**
 * Safe meeting code extractor
 */
export function extractMeetingCode(meetLinkOrCode?: string | null): string {
  if (!meetLinkOrCode || !isRealGoogleMeetLink(meetLinkOrCode)) return '';
  return meetLinkOrCode.replace(/^https?:\/\/meet\.google\.com\/?/, '').replace('/', '').trim();
}

/**
 * Ensures a valid https://meet.google.com/xxx-yyyy-zzz URL
 */
export function normalizeMeetLink(linkOrCode: string): string {
  if (!linkOrCode) return '';
  const trimmed = linkOrCode.trim();
  if (trimmed.startsWith('https://meet.google.com/')) {
    return trimmed;
  }
  if (trimmed.startsWith('meet.google.com/')) {
    return `https://${trimmed}`;
  }
  return `https://meet.google.com/${trimmed.replace(/[^a-z0-9-]/gi, '')}`;
}
