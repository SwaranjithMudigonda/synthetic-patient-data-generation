import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCohort } from '../context/CohortContext';
import { Search, ChevronLeft, ChevronRight, ArrowUpRight } from 'lucide-react';

export default function PatientTable({ patients = [] }) {
  const navigate = useNavigate();
  const { setSelectedPatientId } = useCohort();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSex, setFilterSex] = useState('all');
  const [filterDiabetes, setFilterDiabetes] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  const filtered = useMemo(() => {
    return patients.filter((pat) => {
      const idMatches = pat.patient_id?.toLowerCase().includes(searchTerm.toLowerCase());
      const sexMatches = filterSex === 'all' || String(pat.sex).toLowerCase() === filterSex.toLowerCase();
      const diabMatches = filterDiabetes === 'all' || String(pat.diabetes) === filterDiabetes;
      return idMatches && sexMatches && diabMatches;
    });
  }, [patients, searchTerm, filterSex, filterDiabetes]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const displayedPatients = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage]);

  const handleInspect = (patientId) => {
    setSelectedPatientId(patientId);
    navigate(`/patient?id=${patientId}`);
  };

  return (
    <div className="editorial-card" style={{ padding: '1.5rem', borderRadius: 4 }}>
      {/* Table Toolbar */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
        marginBottom: '1.25rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: '1 1 260px' }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: 320 }}>
            <Search size={14} style={{ position: 'absolute', left: 10, top: 12, color: 'var(--text-faint)' }} />
            <input
              type="text"
              className="input-text"
              placeholder="Search ID (e.g. SYN-000042)..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              style={{ paddingLeft: '2.1rem', height: 36, fontSize: 13 }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <select
            className="select-input"
            value={filterSex}
            onChange={(e) => { setFilterSex(e.target.value); setCurrentPage(1); }}
            style={{ width: 110, height: 36, fontSize: 12.5 }}
          >
            <option value="all">All Sexes</option>
            <option value="1">Male (1)</option>
            <option value="2">Female (2)</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>

          <select
            className="select-input"
            value={filterDiabetes}
            onChange={(e) => { setFilterDiabetes(e.target.value); setCurrentPage(1); }}
            style={{ width: 130, height: 36, fontSize: 12.5 }}
          >
            <option value="all">All Conditions</option>
            <option value="1">Diabetic (1)</option>
            <option value="0">Non-Diabetic (0)</option>
          </select>
        </div>
      </div>

      {/* Table Specimen */}
      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Patient ID</th>
              <th>Age</th>
              <th>Sex</th>
              <th>Systolic BP</th>
              <th>Diastolic BP</th>
              <th>Diabetes</th>
              <th>Activity (MIMS)</th>
              <th>Pain Score</th>
              <th>Adherence</th>
              <th style={{ textAlign: 'right' }}>Trajectory</th>
            </tr>
          </thead>
          <tbody>
            {displayedPatients.length > 0 ? (
              displayedPatients.map((p, idx) => (
                <tr key={p.patient_id || idx} style={{ cursor: 'pointer' }} onClick={() => handleInspect(p.patient_id)}>
                  <td className="mono" style={{ fontWeight: 600, color: 'var(--ink-black)' }}>
                    {p.patient_id}
                  </td>
                  <td className="mono">{p.age ? Math.round(p.age) : '—'}</td>
                  <td>
                    {p.sex === 1 || p.sex === '1' || p.sex === 'male' ? (
                      <span className="badge-telemetry badge-telemetry-neutral">Male</span>
                    ) : (
                      <span className="badge-telemetry badge-telemetry-neutral">Female</span>
                    )}
                  </td>
                  <td className="mono">{p.systolic_bp ? Math.round(p.systolic_bp) : '—'} <span style={{ fontSize: 10, color: 'var(--text-faint)' }}>mmHg</span></td>
                  <td className="mono">{p.diastolic_bp ? Math.round(p.diastolic_bp) : '—'} <span style={{ fontSize: 10, color: 'var(--text-faint)' }}>mmHg</span></td>
                  <td>
                    {p.diabetes === 1 || p.diabetes === '1' ? (
                      <span className="badge-telemetry badge-telemetry-fail">Diabetic</span>
                    ) : (
                      <span className="badge-telemetry badge-telemetry-pass">Normal</span>
                    )}
                  </td>
                  <td className="mono">{p.activity_mims ? Math.round(p.activity_mims).toLocaleString() : '—'}</td>
                  <td className="mono">
                    {p.pain_score === 0 ? (
                      <span style={{ color: 'var(--emerald)', fontWeight: 600 }}>0.0 (Floor)</span>
                    ) : (
                      <span>{Number(p.pain_score || 0).toFixed(1)} / 10</span>
                    )}
                  </td>
                  <td className="mono">
                    <span style={{
                      color: Number(p.adherence_pct || 0) >= 80 ? 'var(--emerald)' : 'var(--amber)',
                      fontWeight: 600
                    }}>
                      {Math.round(p.adherence_pct || 0)}%
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleInspect(p.patient_id); }}
                      className="btn btn-outline"
                      style={{ padding: '0.25rem 0.55rem', fontSize: 11, borderRadius: 2 }}
                    >
                      <span>Chart</span>
                      <ArrowUpRight size={11} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={10} style={{ textAlign: 'center', padding: '3.5rem 1rem', color: 'var(--text-faint)' }}>
                  No matching clinical records found. Generate a cohort or adjust filter parameters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: '1.25rem',
        fontSize: 12,
        color: 'var(--text-muted)'
      }}>
        <div className="mono">
          DISPLAYING {filtered.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}&ndash;
          {Math.min(currentPage * pageSize, filtered.length)} OF {filtered.length.toLocaleString()} RECORDS
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="btn btn-outline"
            style={{ padding: '0.3rem 0.55rem', opacity: currentPage === 1 ? 0.4 : 1 }}
          >
            <ChevronLeft size={14} />
          </button>
          <span className="mono" style={{ padding: '0 0.5rem', fontWeight: 600 }}>
            {currentPage} / {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="btn btn-outline"
            style={{ padding: '0.3rem 0.55rem', opacity: currentPage === totalPages ? 0.4 : 1 }}
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
