import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function TrajectoryChart({ trajectoryData = [], activeMetrics = ['systolic_bp', 'diastolic_bp', 'pain_score'] }) {
  if (!trajectoryData || trajectoryData.length === 0) {
    return (
      <div style={{
        height: 320,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--text-faint)',
        fontSize: 12.5,
        fontFamily: "'JetBrains Mono', monospace"
      }}>
        No trajectory timeline points available. Select a synthetic patient record.
      </div>
    );
  }

  const labels = trajectoryData.map((pt, i) => {
    if (pt.month !== undefined) return `M${pt.month}`;
    if (pt.day !== undefined) return `Day ${pt.day}`;
    if (pt.timestep !== undefined) return `T${pt.timestep}`;
    return `P${i + 1}`;
  });

  const datasets = [];

  if (activeMetrics.includes('systolic_bp')) {
    datasets.push({
      label: 'Systolic BP (mmHg)',
      data: trajectoryData.map((pt) => pt.systolic_bp),
      borderColor: '#111111',
      backgroundColor: 'rgba(17, 17, 17, 0.04)',
      tension: 0.25,
      pointRadius: 3,
      pointHoverRadius: 5,
      borderWidth: 2,
      fill: true,
      yAxisID: 'y'
    });
  }

  if (activeMetrics.includes('diastolic_bp')) {
    datasets.push({
      label: 'Diastolic BP (mmHg)',
      data: trajectoryData.map((pt) => pt.diastolic_bp),
      borderColor: '#6D697C',
      backgroundColor: 'transparent',
      borderDash: [4, 4],
      tension: 0.25,
      pointRadius: 2.5,
      borderWidth: 1.5,
      yAxisID: 'y'
    });
  }

  if (activeMetrics.includes('pain_score')) {
    datasets.push({
      label: 'Pain Rating (0–10)',
      data: trajectoryData.map((pt) => pt.pain_score),
      borderColor: '#B91C1C',
      backgroundColor: 'rgba(185, 28, 28, 0.05)',
      tension: 0.2,
      pointRadius: 3,
      borderWidth: 1.8,
      yAxisID: 'y1'
    });
  }

  if (activeMetrics.includes('adherence_pct')) {
    datasets.push({
      label: 'Adherence %',
      data: trajectoryData.map((pt) => pt.adherence_pct),
      borderColor: '#047857',
      backgroundColor: 'transparent',
      tension: 0.2,
      pointRadius: 2.5,
      borderWidth: 1.5,
      yAxisID: 'y2'
    });
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false
    },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          boxWidth: 7,
          font: { family: "'IBM Plex Sans', sans-serif", size: 11 }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(11, 11, 13, 0.95)',
        titleFont: { family: "'JetBrains Mono', monospace", size: 11 },
        bodyFont: { family: "'IBM Plex Sans', sans-serif", size: 11 },
        padding: 8,
        cornerRadius: 3
      }
    },
    scales: {
      x: {
        grid: { color: 'rgba(0,0,0,0.04)' },
        ticks: { font: { family: "'JetBrains Mono', monospace", size: 10 } }
      },
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        title: {
          display: true,
          text: 'Blood Pressure (mmHg)',
          font: { family: "'IBM Plex Sans', sans-serif", size: 10.5 }
        },
        grid: { color: 'rgba(0,0,0,0.05)' },
        ticks: { font: { family: "'JetBrains Mono', monospace", size: 10 } }
      },
      y1: {
        type: 'linear',
        display: activeMetrics.includes('pain_score'),
        position: 'right',
        min: 0,
        max: 10,
        title: {
          display: true,
          text: 'Pain Index (0–10)',
          font: { family: "'IBM Plex Sans', sans-serif", size: 10.5 }
        },
        grid: { drawOnChartArea: false },
        ticks: { font: { family: "'JetBrains Mono', monospace", size: 10 } }
      },
      y2: {
        type: 'linear',
        display: false,
        min: 0,
        max: 100
      }
    }
  };

  return (
    <div style={{ height: 320, width: '100%', position: 'relative' }}>
      <Line data={{ labels, datasets }} options={options} />
    </div>
  );
}
