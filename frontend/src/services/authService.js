import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://wpsxhvsoyaaifjltdjro.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_8Jtblm9FPugBO_zeBVZ8Pw_IKbQ3HxM';

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: typeof window !== 'undefined' ? window.localStorage : null
  }
});

/**
 * Open Redirect Defense: Restricts target redirect to same-origin relative internal routes.
 * Blocks any external URL, protocol-relative paths (//evil.com), or javascript: exploits.
 */
export function sanitizeRedirect(target, fallback = '/') {
  if (!target || typeof target !== 'string') return fallback;
  const clean = target.trim();

  // Must strictly start with a single '/' and not '//' or '/\'
  if (!clean.startsWith('/') || clean.startsWith('//') || clean.startsWith('/\\')) {
    return fallback;
  }

  // Reject javascript:, data:, and encoded protocol attempts
  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(clean)) {
    return fallback;
  }

  try {
    const dummyUrl = new URL(clean, 'http://localhost');
    const path = dummyUrl.pathname;
    const allowedPrefixes = [
      '/',
      '/create',
      '/generate',
      '/validation',
      '/privacy',
      '/patient',
      '/api-hub',
      '/stress-test'
    ];

    const isMatch = allowedPrefixes.some(
      (prefix) => path === prefix || path.startsWith(prefix + '/')
    );

    return isMatch ? `${path}${dummyUrl.search}${dummyUrl.hash}` : fallback;
  } catch {
    return fallback;
  }
}

/**
 * Format auth errors nicely for display
 */
export function formatAuthError(err) {
  if (!err) return null;
  const msg = (err.message || String(err)).toLowerCase();
  const status = err.status || 0;

  if (status === 429 || msg.includes('rate limit') || msg.includes('too many requests') || msg.includes('over_email_send_rate_limit')) {
    return {
      title: 'TOO MANY REQUESTS',
      message: 'Rate limit exceeded. Please wait a moment before requesting another verification code.'
    };
  }

  if (msg.includes('signups not allowed') || msg.includes('signup is disabled')) {
    return {
      title: 'ACCOUNT NOT FOUND',
      message: 'No account found with this email. Please register first to create your profile.'
    };
  }

  if (msg.includes('invalid format') || msg.includes('valid email') || msg.includes('email address is invalid')) {
    return {
      title: 'INVALID EMAIL',
      message: 'Please enter a valid institutional email address.'
    };
  }

  if (msg.includes('expired') || msg.includes('token has expired') || msg.includes('otp expired')) {
    return {
      title: 'CODE EXPIRED',
      message: 'This code has expired. Please request a new verification code.'
    };
  }

  if (msg.includes('invalid') || msg.includes('token is invalid') || msg.includes('does not match') || msg.includes('bad token')) {
    return {
      title: 'INVALID CODE',
      message: 'The verification code entered is incorrect. Please check your email and try again.'
    };
  }

  return {
    title: 'AUTHENTICATION ERROR',
    message: err.message || "We couldn't complete authentication. Please try again."
  };
}

export async function sendOtp(email, options = {}) {
  const cleanEmail = (email || '').trim().toLowerCase();
  if (!cleanEmail || !cleanEmail.includes('@')) {
    return { success: false, error: new Error('Please enter a valid email address.') };
  }

  const optionsPayload = {
    shouldCreateUser: options.shouldCreateUser !== false
  };

  if (options.fullName) {
    optionsPayload.data = { full_name: options.fullName };
  }

  // Cloudflare Turnstile / hCaptcha bot protection support
  if (options.captchaToken) {
    optionsPayload.captchaToken = options.captchaToken;
  }

  if (typeof window !== 'undefined' && window.location) {
    optionsPayload.emailRedirectTo = options.emailRedirectTo || window.location.origin;
  }

  try {
    const { data, error } = await supabase.auth.signInWithOtp({
      email: cleanEmail,
      options: optionsPayload
    });
    if (error) {
      return { success: false, error };
    }
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err };
  }
}

export async function verifyOtp(email, token) {
  const cleanEmail = (email || '').trim().toLowerCase();
  const cleanToken = (token || '').trim();

  // Strict OTP check: 6 to 8 numeric digits (Supabase supports 6-digit and 8-digit OTPs)
  if (!/^\d{6,8}$/.test(cleanToken)) {
    return {
      success: false,
      error: new Error('Please enter a valid 6 to 8 numeric digit verification code.')
    };
  }

  try {
    let { data, error } = await supabase.auth.verifyOtp({
      email: cleanEmail,
      token: cleanToken,
      type: 'email'
    });

    if (error) {
      const res2 = await supabase.auth.verifyOtp({
        email: cleanEmail,
        token: cleanToken,
        type: 'signup'
      });
      if (!res2.error) {
        data = res2.data;
        error = null;
      }
    }

    if (error) {
      return { success: false, error };
    }
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err };
  }
}

export async function getSession() {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (!error && data?.session) return data.session;
    return null;
  } catch {
    return null;
  }
}

export async function getSessionMetadata() {
  const session = await getSession();
  if (!session) return null;

  return {
    user_id: session.user?.id,
    email: session.user?.email,
    role: session.user?.role || 'authenticated',
    last_sign_in_at: session.user?.last_sign_in_at,
    created_at: session.user?.created_at,
    expires_at: session.expires_at ? new Date(session.expires_at * 1000).toISOString() : null
  };
}

export async function signOut() {
  try {
    await supabase.auth.signOut();
  } catch (e) {
    console.warn('[SYNTHIA Auth] signOut error:', e);
  }
}

/**
 * Session Hygiene: Revoke authentication tokens across all active devices
 */
export async function signOutGlobal() {
  try {
    await supabase.auth.signOut({ scope: 'global' });
  } catch (e) {
    console.warn('[SYNTHIA Auth] signOutGlobal error:', e);
    // Fallback to regular sign out
    await supabase.auth.signOut();
  }
}

// ------------------------------------------------------------------
// OPTIONAL TOTP MULTI-FACTOR AUTHENTICATION (MFA)
// ------------------------------------------------------------------
export async function enrollMfaTotp() {
  try {
    const { data, error } = await supabase.auth.mfa.enroll({
      factorType: 'totp',
      issuer: 'SYNTHIA Clinical Platform'
    });
    if (error) throw error;
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err };
  }
}

export async function verifyMfaChallenge(factorId, code) {
  try {
    const cleanCode = (code || '').trim();
    if (!/^\d{6}$/.test(cleanCode)) {
      throw new Error('Authenticator code must be exactly 6 digits.');
    }
    const { data, error } = await supabase.auth.mfa.challengeAndVerify({
      factorId,
      code: cleanCode
    });
    if (error) throw error;
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err };
  }
}

export async function listMfaFactors() {
  try {
    const { data, error } = await supabase.auth.mfa.listFactors();
    if (error) throw error;
    return { success: true, factors: data?.all || [] };
  } catch (err) {
    return { success: false, error: err, factors: [] };
  }
}

export async function unenrollMfa(factorId) {
  try {
    const { data, error } = await supabase.auth.mfa.unenroll({ factorId });
    if (error) throw error;
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err };
  }
}