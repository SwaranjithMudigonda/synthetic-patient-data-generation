import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCohort } from '../context/CohortContext';
import { interpretCohort } from '../services/cohortService';
import { 
  Sliders, 
  ArrowRight, 
  CheckCircle, 
  AlertCircle,
  Database,
  Sparkles,
  RefreshCw,
  Clock,
  Layers
} from 'lucide-react';

export default function CreateCohort() {
  const navigate = useNavigate();
  const { cohortParams, setCohortParams, updateParams } = useCohort();

  const [promptText, setPromptText] = useState('');
  const [isInterpreting, setIsInterpreting] = useState(false);
  const [interpretationFeedback, setInterpretationFeedback] = useState(null);
  const [selectedDataset, setSelectedDataset] = useState('nhanes_generative_train.csv');

  const presetQueries = [
    { label: 'Elderly Diabetic (60+ yrs, high glucose)', text: 'Generate 5,000 elderly patients over 60 with diabetes and low physical activity' },
    { label: 'Active Hypertensive (High SBP, high MIMS)', text: 'Generate 2,500 active adult patients with hypertension and high adherence' },
    { label: 'Sedentary Population (Low MIMS, chronic pain)', text: 'Generate 4,000 sedentary patients with elevated pain ratings' }
  ];

  const handleInterpret = async () => {
    if (!promptText.trim()) return;
    setIsInterpreting(true);
    setInterpretationFeedback(null);

    try {
      const res = await interpretCohort(promptText, cohortParams);
      if (res && res.success && res.requirements) {
        updateParams({
          targetSize: res.requirements.targetSize || cohortParams.targetSize,
          ageOver60: res.requirements.ageOver60 ?? cohortParams.ageOver60,
          diabetes: res.requirements.diabetes ?? cohortParams.diabetes,
          lowActivity: res.requirements.lowActivity ?? cohortParams.lowActivity
        });
        setInterpretationFeedback({
          type: 'success',
          message: res.summary || 'Clinical query interpreted successfully and parameters updated.'
        });
      } else {
        setInterpretationFeedback({
          type: 'error',
          message: res?.error || 'Could not parse query constraints. Please adjust sliders manually.'
        });
      }
    } catch {
      setInterpretationFeedback({
        type: 'error',
        message: 'Failed to contact NL parser. Please adjust sliders manually.'
      });
    } finally {
      setIsInterpreting(false);
    }
  };

  const handleSelectPreset = (text) => {
    setPromptText(text);
  };

  const handleProceed = () => {
    navigate('/generate');
  };

  // Compute calculated live demographic preview
  const countElderly = Math.round((cohortParams.targetSize * cohortParams.ageOver60) / 100);
  const countDiabetic = Math.round((cohortParams.targetSize * cohortParams.diabetes) / 100);
  const countSedentary = Math.round((cohortParams.targetSize * cohortParams.lowActivity) / 100);

  return (
    <div className="wrap" style={{ padding: '3.5rem 2rem 6rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '2.5rem' }}>
        <div className="label-tag" style={{ marginBottom: '0.6rem' }}>
          <span className="rule-dot"></span>
          <span>WORKSPACE 01 &mdash; COHORT CONDITIONING CONSOLE</span>
        </div>
        <h1 style={{ fontSize: 'clamp(30px, 3.8vw, 42px)', marginBottom: '0.75rem' }}>
          Condition Synthetic <span className="italic-serif">Patient Cohort</span>
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 15.5, lineHeight: 1.6, maxWidth: 720 }}>
          Specify multivariate marginals, target clinical prevalence, and demographic constraints. The Gaussian copula will fit empirical NHANES marginals while enforcing clinical boundaries at every step.
        </p>
      </div>

      {/* Two-Column Asymmetric Laboratory Layout */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1.25fr 0.85fr',
        gap: '2.5rem',
        alignItems: 'start'
      }} className="create-grid">
        
        {/* Left Column: Clinical Formulation Terminal & Direct Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Natural Language Clinical Query Form */}
          <div className="editorial-card" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.75rem' }}>
              <span className="label-tag">NATURAL LANGUAGE QUERY PARSER</span>
              <span className="mono" style={{ fontSize: 10.5, color: 'var(--text-faint)' }}>GEMINI & HEURISTIC ENGINE</span>
            </div>

            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: '1.25rem', lineHeight: 1.5 }}>
              Enter a clinical trial cohort requirement in plain English. The parser resolves threshold bounds into explicit parametric targets.
            </p>

            <div style={{ display: 'flex', gap: '0.6rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
              <input
                type="text"
                className="input-text"
                placeholder="e.g. 5,000 diabetic patients over 60 with sedentary activity..."
                value={promptText}
                onChange={(e) => setPromptText(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleInterpret(); }}
                style={{ flex: '1 1 320px', height: 42 }}
              />
              <button
                onClick={handleInterpret}
                disabled={isInterpreting || !promptText.trim()}
                className="btn btn-ink"
                style={{ height: 42, padding: '0 1.25rem', whiteSpace: 'nowrap' }}
              >
                <span>{isInterpreting ? 'Parsing...' : 'Interpret Query'}</span>
                <ArrowRight size={14} />
              </button>
            </div>

            {/* Quick Presets */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', fontSize: 12 }}>
              <span style={{ color: 'var(--text-faint)', fontSize: 11 }}>Presets:</span>
              {presetQueries.map((p, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSelectPreset(p.text)}
                  style={{
                    background: 'var(--ivory-bright)',
                    border: '1px solid var(--hairline)',
                    padding: '3px 8px',
                    borderRadius: 3,
                    fontSize: 11,
                    cursor: 'pointer',
                    color: 'var(--text-muted)'
                  }}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {interpretationFeedback && (
              <div style={{
                marginTop: '1.25rem',
                padding: '0.75rem 1rem',
                borderRadius: 4,
                fontSize: 12.5,
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: interpretationFeedback.type === 'success' ? 'var(--emerald-soft)' : 'var(--crimson-soft)',
                border: `1px solid ${interpretationFeedback.type === 'success' ? '#A7F3D0' : '#FECACA'}`,
                color: interpretationFeedback.type === 'success' ? 'var(--emerald)' : 'var(--crimson)'
              }}>
                {interpretationFeedback.type === 'success' ? <CheckCircle size={15} /> : <AlertCircle size={15} />}
                <span>{interpretationFeedback.message}</span>
              </div>
            )}
          </div>

          {/* Target Conditioning Sliders */}
          <div className="editorial-card" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '1.75rem' }}>
              <span className="label-tag">PARAMETRIC MARGINAL SLIDERS</span>
              <span className="mono" style={{ fontSize: 11, color: 'var(--text-faint)' }}>CONDITIONAL SPECIFICATION</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
              {/* Cohort Size */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.4rem' }}>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>Cohort Population Size (N)</span>
                  <span className="mono" style={{ fontSize: 16, fontWeight: 600, color: 'var(--iris)' }}>
                    {cohortParams.targetSize.toLocaleString()}
                  </span>
                </div>
                <input
                  type="range"
                  min="1000"
                  max="25000"
                  step="500"
                  value={cohortParams.targetSize}
                  onChange={(e) => updateParams({ targetSize: parseInt(e.target.value, 10) })}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10.5, color: 'var(--text-faint)', fontFamily: "'JetBrains Mono', monospace" }}>
                  <span>N = 1,000 (Fast)</span>
                  <span>N = 10,000 (Balanced)</span>
                  <span>N = 25,000 (High-Power)</span>
                </div>
              </div>

              {/* Age >= 60 */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.4rem' }}>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>Elderly Proportion (Age ≥ 60)</span>
                  <span className="mono" style={{ fontSize: 16, fontWeight: 600, color: 'var(--iris)' }}>
                    {cohortParams.ageOver60}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  value={cohortParams.ageOver60}
                  onChange={(e) => updateParams({ ageOver60: parseInt(e.target.value, 10) })}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10.5, color: 'var(--text-faint)', fontFamily: "'JetBrains Mono', monospace" }}>
                  <span>0% Young Cohort</span>
                  <span>40% Baseline</span>
                  <span>100% Geriatric Trial</span>
                </div>
              </div>

              {/* Diabetes % */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.4rem' }}>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>Diabetes Target Prevalence</span>
                  <span className="mono" style={{ fontSize: 16, fontWeight: 600, color: 'var(--iris)' }}>
                    {cohortParams.diabetes}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  value={cohortParams.diabetes}
                  onChange={(e) => updateParams({ diabetes: parseInt(e.target.value, 10) })}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10.5, color: 'var(--text-faint)', fontFamily: "'JetBrains Mono', monospace" }}>
                  <span>0% Non-Diabetic</span>
                  <span>9.95% Population Real</span>
                  <span>100% Diabetic Study</span>
                </div>
              </div>

              {/* Low Activity % */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.4rem' }}>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>Sedentary Proportion (Low Activity)</span>
                  <span className="mono" style={{ fontSize: 16, fontWeight: 600, color: 'var(--iris)' }}>
                    {cohortParams.lowActivity}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  value={cohortParams.lowActivity}
                  onChange={(e) => updateParams({ lowActivity: parseInt(e.target.value, 10) })}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10.5, color: 'var(--text-faint)', fontFamily: "'JetBrains Mono', monospace" }}>
                  <span>0% Active Cohort</span>
                  <span>35% NHANES Baseline</span>
                  <span>100% Inactive Cohort</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Calculated Live Demographic Preview & Engine Selection */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Calculated Cohort Blueprint Specimen */}
          <div className="editorial-card-bone" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '1.25rem' }}>
              <span className="label-tag">COHORT BLUEPRINT SPECIMEN</span>
              <span className="badge-telemetry badge-telemetry-iris">PRE-SAMPLING</span>
            </div>

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              borderBottom: '1px solid var(--hairline)',
              paddingBottom: '1.5rem',
              marginBottom: '1.5rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Estimated Elderly Records</span>
                <span className="mono" style={{ fontSize: 15, fontWeight: 600 }}>{countElderly.toLocaleString()} pts</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Estimated Diabetic Records</span>
                <span className="mono" style={{ fontSize: 15, fontWeight: 600 }}>{countDiabetic.toLocaleString()} pts</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Estimated Sedentary Records</span>
                <span className="mono" style={{ fontSize: 15, fontWeight: 600 }}>{countSedentary.toLocaleString()} pts</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Expected Zero-Pain Baseline</span>
                <span className="mono" style={{ fontSize: 15, fontWeight: 600, color: '#047857' }}>~72.2% Floor</span>
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label className="label-tag" style={{ display: 'block', marginBottom: '0.4rem' }}>
                SEED DATASET REFERENCE
              </label>
              <select
                className="select-input"
                value={selectedDataset}
                onChange={(e) => setSelectedDataset(e.target.value)}
                style={{ height: 40 }}
              >
                <option value="nhanes_generative_train.csv">NHANES Clinical Train (N = 4,826 seed rows)</option>
                <option value="nhanes_clinical_sample.csv">NHANES Holdout Diagnostic (N = 100 fast rows)</option>
              </select>
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <label className="label-tag" style={{ display: 'block', marginBottom: '0.4rem' }}>
                GENERATIVE ARCHITECTURE
              </label>
              <select
                className="select-input"
                value={cohortParams.model}
                onChange={(e) => updateParams({ model: e.target.value })}
                style={{ height: 40 }}
              >
                <option value="Gaussian Copula">Gaussian Copula (Review Package, Seed: 42)</option>
                <option value="Hurdle Copula">Hurdle Zero-Inflated Copula</option>
              </select>
            </div>

            <button
              onClick={handleProceed}
              className="btn btn-iris"
              style={{
                width: '100%',
                height: 44,
                fontSize: 14,
                borderRadius: 4
              }}
            >
              <span>Execute Copula Synthesis</span>
              <ArrowRight size={15} />
            </button>
          </div>

          {/* Clinical Bounds Note */}
          <div style={{
            padding: '1.25rem',
            border: '1px solid var(--hairline)',
            borderRadius: 4,
            backgroundColor: '#FFFFFF',
            fontSize: 12,
            lineHeight: 1.6,
            color: 'var(--text-muted)'
          }}>
            <strong style={{ color: 'var(--ink-black)' }}>Boundary Protection Protocol:</strong> All generated records are dynamically validated to ensure physiological coherence: Systolic BP &gt; Diastolic BP, adherence &isin; [0, 100%], pain score &isin; [0, 10], and age &isin; [18, 85].
          </div>

        </div>

      </div>

      <style>{`
        @media (max-width: 960px) {
          .create-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
