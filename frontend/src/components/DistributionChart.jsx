import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function DistributionChart({
  title = 'Marginal Distribution Matching: Real Holdout vs Copula',
  labels = ['Mean Age', 'Mean SBP (mmHg)', 'Mean DBP (mmHg)', 'Diabetes %', 'Zero Pain %', 'Adherence %'],
  realData = [48.5, 122.4, 71.8, 9.8, 72.1, 84.5],
  syntheticData = [48.2, 122.1, 71.5, 9.95, 72.25, 84.8]
}) {
  const data = {
    labels,
    datasets: [
      {
        label: 'Real NHANES Benchmark',
        data: realData,
        backgroundColor: '#111111',
        borderColor: '#111111',
        borderWidth: 1,
        borderRadius: 2
      },
      {
        label: 'Synthetic Gaussian Copula',
        data: syntheticData,
        backgroundColor: '#583BD6',
        borderColor: '#583BD6',
        borderWidth: 1,
        borderRadius: 2
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
          boxWidth: 8,
          font: { family: "'IBM Plex Sans', sans-serif", size: 11.5 }
        }
      },
      title: {
        display: !!title,
        text: title,
        font: { family: "'Newsreader', serif", size: 14, weight: 'normal' },
        color: '#111111',
        align: 'start'
      },
      tooltip: {
        backgroundColor: 'rgba(11, 11, 13, 0.95)',
        titleFont: { family: "'JetBrains Mono', monospace", size: 11 },
        bodyFont: { family: "'IBM Plex Sans', sans-serif", size: 11 },
        cornerRadius: 3
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { family: "'IBM Plex Sans', sans-serif", size: 10.5 } }
      },
      y: {
        grid: { color: 'rgba(0,0,0,0.06)' },
        ticks: { font: { family: "'JetBrains Mono', monospace", size: 10.5 } }
      }
    }
  };

  return (
    <div style={{ height: 280, width: '100%', position: 'relative' }}>
      <Bar data={data} options={options} />
    </div>
  );
}
