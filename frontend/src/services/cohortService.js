import { request } from './api';

/**
 * Interpret a natural language cohort prompt via the backend endpoint
 */
export async function interpretCohort(text, currentCohort = {}) {
  try {
    const data = await request('/cohort/parse-nl', {
      method: 'POST',
      body: JSON.stringify({
        text: text.trim(),
        currentCohort: {
          size: currentCohort.size || currentCohort.targetSize || 10000,
          ageOver60: currentCohort.ageOver60 ?? 40,
          diabetes: currentCohort.diabetes ?? 30,
          lowActivity: currentCohort.lowActivity ?? 35
        }
      })
    });
    return data;
  } catch (err) {
    console.warn('[cohortService] Backend NL interpret failed, using heuristic fallback:', err);
    return fallbackLocalInterpretation(text, currentCohort);
  }
}

/**
 * Local heuristic parser fallback
 */
function fallbackLocalInterpretation(text, currentCohort = {}) {
  const lower = text.toLowerCase();
  let size = currentCohort.size || currentCohort.targetSize || 10000;
  let age = currentCohort.ageOver60 ?? 40;
  let diabetes = currentCohort.diabetes ?? 30;
  let activity = currentCohort.lowActivity ?? 35;

  const sizeMatchK = lower.match(/(\d+)\s*k/);
  const sizeMatchNum = lower.match(/(\d[\d,]*)\s*(patients|cohort|records)?/);
  if (sizeMatchK) {
    size = Math.min(25000, Math.max(1000, parseInt(sizeMatchK[1], 10) * 1000));
  } else if (sizeMatchNum) {
    const raw = parseInt(sizeMatchNum[1].replace(/,/g, ''), 10);
    if (raw >= 1000 && raw <= 25000) size = raw;
  }

  const ageMatch = lower.match(/(\d+)\s*%\s*(over|elderly|age|\b60)/i) || lower.match(/(over\s*60|elderly)[^\d]*(\d+)\s*%/i);
  if (ageMatch) {
    const v = parseInt(ageMatch[1] || ageMatch[2], 10);
    if (v >= 0 && v <= 100) age = v;
  } else if (lower.includes('elderly') || lower.includes('older') || lower.includes('senior')) {
    age = 65;
  } else if (lower.includes('young') || lower.includes('pediatric')) {
    age = 10;
  }

  const diabMatch = lower.match(/(\d+)\s*%\s*(diabetic|diabetes)/i) || lower.match(/(diabetic|diabetes)[^\d]*(\d+)\s*%/i);
  if (diabMatch) {
    const v = parseInt(diabMatch[1] || diabMatch[2], 10);
    if (v >= 0 && v <= 100) diabetes = v;
  } else if (lower.includes('diabetic') || lower.includes('diabetes')) {
    diabetes = 60;
  }

  const actMatch = lower.match(/(\d+)\s*%\s*(low activity|sedentary|inactive)/i) || lower.match(/(low activity|sedentary|inactive)[^\d]*(\d+)\s*%/i);
  if (actMatch) {
    const v = parseInt(actMatch[1] || actMatch[2], 10);
    if (v >= 0 && v <= 100) activity = v;
  } else if (lower.includes('sedentary') || lower.includes('low activity') || lower.includes('inactive')) {
    activity = 55;
  }

  return {
    success: true,
    requirements: {
      targetSize: size,
      ageOver60: age,
      diabetes: diabetes,
      lowActivity: activity
    },
    summary: `Cohort interpreted via local heuristic: N=${size.toLocaleString()}, Age>60=${age}%, Diabetes=${diabetes}%, LowActivity=${activity}%`,
    source: 'heuristic_fallback'
  };
}

/**
 * Generate synthetic cohort via FastAPI Gaussian Copula generator
 */
export async function generateCohort(params = {}) {
  const targetSize = params.targetSize || params.size || 1000;
  const conditions = params.conditions || {
    ageOver60: params.ageOver60 ?? 40,
    diabetes: params.diabetes ?? 30,
    lowActivity: params.lowActivity ?? 35
  };

  const payload = {
    n: targetSize,
    targetSize,
    targets: {
      diabetes: (conditions.diabetes ?? 30) > 40 ? 1 : 0,
      age_gt: (conditions.ageOver60 ?? 40) > 50 ? 60 : 18
    },
    conditions,
    model: params.model || 'Gaussian Copula'
  };

  return await request('/generate', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

/**
 * Fetch longitudinal trajectory for a given synthetic patient
 */
export async function getPatientTrajectory(patientId = 'SYN-000001', cadence = 'monthly', numMonths = 12, cohortId = null) {
  const query = new URLSearchParams({ cadence, num_months: numMonths });
  if (cohortId) query.append('cohort_id', cohortId);
  return await request(`/patient/${patientId}/longitudinal?${query.toString()}`);
}

/**
 * Run counterfactual "what-if" intervention
 */
export async function computeCounterfactual(patientId = 'SYN-000001', variable = 'activity_mims', newValue = 10000, cohortId = 'latest') {
  return await request(`/cohort/${cohortId}/counterfactual`, {
    method: 'POST',
    body: JSON.stringify({
      patient_ids: [patientId],
      variable,
      new_value: Number(newValue)
    })
  });
}

/**
 * Get edge case scenarios
 */
export async function getEdgeCaseScenarios() {
  return await request('/edge-cases/scenarios');
}

/**
 * Generate edge case records
 */
export async function generateEdgeCases(scenarioId = 'elderly_diabetic', n = 50) {
  return await request('/generate/edge-cases', {
    method: 'POST',
    body: JSON.stringify({ scenario_id: scenarioId, n })
  });
}

/**
 * Trigger export download (csv, json, parquet)
 */
export async function exportCohort(format = 'csv', cohortId = 'latest') {
  const res = await fetch(`/export`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ format, cohort_id: cohortId })
  });
  
  if (!res.ok) throw new Error(`Export failed: ${res.statusText}`);
  
  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `synthetic_patient_data_${cohortId}.${format}`;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}

/**
 * API Key management
 */
export async function getApiKeys() {
  return await request('/api-keys');
}

export async function createApiKey(label = 'Developer Client') {
  return await request('/api-keys', {
    method: 'POST',
    body: JSON.stringify({ label })
  });
}
