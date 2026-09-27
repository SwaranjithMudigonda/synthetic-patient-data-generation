import React from 'react';

export default function MetricCard({
  label,
  value,
  subtext,
  badge,
  badgeType = 'neutral',
  icon: Icon,
  variant = 'light'
}) {
  const isDark = variant === 'dark';

  const badgeClass = badgeType === 'success' 
    ? 'badge-telemetry-pass' 
    : badgeType === 'danger' 
    ? 'badge-telemetry-fail' 
    : badgeType === 'iris' || badgeType === 'violet'
    ? 'badge-telemetry-iris'
    : 'badge-telemetry-neutral';

  return (
    <div
      className={isDark ? 'editorial-card-ink' : 'editorial-card'}
      style={{
        padding: '1.15rem 1.35rem',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        minHeight: 110,
        borderRadius: 4
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
        <span className="label-tag" style={{ color: isDark ? 'rgba(245, 243, 238, 0.65)' : 'var(--text-faint)' }}>
          {label}
        </span>
        {Icon && (
          <Icon size={14} style={{ color: isDark ? 'rgba(245, 243, 238, 0.45)' : 'var(--text-faint)' }} />
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem', marginBottom: '0.2rem' }}>
        <span
          className="mono"
          style={{
            fontSize: 26,
            fontWeight: 600,
            letterSpacing: '-0.02em',
            color: isDark ? 'var(--ivory)' : 'var(--ink-black)'
          }}
        >
          {value}
        </span>

        {badge && (
          <span className={`badge-telemetry ${badgeClass}`}>
            {badge}
          </span>
        )}
      </div>

      {subtext && (
        <p style={{
          fontSize: 11.5,
          color: isDark ? 'rgba(245, 243, 238, 0.55)' : 'var(--text-muted)',
          lineHeight: 1.45,
          fontFamily: "'IBM Plex Sans', sans-serif"
        }}>
          {subtext}
        </p>
      )}
    </div>
  );
}
