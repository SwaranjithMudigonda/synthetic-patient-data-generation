import React from 'react';
import {
  Chart as ChartJS,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Scatter } from 'react-chartjs-2';

ChartJS.register(LinearScale, PointElement, LineElement, Tooltip, Legend, Filler);

export default function RocCurveChart({ rocPoints = [], auc = 0.4895 }) {
  const points = (rocPoints && rocPoints.length > 0)
    ? rocPoints.map(p => ({ x: p.fpr, y: p.tpr }))
    : [
        { x: 0.0, y: 0.0 },
        { x: 0.1, y: 0.11 },
        { x: 0.25, y: 0.24 },
        { x: 0.5, y: 0.49 },
        { x: 0.75, y: 0.74 },
        { x: 1.0, y: 1.0 }
      ];

  const randomLine = [
    { x: 0.0, y: 0.0 },
    { x: 0.5, y: 0.5 },
    { x: 1.0, y: 1.0 }
  ];

  const data = {
    datasets: [
      {
        label: `MIA Attacker (AUC = ${Number(auc).toFixed(4)})`,
        data: points,
        showLine: true,
        borderColor: '#583BD6',
        backgroundColor: 'rgba(88, 59, 214, 0.08)',
        fill: true,
        tension: 0.15,
        pointRadius: 2.5,
        borderWidth: 2
      },
      {
        label: 'Random Discrimination Line (AUC = 0.5000)',
        data: randomLine,
        showLine: true,
        borderColor: '#6D697C',
        borderDash: [5, 4],
        pointRadius: 0,
        borderWidth: 1.5,
        fill: false
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
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
        callbacks: {
          label: (ctx) => `FPR: ${ctx.parsed.x.toFixed(3)}, TPR: ${ctx.parsed.y.toFixed(3)}`
        }
      }
    },
    scales: {
      x: {
        type: 'linear',
        min: 0,
        max: 1.0,
        title: {
          display: true,
          text: 'False Positive Rate (1 - Specificity)',
          font: { family: "'IBM Plex Sans', sans-serif", size: 10.5 }
        },
        grid: { color: 'rgba(0,0,0,0.05)' },
        ticks: { font: { family: "'JetBrains Mono', monospace", size: 10 } }
      },
      y: {
        type: 'linear',
        min: 0,
        max: 1.0,
        title: {
          display: true,
          text: 'True Positive Rate (Sensitivity)',
          font: { family: "'IBM Plex Sans', sans-serif", size: 10.5 }
        },
        grid: { color: 'rgba(0,0,0,0.05)' },
        ticks: { font: { family: "'JetBrains Mono', monospace", size: 10 } }
      }
    }
  };

  return (
    <div style={{ height: 300, width: '100%', position: 'relative' }}>
      <Scatter data={data} options={options} />
    </div>
  );
}
