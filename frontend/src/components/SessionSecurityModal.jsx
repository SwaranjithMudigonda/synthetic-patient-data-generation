import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, ShieldAlert, X, Smartphone, Globe, Clock, LogOut, CheckCircle2 } from 'lucide-react';

export default function SessionSecurityModal({ isOpen, onClose, onOpenMfa }) {
  const { user, sessionMeta, signOut, signOutGlobal } = useAuth();
  const [revoking, setRevoking] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);

  if (!isOpen) return null;

  const handleGlobalSignOut = async () => {
    if (!window.confirm('Are you sure you want to sign out of all active devices? This will invalidate all active sessions.')) {
      return;
    }
    setRevoking(true);
    await signOutGlobal();
    setRevoking(false);
    onClose();
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Active Now';
    try {
      return new Date(dateStr).toLocaleString(undefined, {
        dateStyle: 'medium',
        timeStyle: 'medium'
      });
    } catch {
      return dateStr;
    }
  };

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
          maxWidth: 540,
          padding: '2rem',
          borderRadius: 4,
          backgroundColor: '#FFFFFF',
          color: 'var(--ink)'
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
          <div>
            <div className="label-tag" style={{ color: 'var(--iris)', marginBottom: '0.35rem' }}>
              <span>SESSION HYGIENE & CREDENTIAL AUDIT</span>
            </div>
            <h2 style={{ fontSize: 20, margin: 0 }}>Active Investigator Session</h2>
          </div>

          <button
            onClick={onClose}
            aria-label="Close Security Modal"
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

        {successMsg && (
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
            marginBottom: '1.25rem'
          }}>
            <CheckCircle2 size={15} />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Telemetry Grid */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.85rem',
          marginBottom: '1.75rem',
          backgroundColor: 'var(--ivory-bright)',
          padding: '1.25rem',
          borderRadius: 4,
          border: '1px solid var(--hairline-soft)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5 }}>
            <span style={{ color: 'var(--text-faint)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Globe size={13} />
              <span>Authenticated Principal</span>
            </span>
            <span className="mono" style={{ fontWeight: 600 }}>{user?.email}</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5 }}>
            <span style={{ color: 'var(--text-faint)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Clock size={13} />
              <span>Last Active Login</span>
            </span>
            <span className="mono" style={{ color: '#047857', fontWeight: 600 }}>
              {formatDate(sessionMeta?.last_sign_in_at || user?.last_sign_in_at)}
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5 }}>
            <span style={{ color: 'var(--text-faint)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <ShieldCheck size={13} />
              <span>Server-Side Token Policy</span>
            </span>
            <span className="mono" style={{ color: 'var(--iris)', fontWeight: 600 }}>
              SUPABASE JWKS (STRICT)
            </span>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              onClick={() => {
                onClose();
                if (onOpenMfa) onOpenMfa();
              }}
              className="btn btn-outline-dark"
              style={{ flex: 1, padding: '0.65rem', justifyContent: 'center', fontSize: 12.5 }}
            >
              <Smartphone size={14} />
              <span>Configure 2FA (TOTP)</span>
            </button>

            <button
              onClick={signOut}
              className="btn btn-outline-dark"
              style={{ padding: '0.65rem 1rem', justifyContent: 'center', fontSize: 12.5 }}
            >
              <LogOut size={14} />
              <span>Sign Out</span>
            </button>
          </div>

          <button
            onClick={handleGlobalSignOut}
            disabled={revoking}
            className="btn btn-ink"
            style={{
              width: '100%',
              padding: '0.75rem',
              justifyContent: 'center',
              fontSize: 12.5,
              backgroundColor: '#991B1B',
              borderColor: '#7F1D1D'
            }}
          >
            <ShieldAlert size={14} />
            <span>{revoking ? 'Revoking All Sessions...' : 'Revoke All Devices & Sign Out Globally'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
