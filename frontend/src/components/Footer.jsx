import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, BookOpen, GitBranch } from 'lucide-react';

export default function Footer() {
  return (
    <footer style={{
      backgroundColor: 'var(--ink-black)',
      borderTop: '1px solid var(--hairline-dark)',
      color: 'rgba(245, 243, 238, 0.75)',
      padding: '4.5rem 0 2.5rem',
      marginTop: 'auto'
    }}>
      <div className="wrap">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '3rem',
          marginBottom: '3.5rem'
        }}>
          {/* Monograph Identification */}
          <div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem', marginBottom: '0.85rem' }}>
              <span style={{
                fontFamily: "'Newsreader', serif",
                fontSize: 22,
                fontWeight: 600,
                color: 'var(--ivory)'
              }}>
                SYNTHIA
              </span>
              <span style={{
                fontSize: 10,
                fontFamily: "'JetBrains Mono', monospace",
                color: 'rgba(245, 243, 238, 0.5)'
              }}>
                SH-405 PLATFORM
              </span>
            </div>
            <p style={{ fontSize: 12.5, lineHeight: 1.65, color: 'rgba(245, 243, 238, 0.6)', maxWidth: 300, marginBottom: '1rem' }}>
              An end-to-end clinical research platform for multivariate Gaussian copula patient generation, membership-inference attack resistance, and continuous longitudinal simulation.
            </p>
            <div className="mono" style={{ fontSize: 11, color: 'rgba(245, 243, 238, 0.45)' }}>
              REPRODUCIBILITY SEED: 42 | N = 4,826
            </div>
          </div>

          {/* Module Directory */}
          <div>
            <div className="label-tag" style={{ color: 'var(--ivory)', opacity: 0.8, marginBottom: '1rem' }}>
              <span>CLINICAL WORKSPACES</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem', fontSize: 12.5 }}>
              <Link to="/create" style={{ color: 'rgba(245, 243, 238, 0.85)' }}>Cohort Formulation Studio</Link>
              <Link to="/generate" style={{ color: 'rgba(245, 243, 238, 0.85)' }}>Gaussian Copula Sampling Engine</Link>
              <Link to="/patient" style={{ color: 'rgba(245, 243, 238, 0.85)' }}>Longitudinal Continuum & Trajectories</Link>
              <Link to="/patient" style={{ color: 'rgba(245, 243, 238, 0.85)' }}>Counterfactual "What-If" Interventions</Link>
            </div>
          </div>

          {/* Governance & Privacy */}
          <div>
            <div className="label-tag" style={{ color: 'var(--ivory)', opacity: 0.8, marginBottom: '1rem' }}>
              <span>AUDIT & PRIVACY</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem', fontSize: 12.5 }}>
              <Link to="/validation" style={{ color: 'rgba(245, 243, 238, 0.85)' }}>Kolmogorov-Smirnov Marginal Diagnostics</Link>
              <Link to="/privacy" style={{ color: 'rgba(245, 243, 238, 0.85)' }}>Membership Inference Attack (MIA) Suite</Link>
              <Link to="/privacy" style={{ color: 'rgba(245, 243, 238, 0.85)' }}>Nearest Real Neighbor Caliper Audit</Link>
              <Link to="/stress-test" style={{ color: 'rgba(245, 243, 238, 0.85)' }}>Throughput & Concurrency Benchmark</Link>
            </div>
          </div>

          {/* Regulatory & Standards */}
          <div>
            <div className="label-tag" style={{ color: 'var(--ivory)', opacity: 0.8, marginBottom: '1rem' }}>
              <span>GOVERNANCE BENCHMARKS</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem', fontSize: 12, color: 'rgba(245, 243, 238, 0.6)' }}>
              <div>HIPAA Expert Determination Standard</div>
              <div>GDPR Recital 26 Empirical Non-Identifiability</div>
              <div>NHANES 1999–2018 Multi-Cycle Benchmark</div>
              <div>Zero 1:1 Identity Replication Guarantee</div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div style={{
          paddingTop: '1.75rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          fontSize: 11.5,
          color: 'rgba(245, 243, 238, 0.45)',
          fontFamily: "'JetBrains Mono', monospace"
        }}>
          <div>SH-405 SYNTHIA CLINICAL RESEARCH REPORT PACKAGE (BUILD 2026.09)</div>
          <div>DISCLAIMER: MODEL GENERATED SYNTHETIC DATA &mdash; NOT A DIRECT DIAGNOSTIC TOOL</div>
        </div>
      </div>
    </footer>
  );
}
