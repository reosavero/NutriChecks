import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Filler, Legend } from 'chart.js';
import { Line } from 'react-chartjs-2';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDrumstickBite, faBreadSlice, faCheese } from '@fortawesome/free-solid-svg-icons';
import Sidebar from '../components/Sidebar';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Filler, Legend);

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboard = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
      try {
        const res = await axios.get('http://localhost:5000/api/dashboard', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setData(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, [navigate]);



  if (loading || !data) {
    const storedUser = JSON.parse(localStorage.getItem('user') || 'null');
    return (
      <div className="flex h-screen overflow-hidden bg-slate-950 text-white font-sans">
        
        {/* Sidebar dipaksa tetap muncul (dengan data sekadarnya / guest state) */}
        <Sidebar activePage="dashboard" user={storedUser} />

        <main className="flex-1 overflow-y-auto bg-slate-950 flex h-full items-center justify-center relative">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/10 via-slate-950 to-emerald-900/10 pointer-events-none"></div>
          <p className="font-bold text-center flex flex-col items-center text-slate-300 relative z-10">
              <span className="w-8 h-8 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin mb-4"></span>
              Loading Data...
          </p>
        </main>
      </div>
    );
  }

  const { planning, calories, weightProgress, macros } = data;
  const chartData = {
    labels: weightProgress.labels,
    datasets: [
      {
        label: 'Weight',
        data: weightProgress.data,
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        borderWidth: 3,
        pointBackgroundColor: '#3b82f6',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4,
        fill: true,
      },
      {
        label: 'Target',
        data: weightProgress.labels.map(() => weightProgress.targetWeight),
        borderColor: '#10b981',
        borderDash: [5, 5],
        borderWidth: 2,
        pointRadius: 0,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        titleColor: '#fff',
        bodyColor: '#cbd5e1',
        borderColor: 'rgba(51, 65, 85, 0.5)',
        borderWidth: 1,
      }
    },
    scales: {
      x: {
        grid: { display: false, drawBorder: false },
        ticks: { color: '#94a3b8' }
      },
      y: {
        suggestedMin: Math.min(...weightProgress.data) - 2,
        suggestedMax: Math.max(...weightProgress.data, weightProgress.targetWeight) + 2,
        grid: { color: 'rgba(51, 65, 85, 0.3)', drawBorder: false },
        ticks: { color: '#94a3b8' }
      }
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-950 text-white font-sans">
      
      {/* Sidebar Komponen Reusable */}
      <Sidebar activePage="dashboard" user={data?.user || JSON.parse(localStorage.getItem('user') || 'null')} />

      {/* Box Konten Flex */}
      <main className="flex-1 overflow-y-auto bg-slate-950 p-6 md:p-10 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/10 via-slate-950 to-emerald-900/10 pointer-events-none"></div>
        
        <div className="max-w-6xl mx-auto relative z-10">
          {/* Dashboard Header Bar */}
          <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight mb-1">Hello, {data.user.nama.split(' ')[0]}! 👋</h1>
              <p className="text-sm text-slate-400">Ringkasan kemajuan rencana nutrisi dan berat badanmu hari ini.</p>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
              {/* Tombol Fungsionil Header */}
              <button onClick={() => navigate('/upload-food')} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-lg font-semibold text-sm transition-colors shadow-lg shadow-blue-500/20 whitespace-nowrap">
                Lacak Makanan Baru (AI/Manual)
              </button>
              <button className="px-5 py-2.5 border border-slate-600 bg-slate-800/50 hover:bg-slate-700/50 text-slate-200 rounded-lg font-semibold text-sm transition-colors backdrop-blur-sm whitespace-nowrap">
                Catat Berat Badan Terbaru
              </button>
            </div>
          </header>

          {/* Area Kartu Perencanaan Header (Grid) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            
            {/* Planning Card Design */}
            <div className="bg-slate-900/80 backdrop-blur-md border border-slate-700/50 p-6 rounded-2xl shadow-xl flex flex-col justify-center">
              <p className="text-slate-400 font-medium mb-1">{planning.goalWeeks} weeks goal</p>
              <div className="flex items-baseline justify-between mb-2">
                <span className="text-4xl font-extrabold text-emerald-400">{planning.totalWeightChange} kg</span>
                <span className="text-slate-500 text-sm font-semibold bg-slate-800/60 px-2 py-1 rounded">
                   {planning.weightPerWeekChange} kg / week
                </span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mt-3">
                <div className="bg-emerald-500 h-full w-1/3 rounded-full"></div>
              </div>
            </div>
            
            {/* Calorie Macro Dashboard Card */}
            <div className="bg-slate-900/80 backdrop-blur-md border border-slate-700/50 p-6 rounded-2xl shadow-xl flex flex-col justify-center">
              <p className="text-slate-400 font-medium mb-1">Target Kalori Harian</p>
              <div className="flex items-baseline justify-between mb-2">
                <div>
                  <span className="text-4xl font-extrabold text-blue-500">{calories.target}</span>
                  <span className="text-slate-400 ml-2 font-medium">Kcal</span>
                </div>
                <span 
                  className="text-emerald-400/90 bg-emerald-500/10 px-3 py-1.5 rounded-full text-xs font-bold border border-emerald-500/30 cursor-help"
                  title="BMR (Basal Metabolic Rate): Jumlah kalori minimal yang dibakar oleh tubuhmu untuk fungsi dasar (seperti bernapas dan detak jantung) saat kamu sedang rebahan atau istirahat total."
                >
                  BMR: {calories.bmr} Kcal
                </span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mt-3">
                 {/* Visualisasi ini disederhanakan sebagai placeholder proges bar hari ini kalau dibutuhkan nanti */}
                <div className="bg-blue-500 h-full w-[0%] rounded-full opacity-80"></div>
              </div>
            </div>
          </div>

          {/* Bagian Area Weight Progress Chart (ChartJS Render Container) */}
          <div className="bg-slate-900/80 backdrop-blur-md border border-slate-700/50 p-6 md:p-8 rounded-2xl shadow-xl mb-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
              <h3 className="text-xl font-bold text-white tracking-tight">Weight Progress</h3>
              <span className="px-3 py-1.5 bg-slate-800/80 text-slate-300 rounded-md text-xs font-medium border border-slate-700/80 shadow-[inset_0_1px_4px_rgba(0,0,0,0.5)]">Last 30 Days</span>
            </div>
            
            {/* Render Grafik (Hanya ada Tinggi yang dibutuhkan oleh ChartJS) */}
            <div className="h-64 w-full">
              <Line data={chartData} options={chartOptions} />
            </div>
            
            <div className="flex justify-between items-center mt-6 pt-5 border-t border-slate-800/60">
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-slate-500 mb-1 uppercase tracking-widest text-left">Today</span>
                <span className="text-2xl font-black text-white">{weightProgress.todayWeight} <span className="text-lg text-slate-400 font-normal">kg</span></span>
              </div>
              <div className="h-10 w-px bg-slate-700/50"></div>
              <div className="flex flex-col text-right">
                <span className="text-sm font-semibold text-slate-500 mb-1 uppercase tracking-widest">{weightProgress.startWeightDate}</span>
                <span className="text-2xl font-black text-white">{weightProgress.startWeight} <span className="text-lg text-slate-400 font-normal">kg</span></span>
              </div>
            </div>
          </div>

          {/* Kotak 3 Kartu Progress Kebutuhan Makro (Bawah) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-slate-900/80 backdrop-blur-md border border-slate-700/50 p-6 rounded-2xl shadow-[0_4px_15px_rgba(20,184,166,0.05)] flex items-center space-x-5 transition-transform hover:-translate-y-1 hover:border-teal-500/30">
              <div className="w-14 h-14 rounded-full bg-teal-500/10 flex items-center justify-center border border-teal-500/30 flex-shrink-0 shadow-[inset_0_0_10px_rgba(20,184,166,0.2)]">
                <FontAwesomeIcon icon={faDrumstickBite} className="text-2xl text-teal-400" />
              </div>
              <div>
                <p className="text-3xl font-extrabold text-teal-400 tracking-tight">{macros.protein}g</p>
                <p className="text-slate-400 text-sm font-semibold mt-0.5 uppercase tracking-widest">Protein</p>
              </div>
            </div>

            <div className="bg-slate-900/80 backdrop-blur-md border border-slate-700/50 p-6 rounded-2xl shadow-[0_4px_15px_rgba(245,158,11,0.05)] flex items-center space-x-5 transition-transform hover:-translate-y-1 hover:border-amber-500/30">
              <div className="w-14 h-14 rounded-full bg-amber-500/10 flex items-center justify-center border border-amber-500/30 flex-shrink-0 shadow-[inset_0_0_10px_rgba(245,158,11,0.2)]">
                <FontAwesomeIcon icon={faBreadSlice} className="text-2xl text-amber-400" />
              </div>
              <div>
                <p className="text-3xl font-extrabold text-amber-400 tracking-tight">{macros.carbs}g</p>
                <p className="text-slate-400 text-sm font-semibold mt-0.5 uppercase tracking-widest">Karbo</p>
              </div>
            </div>

            <div className="bg-slate-900/80 backdrop-blur-md border border-slate-700/50 p-6 rounded-2xl shadow-[0_4px_15px_rgba(239,68,68,0.05)] flex items-center space-x-5 transition-transform hover:-translate-y-1 hover:border-red-500/30">
              <div className="w-14 h-14 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/30 flex-shrink-0 shadow-[inset_0_0_10px_rgba(239,68,68,0.2)]">
                <FontAwesomeIcon icon={faCheese} className="text-2xl text-red-500" />
              </div>
              <div>
                <p className="text-3xl font-extrabold text-red-500 tracking-tight">{macros.fat}g</p>
                <p className="text-slate-400 text-sm font-semibold mt-0.5 uppercase tracking-widest">Lemak</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
