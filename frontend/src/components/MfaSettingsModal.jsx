import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, X, Key, CheckCircle, AlertCircle, Trash2, ArrowRight } from 'lucide-react';

export default function MfaSettingsModal({ isOpen, onClose }) {
  const { enrollMfaTotp, verifyMfaChallenge, listMfaFactors, unenrollMfa } = useAuth();

  const [factors, setFactors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [enrolling, setEnrolling] = useState(false);
  const [enrollData, setEnrollData] = useState(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [statusMsg, setStatusMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    if (isOpen) {
      loadFactors();
    }
  }, [isOpen]);

  const loadFactors = async () => {
    setLoading(true);
    const res = await listMfaFactors();
    setLoading(false);
    if (res.success) {
      setFactors(res.factors);
    }
  };

  const handleStartEnrollment = async () => {
    setErrorMsg(null);
    setStatusMsg(null);
    setEnrolling(true);
    const res = await enrollMfaTotp();
    setEnrolling(false);

    if (res.success) {
      setEnrollData(res.data);
    } else {
      setErrorMsg(res.error?.message || 'Could not start TOTP enrollment.');
    }
  };

  const handleVerifyEnrollment = async (e) => {
    e?.preventDefault();
    if (!enrollData?.id || !/^\d{6}$/.test(verificationCode.trim())) {
      setErrorMsg('Please enter exactly 6 numeric digits.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    const res = await verifyMfaChallenge(enrollData.id, verificationCode.trim());
    setLoading(false);

    if (res.success) {
      setStatusMsg('Two-Factor Authentication (TOTP) successfully activated!');
      setEnrollData(null);
      setVerificationCode('');
      loadFactors();
    } else {
      setErrorMsg(res.error?.message || 'Invalid 6-digit code. Please retry.');
    }
  };

  const handleUnenroll = async (factorId) => {
    if (!window.confirm('Disable this authenticator factor?')) return;
    setLoading(true);
    const res = await unenrollMfa(factorId);
    setLoading(false);
    if (res.success) {
      setStatusMsg('Authenticator factor removed.');
      loadFactors();
    } else {
      setErrorMsg(res.error?.message || 'Failed to remove factor.');
    }
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        backgroundColor: 'rgba(11, 11, 13, 0.85)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
        animation: 'fadeIn 180ms ease-out'
      }}
    >
      <div
        className="editorial-card"
        style={{
          width: '100%',
          maxWidth: 500,
          padding: '2rem',
          borderRadius: 4,
          backgroundColor: '#FFFFFF',
          color: 'var(--ink)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
          <div>
            <div className="label-tag" style={{ color: 'var(--iris)', marginBottom: '0.35rem' }}>
              <span>MULTI-FACTOR AUTHENTICATION</span>
            </div>
            <h2 style={{ fontSize: 20, margin: 0 }}>Authenticator 2FA (TOTP)</h2>
          </div>

          <button
            onClick={onClose}
            aria-label="Close MFA Modal"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-faint)',
              padding: 4
            }}
          >
            <X size={18} />
          </button>
        </div>

        {statusMsg && (
          <div style={{
            padding: '0.65rem 0.85rem',
            borderRadius: 3,
            backgroundColor: '#D1FAE5',
            border: '1px solid #A7F3D0',
            color: '#065F46',
            fontSize: 12.5,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '1rem'
          }}>
            <CheckCircle size={15} />
            <span>{statusMsg}</span>
          </div>
        )}

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
            marginBottom: '1rem'
          }}>
            <AlertCircle size={15} />
            <span>{errorMsg}</span>
          </div>
        )}

        {enrollData ? (
          /* Enrollment Setup */
          <form onSubmit={handleVerifyEnrollment}>
            <p style={{ fontSize: 13, color: 'var(--text-faint)', lineHeight: 1.5, marginBottom: '1rem' }}>
              Scan the QR code or enter the secret key into your authenticator app (Google Authenticator, 1Password, etc.):
            </p>

            {enrollData.totp?.qr_code && (
              <div style={{ textAlign: 'center', margin: '1rem 0' }}>
                <img
                  src={enrollData.totp.qr_code}
                  alt="MFA QR Code"
                  style={{ width: 170, height: 170, margin: '0 auto', display: 'block', borderRadius: 4 }}
                />
              </div>
            )}

            {enrollData.totp?.secret && (
              <div style={{
                backgroundColor: 'var(--ivory-bright)',
                border: '1px solid var(--hairline-soft)',
                padding: '0.65rem 0.85rem',
                borderRadius: 4,
                marginBottom: '1.25rem',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: 10.5, color: 'var(--text-faint)', marginBottom: 2 }}>MANUAL SECRET KEY</div>
                <div className="mono" style={{ fontSize: 13, fontWeight: 600, letterSpacing: '0.08em' }}>
                  {enrollData.totp.secret}
                </div>
              </div>
            )}

            <div style={{ marginBottom: '1.25rem' }}>
              <label className="label-tag" style={{ display: 'block', marginBottom: '0.4rem' }}>
                ENTER 6-DIGIT CODE FROM AUTHENTICATOR
              </label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                className="input-text mono"
                placeholder="123456"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                style={{ height: 40, fontSize: 16, letterSpacing: '0.2em', textAlign: 'center' }}
                required
                autoFocus
              />
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={() => setEnrollData(null)}
                className="btn btn-outline-dark"
                style={{ flex: 1, padding: '0.65rem', justifyContent: 'center', fontSize: 12.5 }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || verificationCode.length !== 6}
                className="btn btn-ink"
                style={{ flex: 1, padding: '0.65rem', justifyContent: 'center', fontSize: 12.5 }}
              >
                <span>Verify & Activate</span>
                <ArrowRight size={13} />
              </button>
            </div>
          </form>
        ) : (
          /* Factors List */
          <div>
            <p style={{ fontSize: 13, color: 'var(--text-faint)', lineHeight: 1.5, marginBottom: '1.25rem' }}>
              Add a second factor of authentication to protect your clinical research datasets beyond email OTP.
            </p>

            {factors.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
                {factors.map((f) => (
                  <div
                    key={f.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.85rem 1rem',
                      backgroundColor: 'var(--ivory-bright)',
                      border: '1px solid var(--hairline-soft)',
                      borderRadius: 4
                    }}
                  >
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <ShieldCheck size={14} style={{ color: '#047857' }} />
                        <span>TOTP Authenticator</span>
                      </div>
                      <div className="mono" style={{ fontSize: 10.5, color: 'var(--text-faint)' }}>
                        Status: {f.status} &bull; ID: {f.id.slice(0, 8)}...
                      </div>
                    </div>

                    <button
                      onClick={() => handleUnenroll(f.id)}
                      disabled={loading}
                      title="Remove Authenticator"
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--crimson)',
                        cursor: 'pointer',
                        padding: 4
                      }}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{
                padding: '1.25rem',
                borderRadius: 4,
                backgroundColor: 'var(--ivory-bright)',
                border: '1px solid var(--hairline-soft)',
                textAlign: 'center',
                marginBottom: '1.5rem',
                color: 'var(--text-faint)',
                fontSize: 12.5
              }}>
                No 2FA factors currently configured.
              </div>
            )}

            <button
              onClick={handleStartEnrollment}
              disabled={enrolling || loading}
              className="btn btn-iris"
              style={{ width: '100%', padding: '0.75rem', justifyContent: 'center', fontSize: 13 }}
            >
              <Key size={14} />
              <span>{enrolling ? 'Configuring...' : 'Enroll New TOTP Authenticator'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
