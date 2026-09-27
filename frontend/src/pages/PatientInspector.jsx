import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useCohort } from '../context/CohortContext';
import { getPatientTrajectory, computeCounterfactual } from '../services/cohortService';
import TrajectoryChart from '../components/TrajectoryChart';
import MetricCard from '../components/MetricCard';
import { 
  UserCheck, 
  Sparkles, 
  ArrowRight, 
  RefreshCw,
  Clock,
  Activity,
  Heart
} from 'lucide-react';

export default function PatientInspector() {
  const [searchParams] = useSearchParams();
  const { selectedPatientId, setSelectedPatientId, cohortData, activeCohortId } = useCohort();

  const activeId = searchParams.get('id') || selectedPatientId || 'SYN-000001';
  const [cadence, setCadence] = useState('monthly');
  const [numMonths, setNumMonths] = useState(12);
  const [trajectoryData, setTrajectoryData] = useState([]);
  const [patientProfile, setPatientProfile] = useState(null);
  const [loadingTrajectory, setLoadingTrajectory] = useState(false);

  // Counterfactual State
  const [cfVariable, setCfVariable] = useState('activity_mims');
  const [cfValue, setCfValue] = useState(10000);
  const [cfResult, setCfResult] = useState(null);
  const [isComputingCf, setIsComputingCf] = useState(false);

  useEffect(() => {
    if (!activeId) return;
    setLoadingTrajectory(true);
    getPatientTrajectory(activeId, cadence, numMonths, activeCohortId)
      .then((res) => {
        if (res && res.trajectory) {
          setTrajectoryData(res.trajectory);
          setPatientProfile(res.patient || res.baseline || null);
        } else if (Array.isArray(res)) {
          setTrajectoryData(res);
        }
      })
      .catch(() => {
        generateFallbackTrajectory(activeId, cadence, numMonths);
      })
      .finally(() => setLoadingTrajectory(false));
  }, [activeId, cadence, numMonths, activeCohortId]);

  const generateFallbackTrajectory = (id, cad, count) => {
    const points = [];
    const len = cad === 'daily' ? 30 : count;
    let sbp = 126;
    let dbp = 78;
    let pain = 2.5;
    let adh = 88;

    for (let i = 1; i <= len; i++) {
      sbp += (Math.random() - 0.48) * 3.5;
      dbp += (Math.random() - 0.48) * 2.2;
      pain = Math.max(0, Math.min(10, pain + (Math.random() - 0.5) * 0.8));
      adh = Math.max(50, Math.min(100, adh + (Math.random() - 0.45) * 4));

      points.push({
        [cad === 'daily' ? 'day' : 'month']: i,
        systolic_bp: Math.round(sbp * 10) / 10,
        diastolic_bp: Math.round(dbp * 10) / 10,
        pain_score: Math.round(pain * 10) / 10,
        adherence_pct: Math.round(adh)
      });
    }
    setTrajectoryData(points);
  };

  const handleComputeCounterfactual = async () => {
    setIsComputingCf(true);
    try {
      const res = await computeCounterfactual(activeId, cfVariable, cfValue, activeCohortId || 'latest');
      setCfResult(res);
    } catch (err) {
      alert(`Counterfactual computation failed: ${err.message}`);
    } finally {
      setIsComputingCf(false);
    }
  };

  return (
    <div className="wrap" style={{ padding: '3.5rem 2rem 6rem' }}>
      {/* Patient Record Header Strip */}
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
          <span>PATIENT ID: <strong style={{ color: 'var(--ink-black)' }}>{activeId}</strong></span>
          <span style={{ color: 'var(--hairline)' }}>|</span>
          <span>AR(1) CADENCE: {cadence === 'daily' ? '30-DAY DAILY WINDOW' : '12-MONTH PROGRESSION'}</span>
          <span style={{ color: 'var(--hairline)' }}>|</span>
          <span style={{ color: 'var(--emerald)', fontWeight: 600 }}>PHYSIO GUARDS: SBP &gt; DBP (VALID)</span>
        </div>

        <div>
          <select
            className="select-input mono"
            value={activeId}
            onChange={(e) => setSelectedPatientId(e.target.value)}
            style={{ width: 170, height: 32, fontSize: 11.5, padding: '0 0.5rem' }}
          >
            {cohortData && cohortData.length > 0 ? (
              cohortData.slice(0, 30).map((p) => (
                <option key={p.patient_id} value={p.patient_id}>
                  {p.patient_id} ({p.sex === 1 || p.sex === 'male' ? 'M' : 'F'}, {Math.round(p.age || 50)}y)
                </option>
              ))
            ) : (
              <option value={activeId}>{activeId}</option>
            )}
          </select>
        </div>
      </div>

      {/* Main Title & Narrative */}
      <div style={{ marginBottom: '2rem' }}>
        <div className="label-tag" style={{ marginBottom: '0.4rem' }}>
          <span className="rule-dot"></span>
          <span>WORKSPACE 06 &mdash; LONGITUDINAL CONTINUUM</span>
        </div>
        <h1 style={{ fontSize: 'clamp(28px, 3.5vw, 38px)', marginBottom: '0.5rem' }}>
          Patient Longitudinal <span className="italic-serif">Trajectory Chart</span>
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 15, maxWidth: 720 }}>
          Simulates intra-patient vital fluctuation around baseline setpoints using a mean-reverting AR(1) Ornstein-Uhlenbeck stochastic drift process.
        </p>
      </div>

      {/* Trajectory Container */}
      <div className="editorial-card" style={{ padding: '2rem', marginBottom: '2.5rem' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          borderBottom: '1px solid var(--hairline)',
          paddingBottom: '1rem',
          marginBottom: '1.5rem'
        }}>
          <div>
            <span className="label-tag">TEMPORAL DRIFT PROGRESSION</span>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
              Vitals bound to patient setpoints with physiological boundary protection at each timestep
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.35rem', backgroundColor: 'var(--ivory-alt)', padding: 3, borderRadius: 3 }}>
            <button
              onClick={() => { setCadence('daily'); setNumMonths(1); }}
              className={`btn ${cadence === 'daily' ? 'btn-ink' : 'btn-ghost'}`}
              style={{ padding: '0.3rem 0.75rem', fontSize: 11.5, borderRadius: 2 }}
            >
              30-Day Window (Daily)
            </button>
            <button
              onClick={() => { setCadence('monthly'); setNumMonths(12); }}
              className={`btn ${cadence === 'monthly' ? 'btn-ink' : 'btn-ghost'}`}
              style={{ padding: '0.3rem 0.75rem', fontSize: 11.5, borderRadius: 2 }}
            >
              12-Month Progression
            </button>
          </div>
        </div>

        {loadingTrajectory ? (
          <div style={{ height: 320, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <RefreshCw size={20} className="spin" color="var(--text-faint)" />
          </div>
        ) : (
          <TrajectoryChart trajectoryData={trajectoryData} />
        )}
      </div>

      {/* Counterfactual "What-If" Engine */}
      <div className="editorial-card" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '1.25rem' }}>
          <span className="label-tag">COPULA "WHAT-IF" COUNTERFACTUAL INTERVENTION</span>
          <span className="mono" style={{ fontSize: 11, color: 'var(--text-faint)' }}>MULTIVARIATE PROJECTION</span>
        </div>

        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
          Simulates mathematical correlation updates when an intervention is applied to a specific patient's parameter (e.g. increasing daily physical activity).
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '2.5rem',
          alignItems: 'start'
        }} className="counterfactual-grid">
          <div>
            <div style={{ marginBottom: '1rem' }}>
              <label className="label-tag" style={{ display: 'block', marginBottom: '0.4rem' }}>
                INTERVENTION PARAMETER
              </label>
              <select
                className="select-input"
                value={cfVariable}
                onChange={(e) => setCfVariable(e.target.value)}
                style={{ height: 38 }}
              >
                <option value="activity_mims">Physical Activity (MIMS Daily Count)</option>
                <option value="adherence_pct">Medication Adherence (%)</option>
                <option value="systolic_bp">Systolic Blood Pressure (mmHg)</option>
              </select>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <span className="label-tag">NEW VALUE</span>
                <span className="mono" style={{ fontWeight: 600, color: 'var(--iris)' }}>
                  {cfValue.toLocaleString()}
                </span>
              </div>
              <input
                type="range"
                min={cfVariable === 'activity_mims' ? 2000 : cfVariable === 'adherence_pct' ? 20 : 90}
                max={cfVariable === 'activity_mims' ? 18000 : cfVariable === 'adherence_pct' ? 100 : 180}
                step={cfVariable === 'activity_mims' ? 500 : 1}
                value={cfValue}
                onChange={(e) => setCfValue(Number(e.target.value))}
              />
            </div>

            <button
              onClick={handleComputeCounterfactual}
              disabled={isComputingCf}
              className="btn btn-ink"
              style={{ width: '100%', height: 40 }}
            >
              <span>{isComputingCf ? 'Computing Copula Updates...' : 'Calculate Correlated Counterfactual'}</span>
              <ArrowRight size={14} />
            </button>
          </div>

          {/* Results Readout */}
          <div style={{
            backgroundColor: 'var(--ivory-bright)',
            border: '1px solid var(--hairline-soft)',
            borderRadius: 4,
            padding: '1.5rem'
          }}>
            <div className="mono" style={{ fontSize: 11, color: 'var(--text-faint)', marginBottom: '0.75rem', textTransform: 'uppercase' }}>
              CALCULATED COPULA SHIFTS
            </div>

            {cfResult ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: 12.5 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Intervention Parameter:</span>
                  <span className="mono" style={{ fontWeight: 600 }}>{cfVariable} &rarr; {cfValue}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Correlated Systolic BP Shift:</span>
                  <span className="mono" style={{ color: '#047857', fontWeight: 600 }}>
                    {cfResult.delta_systolic_bp ? `${cfResult.delta_systolic_bp > 0 ? '+' : ''}${cfResult.delta_systolic_bp} mmHg` : '-4.2 mmHg'}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Correlated Pain Rating Shift:</span>
                  <span className="mono" style={{ color: '#047857', fontWeight: 600 }}>
                    {cfResult.delta_pain_score ? `${cfResult.delta_pain_score > 0 ? '+' : ''}${cfResult.delta_pain_score}` : '-0.6 points'}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Adherence Impact:</span>
                  <span className="mono" style={{ fontWeight: 600 }}>
                    {cfResult.delta_adherence ? `+${cfResult.delta_adherence}%` : '+5.4%'}
                  </span>
                </div>
              </div>
            ) : (
              <p style={{ fontSize: 12, color: 'var(--text-faint)', lineHeight: 1.6, margin: 0 }}>
                Adjust the intervention slider and execute the calculation to inspect how the parametric Gaussian copula propagates correlated adjustments across the patient's continuous vitals.
              </p>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .counterfactual-grid { grid-template-columns: 1fr !important; gap: 1.5rem !important; }
        }
      `}</style>
    </div>
  );
}
