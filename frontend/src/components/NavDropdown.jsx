import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronDown, ArrowRight } from 'lucide-react';

export default function NavDropdown({ label, items = [], category = 'MODULE' }) {
  const [isOpen, setIsOpen] = useState(false);
  const timeoutRef = useRef(null);
  const location = useLocation();
  const containerRef = useRef(null);

  // Check if any child item is active
  const isChildActive = items.some(item => location.pathname === item.path);

  // Hover intent handling with slight delay to prevent flicker
  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 140);
  };

  const toggleDropdown = () => {
    setIsOpen(prev => !prev);
  };

  // Keyboard accessibility: close on Escape or outside click
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [isOpen]);

  return (
    <div
      ref={containerRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{ position: 'relative', height: '100%', display: 'flex', alignItems: 'center' }}
    >
      {/* Trigger Button */}
      <button
        type="button"
        onClick={toggleDropdown}
        aria-haspopup="true"
        aria-expanded={isOpen}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.35rem',
          fontSize: 12.5,
          fontWeight: isChildActive ? 600 : 500,
          color: isChildActive || isOpen ? '#FFFFFF' : 'rgba(245, 243, 238, 0.7)',
          padding: '0 8px',
          height: '100%',
          borderBottom: isChildActive ? '2px solid var(--iris)' : '2px solid transparent',
          transition: 'color 140ms ease'
        }}
      >
        <span>{label}</span>
        <ChevronDown
          size={12}
          style={{
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 180ms ease',
            opacity: 0.7
          }}
        />
      </button>

      {/* Mega-Menu Panel */}
      {isOpen && (
        <div
          role="menu"
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            width: 440,
            backgroundColor: 'var(--ink-black)',
            border: '1px solid var(--hairline-dark)',
            borderRadius: '0 0 6px 6px',
            boxShadow: '0 16px 36px rgba(0, 0, 0, 0.45)',
            padding: '1.25rem',
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
            animation: 'fadeIn 140ms ease-out'
          }}
        >
          <div style={{
            fontSize: 10,
            fontFamily: "'JetBrains Mono', monospace",
            color: 'rgba(245, 243, 238, 0.4)',
            letterSpacing: '0.08em',
            paddingBottom: '0.5rem',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            marginBottom: '0.25rem'
          }}>
            {category}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {items.map((item) => {
              const isItemActive = location.pathname === item.path;
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  role="menuitem"
                  onClick={() => setIsOpen(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.85rem',
                    padding: '0.65rem 0.75rem',
                    borderRadius: 4,
                    textDecoration: 'none',
                    backgroundColor: isItemActive ? 'rgba(88, 59, 214, 0.25)' : 'transparent',
                    border: isItemActive ? '1px solid rgba(139, 92, 246, 0.3)' : '1px solid transparent',
                    transition: 'background-color 120ms ease'
                  }}
                  onMouseEnter={(e) => {
                    if (!isItemActive) e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                  }}
                  onMouseLeave={(e) => {
                    if (!isItemActive) e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  {Icon && (
                    <div style={{
                      width: 28,
                      height: 28,
                      borderRadius: 3,
                      backgroundColor: 'rgba(255, 255, 255, 0.08)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: isItemActive ? 'var(--iris-soft)' : 'var(--ivory)',
                      marginTop: 2,
                      flexShrink: 0
                    }}>
                      <Icon size={14} />
                    </div>
                  )}

                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: isItemActive ? '#FFFFFF' : 'var(--ivory)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}>
                      <span>{item.name}</span>
                      {item.badge && (
                        <span className="badge-telemetry badge-telemetry-neutral" style={{ fontSize: 9.5 }}>
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <div style={{
                      fontSize: 11.5,
                      color: 'rgba(245, 243, 238, 0.55)',
                      lineHeight: 1.4,
                      marginTop: 2
                    }}>
                      {item.desc}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
