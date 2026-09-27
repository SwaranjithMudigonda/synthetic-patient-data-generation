import { request } from './api';

/**
 * Fetch validation metrics for a specific cohort or the default baseline
 */
export async function getValidationReport(cohortId = null) {
  if (cohortId) {
    return await request(`/api/validate/${cohortId}`);
  }
  return await request('/metrics/baseline');
}

/**
 * Fetch detailed baseline summary metrics
 */
export async function getBaselineMetrics() {
  return await request('/metrics/baseline');
}

/**
 * Run Membership Inference Attack (MIA)
 */
export async function runMiaAttack(cohortId = 'default_cohort', attacker = 'logistic_regression') {
  return await request('/privacy/membership-inference', {
    method: 'POST',
    body: JSON.stringify({
      cohort_id: cohortId,
      attacker
    })
  });
}

/**
 * Find Nearest Real Neighbor for explainability
 */
export async function getNearestRealNeighbor(patientId = 'SYN-000001', cohortId = null) {
  const query = cohortId ? `?cohort_id=${cohortId}` : '';
  return await request(`/privacy/nearest-neighbor/${patientId}${query}`);
}

/**
 * Run Bias & Representativeness Audit
 */
export async function runBiasAudit(cohortId = 'default_synthetic_cohort', tolerancePct = 2.5) {
  return await request('/validate/representativeness', {
    method: 'POST',
    body: JSON.stringify({
      cohort_id: cohortId,
      tolerance_pct: tolerancePct
    })
  });
}
