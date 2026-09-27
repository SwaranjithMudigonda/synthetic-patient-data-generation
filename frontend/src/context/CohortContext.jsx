import React, { createContext, useContext, useState, useEffect } from 'react';
import { generateCohort as apiGenerateCohort } from '../services/cohortService';

const CohortContext = createContext(null);

const STORAGE_KEY = 'synthia_cohort_state';

const defaultParams = {
  targetSize: 2500,
  ageOver60: 40,
  diabetes: 30,
  lowActivity: 35,
  model: 'Gaussian Copula'
};

export function CohortProvider({ children }) {
  const [cohortParams, setCohortParams] = useState(defaultParams);
  const [activeCohortId, setActiveCohortId] = useState(null);
  const [cohortData, setCohortData] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [selectedPatientId, setSelectedPatientId] = useState('SYN-000001');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState(null);

  // Restore from sessionStorage on mount
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.cohortParams) setCohortParams(parsed.cohortParams);
        if (parsed.activeCohortId) setActiveCohortId(parsed.activeCohortId);
        if (parsed.cohortData) setCohortData(parsed.cohortData);
        if (parsed.metrics) setMetrics(parsed.metrics);
        if (parsed.selectedPatientId) setSelectedPatientId(parsed.selectedPatientId);
      }
    } catch (e) {
      console.warn('[CohortContext] Failed to restore cached state:', e);
    }
  }, []);

  // Save to sessionStorage on updates
  useEffect(() => {
    try {
      const stateToSave = {
        cohortParams,
        activeCohortId,
        cohortData,
        metrics,
        selectedPatientId
      };
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
    } catch (e) {
      console.warn('[CohortContext] Failed to save state:', e);
    }
  }, [cohortParams, activeCohortId, cohortData, metrics, selectedPatientId]);

  const updateParams = (newParams) => {
    setCohortParams((prev) => ({ ...prev, ...newParams }));
  };

  const runGeneration = async (overrideParams = null) => {
    setIsGenerating(true);
    setGenerationError(null);
    const paramsToUse = overrideParams || cohortParams;

    try {
      const res = await apiGenerateCohort({
        targetSize: paramsToUse.targetSize,
        conditions: {
          ageOver60: paramsToUse.ageOver60,
          diabetes: paramsToUse.diabetes,
          lowActivity: paramsToUse.lowActivity
        },
        model: paramsToUse.model
      });

      if (res.status === 'success' || res.success) {
        setActiveCohortId(res.cohort_id);
        setCohortData(res.patients || []);
        setMetrics(res.metrics || res.summary_metrics || null);
        if (res.patients && res.patients.length > 0) {
          setSelectedPatientId(res.patients[0].patient_id || 'SYN-000001');
        }
        return { success: true, cohortId: res.cohort_id, data: res };
      } else {
        const msg = res.error || 'Generation failed.';
        setGenerationError(msg);
        return { success: false, error: msg };
      }
    } catch (err) {
      const msg = err.message || 'Error occurred during generation.';
      setGenerationError(msg);
      return { success: false, error: msg };
    } finally {
      setIsGenerating(false);
    }
  };

  const value = {
    cohortParams,
    setCohortParams,
    updateParams,
    activeCohortId,
    setActiveCohortId,
    cohortData,
    setCohortData,
    metrics,
    setMetrics,
    selectedPatientId,
    setSelectedPatientId,
    isGenerating,
    generationError,
    runGeneration
  };

  return <CohortContext.Provider value={value}>{children}</CohortContext.Provider>;
}

export function useCohort() {
  const context = useContext(CohortContext);
  if (!context) {
    throw new Error('useCohort must be used within a CohortProvider');
  }
  return context;
}
