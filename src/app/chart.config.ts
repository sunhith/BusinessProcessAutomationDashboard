// src/app/chart.config.ts
import { Chart } from 'chart.js';

export function initializeChartJS() {
  Chart.defaults.font.family = 'Roboto, sans-serif';
  Chart.defaults.color = '#666';
  Chart.defaults.borderColor = '#eee';
}
