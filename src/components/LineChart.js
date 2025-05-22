import { Line } from 'react-chartjs-2';
import 'chartjs-adapter-date-fns';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export default function LineChart({ stats = [], range = 'month' }) {
  const labels = stats.map(s => s.date);
  const totalData = stats.map(s => s.total);
  const correctData = stats.map(s => s.correct);

  const data = {
    labels,
    datasets: [
      {
        label: '总做题数',
        data: totalData,
        borderColor: 'rgba(59,130,246,1)',
        backgroundColor: 'rgba(59,130,246,0.1)',
        tension: 0.3,
        fill: true,
      },
      {
        label: '正确数',
        data: correctData,
        borderColor: 'rgba(16,185,129,1)',
        backgroundColor: 'rgba(16,185,129,0.1)',
        tension: 0.3,
        fill: true,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: false },
    },
    scales: {
      x: {
        title: { display: true, text: '日期' },
        ticks: { maxRotation: 45, minRotation: 0, autoSkip: true, autoSkipPadding: 10 },
      },
      y: {
        title: { display: true, text: '数量' },
        beginAtZero: true,
        stepSize: 1,
        ticks: {
          precision: 0
        }
      },
    },
  };

  return <Line data={data} options={options} />;
} 