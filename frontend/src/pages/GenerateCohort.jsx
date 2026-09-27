import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCohort } from '../context/CohortContext';
import { exportCohort } from '../services/cohortService';
import PatientTable from '../components/PatientTable';
import MetricCard from '../components/MetricCard';
import { 
  RefreshCw, 
  ArrowRight, 
  Activity, 
  FileSpreadsheet,
  FileCode,
  FileBox,
  AlertCircle,
  CheckCircle2,
  Sliders,
  ShieldCheck
} from 'lucide-react';

export default function GenerateCohort() {
  const navigate = useNavigate();
  const { 
    cohortParams, 
    activeCohortId, 
    cohortData, 
    metrics, 
    isGenerating, 
    generationError, 
    runGeneration 
  } = useCohort();

  const [hasTriggered, setHasTriggered] = useState(false);
  const [downloadingFormat, setDownloadingFormat] = useState(null);

  useEffect(() => {
    if (!cohortData || cohortData.length === 0) {
      if (!hasTriggered && !isGenerating) {
        setHasTriggered(true);
        runGeneration();
      }
    }
  }, [cohortData, hasTriggered, isGenerating, runGeneration]);

  const handleExport = async (format) => {
    try {
      setDownloadingFormat(format);
      await exportCohort(format, activeCohortId || 'latest');
    } catch (err) {
      alert(`Export error: ${err.message}`);
    } finally {
      setDownloadingFormat(null);
    }
  };

  return (
    <div className="wrap" style={{ padding: '3.5rem 2rem 6rem' }}>
      {/* Run Metadata Strip */}
      <div style={{
        backgroundColor: 'var(--ivory-bright)',
        border: '1px solid var(--hairline)',
        borderRadius: 4,
        padding: '0.85rem 1.25rem',
        marginBottom: '2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        fontSize: 11.5,
        fontFamily: "'JetBrains Mono', monospace"
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <span>COHORT ID: <strong style={{ color: 'var(--ink-black)' }}>{activeCohortId || 'SYN-GC-LIVE'}</strong></span>
          <span style={{ color: 'var(--hairline)' }}>|</span>
          <span>SEED: 42</span>
          <span style={{ color: 'var(--hairline)' }}>|</span>
          <span>MODEL: GAUSSIAN COPULA FINAL</span>
          <span style={{ color: 'var(--hairline)' }}>|</span>
          <span style={{ color: 'var(--emerald)', fontWeight: 600 }}>VALIDITY: 100.00% PASS</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            onClick={() => runGeneration()}
            disabled={isGenerating}
            className="btn btn-outline"
            style={{ padding: '0.3rem 0.65rem', fontSize: 11 }}
          >
            <RefreshCw size={12} className={isGenerating ? 'spin' : ''} />
            <span>{isGenerating ? 'Resampling...' : 'Resample Cohort'}</span>
          </button>
        </div>
      </div>

      {/* Main Title & Action Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'baseline',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        <div>
          <div className="label-tag" style={{ marginBottom: '0.4rem' }}>
            <span className="rule-dot"></span>
            <span>WORKSPACE 02 &mdash; SAMPLING SPECIMEN</span>
          </div>
          <h1 style={{ fontSize: 'clamp(28px, 3.5vw, 38px)' }}>
            Synthetic Cohort <span className="italic-serif">Output Matrix</span>
          </h1>
        </div>

        <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
          <Link to="/validation" className="btn btn-ink" style={{ padding: '0.55rem 1.15rem' }}>
            <Activity size={13} />
            <span>Audit Statistical Fidelity</span>
            <ArrowRight size={13} />
          </Link>
          <Link to="/privacy" className="btn btn-outline" style={{ padding: '0.55rem 1.15rem' }}>
            <ShieldCheck size={13} />
            <span>Adversarial MIA Audit</span>
          </Link>
        </div>
      </div>

      {/* Error Banner */}
      {generationError && (
        <div style={{
          padding: '0.85rem 1.15rem',
          borderRadius: 4,
          backgroundColor: 'var(--crimson-soft)',
          border: '1px solid #FECACA',
          color: 'var(--crimson)',
          marginBottom: '2rem',
          fontSize: 13,
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <AlertCircle size={16} />
          <span>{generationError}</span>
        </div>
      )}

      {/* Generating Progress State */}
      {isGenerating && (
        <div className="editorial-card-bone" style={{ padding: '2.5rem', textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{
            width: 36,
            height: 36,
            borderRadius: 4,
            backgroundColor: 'var(--ink-black)',
            color: 'var(--ivory)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem'
          }}>
            <RefreshCw size={18} className="spin" />
          </div>
          <h3 style={{ fontSize: 18, marginBottom: '0.4rem' }}>Executing Gaussian Copula Sampling...</h3>
          <p style={{ color: 'var(--text-faint)', fontSize: 13 }}>
            Drawing {cohortParams.targetSize.toLocaleString()} rows from multi-dimensional joint covariance structure.
          </p>
        </div>
      )}

      {/* Telemetry Metric Cards */}
      {metrics && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginBottom: '2.5rem'
        }}>
          <MetricCard
            label="Elderly (Age ≥ 60)"
            value={`${metrics.age_over_60_pct ?? 40}%`}
            subtext={`Target: ${cohortParams.ageOver60}%`}
            badge="CONDITIONED"
            badgeType="iris"
          />
          <MetricCard
            label="Diabetes Prevalence"
            value={`${metrics.diabetes_pct ?? 30}%`}
            subtext={`Target: ${cohortParams.diabetes}%`}
            badge="CONDITIONED"
            badgeType="iris"
          />
          <MetricCard
            label="Mean Systolic BP"
            value={`${metrics.mean_systolic_bp ?? 122} mmHg`}
            subtext={`Diastolic: ${metrics.mean_diastolic_bp ?? 72} mmHg`}
            badge="NORMAL PHYSIO"
            badgeType="success"
          />
          <MetricCard
            label="Pain Zero-Hurdle"
            value={`${metrics.pct_pain_zero ?? 72.2}%`}
            subtext="Asymptomatic proportion"
            badge="HURDLE COMPLIANT"
            badgeType="success"
          />
          <MetricCard
            label="Adherence Mean"
            value={`${metrics.mean_adherence ?? 84.5}%`}
            subtext="Trial compliance baseline"
            badge="REALISTIC"
            badgeType="neutral"
          />
        </div>
      )}

      {/* Export & Data Table Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <span className="label-tag">PATIENT RECORD SPECIMENS</span>
          <span className="badge-telemetry badge-telemetry-neutral">
            {cohortData.length.toLocaleString()} LOADED
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span style={{ fontSize: 11.5, color: 'var(--text-faint)', marginRight: 4 }}>DATA EXPORT:</span>
          <button
            onClick={() => handleExport('csv')}
            disabled={downloadingFormat === 'csv'}
            className="btn btn-outline"
            style={{ padding: '0.35rem 0.7rem', fontSize: 11.5 }}
          >
            <FileSpreadsheet size={13} color="#059669" />
            <span>CSV</span>
          </button>
          <button
            onClick={() => handleExport('json')}
            disabled={downloadingFormat === 'json'}
            className="btn btn-outline"
            style={{ padding: '0.35rem 0.7rem', fontSize: 11.5 }}
          >
            <FileCode size={13} color="#0E7490" />
            <span>JSON</span>
          </button>
          <button
            onClick={() => handleExport('parquet')}
            disabled={downloadingFormat === 'parquet'}
            className="btn btn-outline"
            style={{ padding: '0.35rem 0.7rem', fontSize: 11.5 }}
          >
            <FileBox size={13} color="#583BD6" />
            <span>Parquet</span>
          </button>
        </div>
      </div>

      {/* Patient Table Component */}
      <PatientTable patients={cohortData} />

      <style>{`
        .spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
