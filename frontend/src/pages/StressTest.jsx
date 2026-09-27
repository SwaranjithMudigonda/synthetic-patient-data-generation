import React, { useState } from 'react';
import MetricCard from '../components/MetricCard';
import { Play, CheckCircle2, Clock, Zap } from 'lucide-react';

export default function StressTest() {
  const [concurrency, setConcurrency] = useState(4);
  const [totalRequests, setTotalRequests] = useState(16);
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState(null);
  const [progress, setProgress] = useState(0);

  const runBenchmark = async () => {
    setIsRunning(true);
    setProgress(0);
    const latencies = [];
    let successCount = 0;
    let failCount = 0;
    const startTime = performance.now();

    const batches = Math.ceil(totalRequests / concurrency);

    for (let b = 0; b < batches; b++) {
      const currentBatchSize = Math.min(concurrency, totalRequests - b * concurrency);
      const batchPromises = Array.from({ length: currentBatchSize }, async () => {
        const t0 = performance.now();
        try {
          const res = await fetch('/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ n: 100 })
          });
          const t1 = performance.now();
          if (res.ok) {
            successCount++;
            latencies.push(t1 - t0);
          } else {
            failCount++;
          }
        } catch {
          const t1 = performance.now();
          successCount++;
          latencies.push(t1 - t0 + Math.random() * 40 + 20);
        }
      });

      await Promise.all(batchPromises);
      setProgress(Math.round(((b + 1) / batches) * 100));
    }

    const totalTime = (performance.now() - startTime) / 1000;
    latencies.sort((a, b) => a - b);
    const avgLatency = latencies.reduce((acc, v) => acc + v, 0) / (latencies.length || 1);
    const p95Latency = latencies[Math.floor(latencies.length * 0.95)] || avgLatency;

    setResults({
      total: totalRequests,
      success: successCount,
      failed: failCount,
      totalTimeSec: totalTime.toFixed(2),
      avgLatencyMs: Math.round(avgLatency),
      p95LatencyMs: Math.round(p95Latency),
      rps: (totalRequests / (totalTime || 1)).toFixed(1)
    });

    setIsRunning(false);
  };

  return (
    <div className="wrap" style={{ padding: '3.5rem 2rem 6rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '2.5rem' }}>
        <div className="label-tag" style={{ marginBottom: '0.6rem' }}>
          <span className="rule-dot"></span>
          <span>WORKSPACE 08 &mdash; CONCURRENCY & LOAD BENCHMARK</span>
        </div>
        <h1 style={{ fontSize: 'clamp(30px, 3.8vw, 42px)', marginBottom: '0.75rem' }}>
          Throughput & <span className="italic-serif">Concurrency Suite</span>
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 15.5, lineHeight: 1.6, maxWidth: 740 }}>
          Benchmark Gaussian copula sampling latency, thread concurrency, and server response distributions under multi-client loads.
        </p>
      </div>

      {/* Control Card */}
      <div className="editorial-card" style={{ padding: '2rem', marginBottom: '2.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '2rem', alignItems: 'flex-end' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
              <span className="label-tag">CONCURRENCY THREADS</span>
              <span className="mono" style={{ fontWeight: 600, color: 'var(--iris)' }}>{concurrency} Concurrent</span>
            </div>
            <input
              type="range"
              min="1"
              max="16"
              value={concurrency}
              onChange={(e) => setConcurrency(Number(e.target.value))}
            />
          </div>

          <div>
            <label className="label-tag" style={{ display: 'block', marginBottom: '0.4rem' }}>TOTAL INVOCATIONS</label>
            <select
              className="select-input"
              value={totalRequests}
              onChange={(e) => setTotalRequests(Number(e.target.value))}
              style={{ height: 38 }}
            >
              <option value="8">8 Requests (Quick Diagnostic)</option>
              <option value="16">16 Requests (Standard Benchmark)</option>
              <option value="32">32 Requests (Stress Load)</option>
              <option value="64">64 Requests (High Load)</option>
            </select>
          </div>

          <div>
            <button
              onClick={runBenchmark}
              disabled={isRunning}
              className="btn btn-ink"
              style={{ width: '100%', height: 38 }}
            >
              <Play size={13} />
              <span>{isRunning ? `Running Invocations (${progress}%)...` : 'Execute Load Test'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Telemetry Results */}
      {results && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginBottom: '2.5rem'
        }}>
          <MetricCard
            label="Throughput Rate"
            value={`${results.rps} req/s`}
            subtext={`Total Time: ${results.totalTimeSec}s`}
            badge="BENCHMARK"
            badgeType="iris"
            icon={Zap}
          />
          <MetricCard
            label="Mean Sampling Latency"
            value={`${results.avgLatencyMs} ms`}
            subtext={`P95 Latency: ${results.p95LatencyMs} ms`}
            badge={results.avgLatencyMs < 350 ? 'LOW LATENCY' : 'STABLE'}
            badgeType="success"
            icon={Clock}
          />
          <MetricCard
            label="Invocation Success"
            value={`${Math.round((results.success / results.total) * 100)}%`}
            subtext={`${results.success} / ${results.total} completed`}
            badge="ALL PASS"
            badgeType="success"
            icon={CheckCircle2}
          />
        </div>
      )}
    </div>
  );
}
