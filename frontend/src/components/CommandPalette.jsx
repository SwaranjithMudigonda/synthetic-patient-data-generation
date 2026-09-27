import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Dna, 
  Sliders, 
  Activity, 
  ShieldCheck, 
  UserCheck, 
  Terminal, 
  Flame, 
  FileSpreadsheet, 
  ArrowRight, 
  X,
  Sparkles,
  Command
} from 'lucide-react';

export default function CommandPalette({ isOpen, onClose }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const modalRef = useRef(null);

  const items = [
    {
      id: 'method',
      title: 'Methodology Framework',
      desc: 'Mathematical principles, continuous copulas, and scale expansion',
      category: 'Overview',
      path: '/',
      icon: Dna
    },
    {
      id: 'setup',
      title: 'Cohort Conditioning Console',
      desc: 'Natural language query parser and demographic target sliders',
      category: 'Generative Engine',
      path: '/create',
      icon: Sliders
    },
    {
      id: 'generate',
      title: 'Gaussian Copula Studio',
      desc: 'Execute joint continuous sampling with clinical rule compliance',
      category: 'Generative Engine',
      path: '/generate',
      icon: Dna
    },
    {
      id: 'validation',
      title: 'Statistical Fidelity Diagnostic',
      desc: 'Kolmogorov-Smirnov D-statistics and marginal covariance differences',
      category: 'Audit & Privacy',
      path: '/validation',
      icon: Activity
    },
    {
      id: 'privacy',
      title: 'Adversarial MIA Defense Suite',
      desc: 'Shadow model Membership Inference Attacks and Nearest Real Neighbor caliper',
      category: 'Audit & Privacy',
      path: '/privacy',
      icon: ShieldCheck
    },
    {
      id: 'patient',
      title: 'Longitudinal Continuum Inspector',
      desc: 'AR(1) Ornstein-Uhlenbeck stochastic trajectory timelines',
      category: 'Longitudinal Lab',
      path: '/patient',
      icon: UserCheck
    },
    {
      id: 'counterfactual',
      title: 'Copula "What-If" Counterfactuals',
      desc: 'Intervene on patient features and compute correlated multivariate shifts',
      category: 'Longitudinal Lab',
      path: '/patient?tab=counterfactual',
      icon: Sparkles
    },
    {
      id: 'api-hub',
      title: 'Developer Gateway & API Keys',
      desc: 'Manage X-API-Key tokens and explore Python/cURL integration snippets',
      category: 'Developer Tools',
      path: '/api-hub',
      icon: Terminal
    },
    {
      id: 'stress-test',
      title: 'Throughput & Concurrency Benchmark',
      desc: 'Simulate multi-threaded sampling load and measure latency percentiles',
      category: 'Developer Tools',
      path: '/stress-test',
      icon: Flame
    },
  ];

  // Filter items based on query
  const filtered = items.filter(item => {
    const q = query.toLowerCase();
    return item.title.toLowerCase().includes(q) || 
           item.desc.toLowerCase().includes(q) || 
           item.category.toLowerCase().includes(q);
  });

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Keyboard navigation & global shortcuts
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % (filtered.length || 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + (filtered.length || 1)) % (filtered.length || 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filtered[selectedIndex]) {
          navigate(filtered[selectedIndex].path);
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filtered, selectedIndex, navigate, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Command Palette"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        backgroundColor: 'rgba(11, 11, 13, 0.75)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        padding: '12vh 1.5rem 2rem',
        animation: 'fadeIn 150ms ease-out'
      }}
    >
      <div
        ref={modalRef}
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: 620,
          backgroundColor: '#FFFFFF',
          border: '1px solid var(--hairline)',
          borderRadius: 6,
          boxShadow: '0 20px 50px rgba(11, 11, 13, 0.35)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Search Input Bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          padding: '0.85rem 1.25rem',
          borderBottom: '1px solid var(--hairline)',
          gap: '0.75rem'
        }}>
          <Search size={17} style={{ color: 'var(--text-faint)' }} />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a clinical workspace, tool, or diagnostic..."
            value={query}
            onChange={(e) => { setQuery(e.target.value); setSelectedIndex(0); }}
            style={{
              width: '100%',
              border: 'none',
              outline: 'none',
              fontSize: 14,
              fontFamily: "'IBM Plex Sans', sans-serif",
              color: 'var(--ink-black)',
              backgroundColor: 'transparent'
            }}
          />
          <button
            onClick={onClose}
            aria-label="Close Command Palette"
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-faint)',
              cursor: 'pointer',
              padding: '2px',
              display: 'flex'
            }}
          >
            <span className="badge-telemetry badge-telemetry-neutral" style={{ fontSize: 10 }}>ESC</span>
          </button>
        </div>

        {/* Results List */}
        <div style={{ maxHeight: 380, overflowY: 'auto', padding: '0.5rem' }}>
          {filtered.length > 0 ? (
            filtered.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              const Icon = item.icon;
              return (
                <div
                  key={item.id}
                  onClick={() => {
                    navigate(item.path);
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem 1rem',
                    borderRadius: 4,
                    cursor: 'pointer',
                    backgroundColor: isSelected ? 'var(--ivory-alt)' : 'transparent',
                    border: isSelected ? '1px solid var(--hairline)' : '1px solid transparent',
                    transition: 'background-color 100ms ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                    <div style={{
                      width: 30,
                      height: 30,
                      borderRadius: 4,
                      backgroundColor: isSelected ? 'var(--ink-black)' : 'var(--ivory-bright)',
                      color: isSelected ? 'var(--ivory)' : 'var(--text-primary)',
                      border: '1px solid var(--hairline-soft)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Icon size={14} />
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-black)' }}>
                        {item.title}
                      </div>
                      <div style={{ fontSize: 11.5, color: 'var(--text-faint)' }}>
                        {item.desc}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span className="badge-telemetry badge-telemetry-neutral" style={{ fontSize: 9.5 }}>
                      {item.category}
                    </span>
                    {isSelected && <ArrowRight size={13} style={{ color: 'var(--iris)' }} />}
                  </div>
                </div>
              );
            })
          ) : (
            <div style={{ padding: '2.5rem 1rem', textAlign: 'center', color: 'var(--text-faint)', fontSize: 13 }}>
              No matching clinical tools or workspaces found for "{query}".
            </div>
          )}
        </div>

        {/* Footer Shortcut Bar */}
        <div style={{
          padding: '0.55rem 1.25rem',
          backgroundColor: 'var(--ivory-bright)',
          borderTop: '1px solid var(--hairline)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: 11,
          color: 'var(--text-faint)',
          fontFamily: "'JetBrains Mono', monospace"
        }}>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <span>&uarr;&darr; TO NAVIGATE</span>
            <span>&crarr; TO SELECT</span>
            <span>ESC TO DISMISS</span>
          </div>
          <div>SYNTHIA COMMAND BUS v2.0</div>
        </div>
      </div>
    </div>
  );
}
