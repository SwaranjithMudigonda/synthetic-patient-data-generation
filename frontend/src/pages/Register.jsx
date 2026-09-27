import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { formatAuthError, sanitizeRedirect } from '../services/authService';
import TurnstileWidget from '../components/TurnstileWidget';
import { Mail, User, KeyRound, ArrowRight, AlertCircle, ShieldAlert } from 'lucide-react';

export default function Register() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { sendOtp, verifyOtp, isAuthenticated } = useAuth();

  const rawRedirect = searchParams.get('redirect');
  const redirectTarget = sanitizeRedirect(rawRedirect, '/');

  const [step, setStep] = useState('info');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [cooldown, setCooldown] = useState(0);
  const [captchaToken, setCaptchaToken] = useState(null);

  // Throttling State: Track failed attempts and lockout duration
  const [failedAttempts, setFailedAttempts] = useState(() => {
    return parseInt(sessionStorage.getItem('synthia_failed_attempts') || '0', 10);
  });
  const [lockoutRemaining, setLockoutRemaining] = useState(0);

  useEffect(() => {
    if (isAuthenticated) {
      navigate(redirectTarget, { replace: true });
    }
  }, [isAuthenticated, navigate, redirectTarget]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  useEffect(() => {
    const lockUntil = parseInt(sessionStorage.getItem('synthia_lockout_until') || '0', 10);
    const now = Date.now();
    if (lockUntil > now) {
      setLockoutRemaining(Math.ceil((lockUntil - now) / 1000));
    }
  }, []);

  useEffect(() => {
    if (lockoutRemaining <= 0) return;
    const timer = setInterval(() => {
      setLockoutRemaining((prev) => {
        if (prev <= 1) {
          sessionStorage.removeItem('synthia_lockout_until');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [lockoutRemaining]);

  const handleRegister = async (e) => {
    e?.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Please enter a valid institutional email address.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    const res = await sendOtp(email, {
      fullName: fullName.trim(),
      shouldCreateUser: true,
      captchaToken
    });
    setLoading(false);

    if (res.success) {
      setStep('otp');
      setCooldown(60);
    } else {
      const formatted = formatAuthError(res.error);
      setErrorMsg(formatted?.message || 'Registration request failed. Please retry.');
    }
  };

  const handleVerifyOtp = async (e) => {
    e?.preventDefault();

    if (lockoutRemaining > 0) {
      setErrorMsg(`Verification is temporarily locked. Please wait ${lockoutRemaining}s.`);
      return;
    }

    // Strict 6 to 8 numeric digits validation
    const cleanOtp = otp.trim();
    if (!/^\d{6,8}$/.test(cleanOtp)) {
      setErrorMsg('Please enter a valid 6 to 8 numeric digit verification code.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    const res = await verifyOtp(email, cleanOtp);
    setLoading(false);

    if (res.success) {
      sessionStorage.removeItem('synthia_failed_attempts');
      sessionStorage.removeItem('synthia_lockout_until');
      navigate(redirectTarget, { replace: true });
    } else {
      const nextFailed = failedAttempts + 1;
      setFailedAttempts(nextFailed);
      sessionStorage.setItem('synthia_failed_attempts', String(nextFailed));

      if (nextFailed >= 5) {
        const lockSec = 60 * Math.pow(2, Math.min(nextFailed - 5, 3));
        const lockUntil = Date.now() + lockSec * 1000;
        sessionStorage.setItem('synthia_lockout_until', String(lockUntil));
        setLockoutRemaining(lockSec);
        setErrorMsg(`Too many failed attempts. Verification locked for ${lockSec} seconds.`);
      } else {
        const formatted = formatAuthError(res.error);
        const remaining = 5 - nextFailed;
        setErrorMsg(
          (formatted?.message || 'Invalid or expired verification code.') +
          (remaining > 0 ? ` (${remaining} attempt${remaining > 1 ? 's' : ''} remaining)` : '')
        );
      }
    }
  };

  return (
    <div style={{
      flex: 1,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '4rem 1.5rem',
      backgroundColor: 'var(--ivory)'
    }}>
      <div className="editorial-card" style={{
        width: '100%',
        maxWidth: 420,
        padding: '2.5rem',
        borderRadius: 4
      }}>
        <div style={{ marginBottom: '1.75rem' }}>
          <div className="label-tag" style={{ marginBottom: '0.4rem' }}>
            <span>SH-405 PLATFORM ONBOARDING</span>
          </div>
          <h1 style={{ fontSize: 26, marginBottom: '0.4rem' }}>Register Investigator</h1>
          <p style={{ color: 'var(--text-faint)', fontSize: 13, lineHeight: 1.5 }}>
            Access the SH-405 Synthetic Patient Data Platform
          </p>
        </div>

        {errorMsg && (
          <div style={{
            padding: '0.65rem 0.85rem',
            borderRadius: 3,
            backgroundColor: 'var(--crimson-soft)',
            border: '1px solid #FECACA',
            color: 'var(--crimson)',
            fontSize: 12.5,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '1.5rem'
          }}>
            <AlertCircle size={15} />
            <span>{errorMsg}</span>
          </div>
        )}

        {lockoutRemaining > 0 && (
          <div style={{
            padding: '0.65rem 0.85rem',
            borderRadius: 3,
            backgroundColor: '#FEF3C7',
            border: '1px solid #FDE68A',
            color: '#92400E',
            fontSize: 12.5,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '1.5rem'
          }}>
            <ShieldAlert size={15} />
            <span>Security Lockout: Wait {lockoutRemaining}s before retrying.</span>
          </div>
        )}

        {step === 'info' ? (
          <form onSubmit={handleRegister}>
            <div style={{ marginBottom: '1rem' }}>
              <label className="label-tag" style={{ display: 'block', marginBottom: '0.4rem' }}>
                INVESTIGATOR FULL NAME
              </label>
              <div style={{ position: 'relative' }}>
                <User size={15} style={{ position: 'absolute', left: 10, top: 12, color: 'var(--text-faint)' }} />
                <input
                  type="text"
                  className="input-text"
                  placeholder="Dr. S. Srikar"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  disabled={loading}
                  style={{ paddingLeft: '2.2rem', height: 38 }}
                  required
                />
              </div>
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label className="label-tag" style={{ display: 'block', marginBottom: '0.4rem' }}>
                INSTITUTIONAL EMAIL ADDRESS
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={15} style={{ position: 'absolute', left: 10, top: 12, color: 'var(--text-faint)' }} />
                <input
                  type="email"
                  className="input-text"
                  placeholder="investigator@institution.org"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  style={{ paddingLeft: '2.2rem', height: 38 }}
                  required
                />
              </div>
            </div>

            {/* Cloudflare Turnstile Bot Protection */}
            <TurnstileWidget onVerify={(token) => setCaptchaToken(token)} />

            <button
              type="submit"
              disabled={loading || !email.trim()}
              className="btn btn-ink"
              style={{ width: '100%', height: 40, fontSize: 13, marginBottom: '1.25rem' }}
            >
              <span>{loading ? 'Registering...' : 'Continue with Email OTP'}</span>
              <ArrowRight size={14} />
            </button>

            <div style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-faint)' }}>
              Already registered?{' '}
              <Link to="/login" style={{ color: 'var(--iris)', fontWeight: 600 }}>
                Sign in here
              </Link>
            </div>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp}>
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <label className="label-tag">VERIFICATION CODE (6–8 DIGITS)</label>
                <button
                  type="button"
                  onClick={() => { setStep('info'); setOtp(''); }}
                  style={{ background: 'none', border: 'none', color: 'var(--iris)', fontSize: 11, cursor: 'pointer', fontWeight: 600 }}
                >
                  Edit Email
                </button>
              </div>

              <div style={{ position: 'relative' }}>
                <KeyRound size={15} style={{ position: 'absolute', left: 10, top: 12, color: 'var(--text-faint)' }} />
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={8}
                  className="input-text mono"
                  placeholder="e.g. 123456"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 8))}
                  disabled={loading || lockoutRemaining > 0}
                  style={{ paddingLeft: '2.2rem', height: 40, fontSize: 17, letterSpacing: '0.2em' }}
                  required
                  autoFocus
                />
              </div>
              <p style={{ fontSize: 11, color: 'var(--text-faint)', marginTop: 5 }}>
                Dispatched code to <strong style={{ color: 'var(--ink-black)' }}>{email}</strong>
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || otp.length < 6 || otp.length > 8 || lockoutRemaining > 0}
              className="btn btn-ink"
              style={{ width: '100%', height: 40, fontSize: 13, marginBottom: '1rem' }}
            >
              <span>{loading ? 'Verifying...' : 'Complete Registration'}</span>
              <ArrowRight size={14} />
            </button>

            <div style={{ textAlign: 'center' }}>
              <button
                type="button"
                onClick={handleRegister}
                disabled={cooldown > 0 || loading || lockoutRemaining > 0}
                style={{
                  background: 'none',
                  border: 'none',
                  color: cooldown > 0 || lockoutRemaining > 0 ? 'var(--text-faint)' : 'var(--iris)',
                  fontSize: 12,
                  cursor: cooldown > 0 || lockoutRemaining > 0 ? 'default' : 'pointer',
                  fontWeight: 500
                }}
              >
                {cooldown > 0 ? `Resend code in ${cooldown}s` : 'Resend verification code'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
