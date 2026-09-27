import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NavDropdown from './NavDropdown';
import CommandPalette from './CommandPalette';
import SessionSecurityModal from './SessionSecurityModal';
import MfaSettingsModal from './MfaSettingsModal';
import { 
  Sliders, 
  Dna, 
  Activity, 
  ShieldCheck, 
  UserCheck, 
  Terminal, 
  Flame, 
  LogOut, 
  LogIn, 
  Menu, 
  X,
  Search,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, signOut } = useAuth();

  // Scroll dynamics state
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);
  const ticking = useRef(false);

  // Command palette state
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  // Security & MFA modals state
  const [isSecurityModalOpen, setIsSecurityModalOpen] = useState(false);
  const [isMfaModalOpen, setIsMfaModalOpen] = useState(false);

  // Mobile menu drawer state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Detect OS for shortcut display (Mac: ⌘K, Win/Linux: Ctrl+K)
  const isMac = typeof window !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0;

  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  // Smooth anchor scrolling helper
  const handleAnchorClick = (e, anchorId) => {
    if (e) e.preventDefault();
    setMobileMenuOpen(false);
    if (location.pathname !== '/') {
      navigate(`/#${anchorId}`);
      setTimeout(() => {
        if (anchorId === 'top') {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
          const el = document.getElementById(anchorId);
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else {
      if (anchorId === 'top') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        const el = document.getElementById(anchorId);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  // Throttled scroll listener using requestAnimationFrame
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (!ticking.current) {
        window.requestAnimationFrame(() => {
          // Transparent vs Solid/Blur threshold
          setIsScrolled(currentScrollY > 24);

          // Hide on scroll down, show on scroll up (with deadzone of 8px)
          const diff = currentScrollY - lastScrollY.current;
          if (currentScrollY <= 40) {
            setIsVisible(true);
          } else if (diff > 10 && currentScrollY > 80 && !mobileMenuOpen && !isCommandPaletteOpen) {
            setIsVisible(false);
          } else if (diff < -8) {
            setIsVisible(true);
          }

          lastScrollY.current = currentScrollY;
          ticking.current = false;
        });

        ticking.current = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [mobileMenuOpen, isCommandPaletteOpen]);

  // Global keyboard listener for ⌘K / Ctrl+K (only active when logged in)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isAuthenticated) return;
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAuthenticated]);

  // Lock body scroll when mobile drawer or command palette is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  // Mega-menu category groupings
  const generativeItems = [
    {
      name: 'Cohort Conditioning Console',
      path: '/create',
      desc: 'Natural language query parser and demographic marginal sliders',
      icon: Sliders,
      badge: 'WORKSPACE 01'
    },
    {
      name: 'Gaussian Copula Studio',
      path: '/generate',
      desc: 'Execute continuous joint sampling with strict clinical rule guards',
      icon: Dna,
      badge: 'WORKSPACE 02'
    }
  ];

  const auditItems = [
    {
      name: 'Statistical Fidelity Diagnostic',
      path: '/validation',
      desc: 'Kolmogorov-Smirnov continuous D-statistics and hurdle checks',
      icon: Activity,
      badge: 'WORKSPACE 04'
    },
    {
      name: 'Adversarial MIA Defense Suite',
      path: '/privacy',
      desc: 'Black-box shadow model attacks and Nearest Real Neighbor caliper',
      icon: ShieldCheck,
      badge: 'WORKSPACE 05'
    }
  ];

  const dynamicsItems = [
    {
      name: 'Longitudinal Continuum',
      path: '/patient',
      desc: 'AR(1) Ornstein-Uhlenbeck stochastic trajectory timelines',
      icon: UserCheck,
      badge: 'WORKSPACE 06'
    },
    {
      name: 'Developer API Gateway Hub',
      path: '/api-hub',
      desc: 'Manage X-API-Key credentials and explore cURL / Python snippets',
      icon: Terminal,
      badge: 'WORKSPACE 07'
    },
    {
      name: 'Concurrency Stress Benchmark',
      path: '/stress-test',
      desc: 'Benchmark sampling throughput and measure latency percentiles',
      icon: Flame,
      badge: 'WORKSPACE 08'
    }
  ];

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  // 1. MINIMAL HEADER FOR LOGIN / REGISTER
  if (isAuthPage) {
    return (
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          width: '100%',
          backgroundColor: 'rgba(11, 11, 13, 0.95)',
          backdropFilter: 'blur(14px)',
          WebkitBackdropFilter: 'blur(14px)',
          borderBottom: '1px solid var(--hairline-dark)',
          padding: '0.85rem 2rem',
          color: 'var(--ivory)'
        }}
      >
        <div style={{
          maxWidth: 1320,
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem', textDecoration: 'none' }}>
            <span style={{
              fontFamily: "'Newsreader', serif",
              fontWeight: 600,
              fontSize: 22,
              letterSpacing: '-0.02em',
              color: 'var(--ivory)'
            }}>
              SYNTHIA
            </span>
            <span style={{
              fontSize: 9.5,
              fontFamily: "'JetBrains Mono', monospace",
              letterSpacing: '0.08em',
              color: 'rgba(245, 243, 238, 0.45)',
              textTransform: 'uppercase'
            }}>
              RESEARCH ED.
            </span>
          </Link>

          <Link
            to="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              fontSize: 12.5,
              color: 'rgba(245, 243, 238, 0.8)',
              textDecoration: 'none',
              fontFamily: "'IBM Plex Sans', sans-serif",
              transition: 'color 140ms ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#FFFFFF'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(245, 243, 238, 0.8)'}
          >
            <ArrowLeft size={13} />
            <span>Return to Platform Overview</span>
          </Link>
        </div>
      </header>
    );
  }

  // 2. MAIN HEADER (LANDING & AUTHENTICATED WORKSPACES)
  return (
    <>
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          width: '100%',
          transform: isVisible ? 'translateY(0)' : 'translateY(-100%)',
          transition: 'transform 240ms cubic-bezier(0.16, 1, 0.3, 1), background-color 200ms ease, border-color 200ms ease, box-shadow 200ms ease',
          backgroundColor: isScrolled ? 'rgba(11, 11, 13, 0.94)' : 'rgba(11, 11, 13, 0.82)',
          backdropFilter: 'blur(14px)',
          WebkitBackdropFilter: 'blur(14px)',
          borderBottom: isScrolled ? '1px solid var(--hairline-dark)' : '1px solid rgba(255, 255, 255, 0.06)',
          boxShadow: isScrolled ? '0 4px 20px rgba(0, 0, 0, 0.35)' : 'none',
          color: 'var(--ivory)'
        }}
      >
        {/* Top Diagnostic Telemetry Strip */}
        <div style={{
          borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
          padding: '3px 2rem',
          fontSize: 10,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          color: 'rgba(245, 243, 238, 0.55)',
          fontFamily: "'JetBrains Mono', monospace"
        }} className="desktop-only">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
              <span className="pulse-dot" style={{ width: 5, height: 5, borderRadius: '50%', backgroundColor: '#10B981' }}></span>
              <span>HOLDOUT ENCRYPTED: SHA-256 (345a320b...)</span>
            </span>
            <span style={{ opacity: 0.3 }}>|</span>
            <span>REPRODUCIBILITY SEED: 42</span>
            <span style={{ opacity: 0.3 }}>|</span>
            <span>MODEL: GAUSSIAN COPULA REVIEW PACKAGE</span>
          </div>

          <div>SH-405 CLINICAL EVALUATION PLATFORM</div>
        </div>

        {/* Main Navigation Bar */}
        <div style={{
          maxWidth: 1320,
          margin: '0 auto',
          padding: '0 2rem',
          height: 56,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1.25rem'
        }}>
          {/* Monograph Brandmark */}
          <Link to="/" style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem', textDecoration: 'none', flexShrink: 0 }}>
            <span style={{
              fontFamily: "'Newsreader', serif",
              fontWeight: 600,
              fontSize: 22,
              letterSpacing: '-0.02em',
              color: 'var(--ivory)'
            }}>
              SYNTHIA
            </span>
            <span style={{
              fontSize: 9.5,
              fontFamily: "'JetBrains Mono', monospace",
              letterSpacing: '0.08em',
              color: 'rgba(245, 243, 238, 0.45)',
              textTransform: 'uppercase'
            }}>
              RESEARCH ED.
            </span>
          </Link>

          {/* Desktop Nav: Either Authenticated Workspaces or Public Sections */}
          {isAuthenticated ? (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              height: '100%'
            }} className="desktop-nav">
              <Link
                to="/"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  fontSize: 12.5,
                  fontWeight: location.pathname === '/' ? 600 : 500,
                  color: location.pathname === '/' ? '#FFFFFF' : 'rgba(245, 243, 238, 0.7)',
                  padding: '0 8px',
                  height: '100%',
                  borderBottom: location.pathname === '/' ? '2px solid var(--iris)' : '2px solid transparent',
                  transition: 'color 140ms ease'
                }}
              >
                Methodology
              </Link>

              <NavDropdown
                label="Generative Engines"
                items={generativeItems}
                category="CLINICAL SAMPLING WORKSPACES"
              />

              <NavDropdown
                label="Fidelity & Privacy"
                items={auditItems}
                category="PEER-REVIEW AUDIT SUITE"
              />

              <NavDropdown
                label="Dynamics & Labs"
                items={dynamicsItems}
                category="LONGITUDINAL & BENCHMARK TOOLS"
              />
            </div>
          ) : (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1.5rem',
              height: '100%'
            }} className="desktop-nav">
              <a
                href="#top"
                onClick={(e) => handleAnchorClick(e, 'top')}
                style={{
                  fontSize: 12.5,
                  fontWeight: 500,
                  color: 'rgba(245, 243, 238, 0.75)',
                  textDecoration: 'none',
                  transition: 'color 140ms ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#FFFFFF'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(245, 243, 238, 0.75)'}
              >
                Platform
              </a>
              <a
                href="#methodology"
                onClick={(e) => handleAnchorClick(e, 'methodology')}
                style={{
                  fontSize: 12.5,
                  fontWeight: 500,
                  color: 'rgba(245, 243, 238, 0.75)',
                  textDecoration: 'none',
                  transition: 'color 140ms ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#FFFFFF'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(245, 243, 238, 0.75)'}
              >
                Methodology
              </a>
              <a
                href="#benchmarks"
                onClick={(e) => handleAnchorClick(e, 'benchmarks')}
                style={{
                  fontSize: 12.5,
                  fontWeight: 500,
                  color: 'rgba(245, 243, 238, 0.75)',
                  textDecoration: 'none',
                  transition: 'color 140ms ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#FFFFFF'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(245, 243, 238, 0.75)'}
              >
                Clinical Fidelity
              </a>
              <a
                href="#privacy"
                onClick={(e) => handleAnchorClick(e, 'privacy')}
                style={{
                  fontSize: 12.5,
                  fontWeight: 500,
                  color: 'rgba(245, 243, 238, 0.75)',
                  textDecoration: 'none',
                  transition: 'color 140ms ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#FFFFFF'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(245, 243, 238, 0.75)'}
              >
                Privacy Guardrails
              </a>
              <a
                href="#dynamics"
                onClick={(e) => handleAnchorClick(e, 'dynamics')}
                style={{
                  fontSize: 12.5,
                  fontWeight: 500,
                  color: 'rgba(245, 243, 238, 0.75)',
                  textDecoration: 'none',
                  transition: 'color 140ms ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#FFFFFF'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(245, 243, 238, 0.75)'}
              >
                Longitudinal Dynamics
              </a>
            </div>
          )}

          {/* Right Action Group: Authenticated vs Public Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
            {isAuthenticated ? (
              <>
                {/* Command Palette Trigger Button */}
                <button
                  onClick={() => setIsCommandPaletteOpen(true)}
                  aria-label="Open Command Palette"
                  title="Search workspaces and tools (⌘K / Ctrl+K)"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    backgroundColor: 'rgba(255, 255, 255, 0.06)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    color: 'rgba(245, 243, 238, 0.75)',
                    borderRadius: 4,
                    padding: '0.35rem 0.65rem',
                    fontSize: 11.5,
                    cursor: 'pointer',
                    fontFamily: "'IBM Plex Sans', sans-serif",
                    transition: 'background-color 140ms ease, border-color 140ms ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.12)';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.25)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.06)';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)';
                  }}
                >
                  <Search size={12} />
                  <span className="desktop-only" style={{ opacity: 0.8 }}>Quick search</span>
                  <span className="badge-telemetry badge-telemetry-neutral" style={{ fontSize: 9.5, padding: '1px 5px' }}>
                    {isMac ? '⌘K' : 'Ctrl+K'}
                  </span>
                </button>

                {/* Auth user status & Security modal trigger */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }} className="desktop-only">
                  <button
                    onClick={() => setIsSecurityModalOpen(true)}
                    title="Security Credentials & Session Audit"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      backgroundColor: 'rgba(255, 255, 255, 0.06)',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      borderRadius: 3,
                      padding: '0.3rem 0.55rem',
                      cursor: 'pointer',
                      color: 'rgba(245, 243, 238, 0.85)',
                      transition: 'background-color 140ms ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.12)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.06)'}
                  >
                    <ShieldCheck size={13} style={{ color: '#10B981' }} />
                    <span className="mono" style={{
                      fontSize: 11,
                      maxWidth: 110,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {user?.email}
                    </span>
                  </button>
                  <button
                    onClick={handleSignOut}
                    className="btn btn-outline-dark"
                    style={{ padding: '0.3rem 0.55rem', fontSize: 11 }}
                    title="Sign Out"
                  >
                    <LogOut size={12} />
                  </button>
                </div>

                {/* Authenticated Workspace CTA */}
                <Link
                  to="/create"
                  className="btn btn-iris"
                  style={{
                    padding: '0.45rem 1.1rem',
                    fontSize: 12.5,
                    fontWeight: 600,
                    borderRadius: 3,
                    boxShadow: '0 2px 8px rgba(88, 59, 214, 0.35)'
                  }}
                >
                  <span>Launch Studio</span>
                  <ArrowRight size={13} />
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="btn btn-outline-dark"
                  style={{ padding: '0.38rem 0.85rem', fontSize: 12 }}
                >
                  <LogIn size={13} />
                  <span>Sign In</span>
                </Link>

                <Link
                  to="/register"
                  className="btn btn-iris"
                  style={{
                    padding: '0.42rem 1.05rem',
                    fontSize: 12.5,
                    fontWeight: 600,
                    borderRadius: 3,
                    boxShadow: '0 2px 8px rgba(88, 59, 214, 0.35)'
                  }}
                >
                  <span>Register Profile</span>
                  <ArrowRight size={13} />
                </Link>
              </>
            )}

            {/* Mobile Hamburger Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open Mobile Menu"
              aria-expanded={mobileMenuOpen}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--ivory)',
                cursor: 'pointer',
                display: 'none',
                padding: '0.4rem'
              }}
              className="mobile-menu-btn"
            >
              <Menu size={22} />
            </button>
          </div>
        </div>
      </header>

      {/* =========================================================================
          FULL-SCREEN SLIDE-IN MOBILE DRAWER
          Locks body scroll, accessible close button, conditional public/auth modes
          ========================================================================= */}
      {mobileMenuOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Mobile Navigation"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            backgroundColor: 'rgba(11, 11, 13, 0.98)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            display: 'flex',
            flexDirection: 'column',
            animation: 'fadeIn 200ms ease-out',
            color: 'var(--ivory)',
            overflowY: 'auto'
          }}
        >
          {/* Drawer Top Affordance Bar */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1.25rem 2rem',
            borderBottom: '1px solid var(--hairline-dark)'
          }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem' }}>
              <span style={{ fontFamily: "'Newsreader', serif", fontSize: 22, fontWeight: 600 }}>SYNTHIA</span>
              <span className="mono" style={{ fontSize: 10, color: 'var(--text-faint)' }}>
                {isAuthenticated ? 'WORKSPACE' : 'EXPLORATION'}
              </span>
            </div>

            <button
              onClick={() => setMobileMenuOpen(false)}
              aria-label="Close Mobile Navigation"
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: 'var(--ivory)',
                borderRadius: 4,
                width: 36,
                height: 36,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <X size={18} />
            </button>
          </div>

          {isAuthenticated ? (
            /* AUTHENTICATED MOBILE DRAWER */
            <>
              <div style={{ padding: '1.5rem 2rem 0.5rem' }}>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setIsCommandPaletteOpen(true);
                  }}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem 1rem',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: 4,
                    color: 'rgba(245, 243, 238, 0.7)',
                    fontSize: 13,
                    cursor: 'pointer'
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Search size={14} />
                    <span>Search workspaces or diagnostics...</span>
                  </span>
                  <span className="badge-telemetry badge-telemetry-neutral" style={{ fontSize: 10 }}>⌘K</span>
                </button>
              </div>

              <div style={{ padding: '1.5rem 2rem 2.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {/* Category 1 */}
                <div>
                  <div className="label-tag" style={{ color: 'var(--iris-soft)', marginBottom: '0.75rem' }}>
                    <span>GENERATIVE ENGINES</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {generativeItems.map((item, idx) => (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => setMobileMenuOpen(false)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '0.75rem 1rem',
                          borderRadius: 4,
                          backgroundColor: 'rgba(255, 255, 255, 0.03)',
                          border: '1px solid rgba(255, 255, 255, 0.06)',
                          animation: `fadeIn 300ms ease-out ${idx * 60}ms forwards`
                        }}
                      >
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 600 }}>{item.name}</div>
                          <div style={{ fontSize: 11.5, color: 'rgba(245, 243, 238, 0.55)' }}>{item.desc}</div>
                        </div>
                        <ArrowRight size={14} style={{ color: 'var(--iris-soft)' }} />
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Category 2 */}
                <div>
                  <div className="label-tag" style={{ color: 'var(--iris-soft)', marginBottom: '0.75rem' }}>
                    <span>FIDELITY & PRIVACY AUDIT</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {auditItems.map((item, idx) => (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => setMobileMenuOpen(false)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '0.75rem 1rem',
                          borderRadius: 4,
                          backgroundColor: 'rgba(255, 255, 255, 0.03)',
                          border: '1px solid rgba(255, 255, 255, 0.06)',
                          animation: `fadeIn 300ms ease-out ${(idx + 2) * 60}ms forwards`
                        }}
                      >
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 600 }}>{item.name}</div>
                          <div style={{ fontSize: 11.5, color: 'rgba(245, 243, 238, 0.55)' }}>{item.desc}</div>
                        </div>
                        <ArrowRight size={14} style={{ color: 'var(--iris-soft)' }} />
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Category 3 */}
                <div>
                  <div className="label-tag" style={{ color: 'var(--iris-soft)', marginBottom: '0.75rem' }}>
                    <span>LONGITUDINAL & DEVELOPER TOOLS</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {dynamicsItems.map((item, idx) => (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => setMobileMenuOpen(false)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '0.75rem 1rem',
                          borderRadius: 4,
                          backgroundColor: 'rgba(255, 255, 255, 0.03)',
                          border: '1px solid rgba(255, 255, 255, 0.06)',
                          animation: `fadeIn 300ms ease-out ${(idx + 4) * 60}ms forwards`
                        }}
                      >
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 600 }}>{item.name}</div>
                          <div style={{ fontSize: 11.5, color: 'rgba(245, 243, 238, 0.55)' }}>{item.desc}</div>
                        </div>
                        <ArrowRight size={14} style={{ color: 'var(--iris-soft)' }} />
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Auth Action in Drawer */}
                <div style={{ paddingTop: '1rem', borderTop: '1px solid var(--hairline-dark)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                    <span className="mono" style={{ fontSize: 12 }}>{user?.email}</span>
                    <button onClick={handleSignOut} className="btn btn-outline-dark" style={{ padding: '0.4rem 0.8rem' }}>
                      <LogOut size={13} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            /* UNAUTHENTICATED MOBILE DRAWER */
            <div style={{ padding: '1.5rem 2rem 2.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <div className="label-tag" style={{ color: 'var(--iris-soft)', marginBottom: '0.75rem' }}>
                  <span>PLATFORM EXPLORATION</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  {[
                    { name: 'Platform Overview', desc: 'SH-405 methodological framework & monograph', id: 'top' },
                    { name: 'Methodology & Covariance', desc: 'Learned continuous multivariate copula structure', id: 'methodology' },
                    { name: 'Clinical Fidelity Diagnostics', desc: 'Kolmogorov-Smirnov distance & hurdle preservation', id: 'benchmarks' },
                    { name: 'Adversarial MIA Guardrails', desc: 'Shadow model defenses and zero identity leakage', id: 'privacy' },
                    { name: 'Longitudinal Dynamics', desc: 'Ornstein-Uhlenbeck continuous trajectory drift', id: 'dynamics' }
                  ].map((item, idx) => (
                    <a
                      key={item.id}
                      href={`#${item.id}`}
                      onClick={(e) => handleAnchorClick(e, item.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.85rem 1rem',
                        borderRadius: 4,
                        backgroundColor: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid rgba(255, 255, 255, 0.06)',
                        textDecoration: 'none',
                        color: 'var(--ivory)',
                        animation: `fadeIn 300ms ease-out ${idx * 50}ms forwards`
                      }}
                    >
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600 }}>{item.name}</div>
                        <div style={{ fontSize: 11.5, color: 'rgba(245, 243, 238, 0.55)' }}>{item.desc}</div>
                      </div>
                      <ArrowRight size={14} style={{ color: 'var(--iris-soft)' }} />
                    </a>
                  ))}
                </div>
              </div>

              <div style={{ paddingTop: '1.5rem', borderTop: '1px solid var(--hairline-dark)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="btn btn-outline-dark"
                  style={{ width: '100%', padding: '0.75rem', justifyContent: 'center', fontSize: 13 }}
                >
                  <LogIn size={14} />
                  <span>Sign In to Clinical Workspace</span>
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="btn btn-iris"
                  style={{ width: '100%', padding: '0.75rem', justifyContent: 'center', fontSize: 13 }}
                >
                  <span>Register New Profile</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Authenticated Modals */}
      {isAuthenticated && (
        <>
          <CommandPalette
            isOpen={isCommandPaletteOpen}
            onClose={() => setIsCommandPaletteOpen(false)}
          />
          <SessionSecurityModal
            isOpen={isSecurityModalOpen}
            onClose={() => setIsSecurityModalOpen(false)}
            onOpenMfa={() => setIsMfaModalOpen(true)}
          />
          <MfaSettingsModal
            isOpen={isMfaModalOpen}
            onClose={() => setIsMfaModalOpen(false)}
          />
        </>
      )}

      <style>{`
        @media (max-width: 960px) {
          .desktop-nav { display: none !important; }
          .desktop-only { display: none !important; }
          .mobile-menu-btn { display: inline-flex !important; }
        }
      `}</style>
    </>
  );
}
