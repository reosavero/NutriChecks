import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Filler, Legend } from 'chart.js';
import { Line } from 'react-chartjs-2';
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
        setData({ error: err.response?.data?.message || 'Gagal terhubung ke backend server.' });
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background text-on-surface">
        <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin mb-4"></div>
            <p className="font-bold text-lg tracking-tight">Synchronizing Biometrics...</p>
        </div>
      </div>
    );
  }

  if (data?.error || !data) {
    return (
      <div className="flex h-screen items-center justify-center bg-background text-on-surface font-body">
        <div className="bg-error/10 p-8 rounded-3xl border border-error/20 flex flex-col items-center max-w-md text-center">
            <span className="material-symbols-outlined text-error text-5xl mb-4">cloud_off</span>
            <h2 className="text-xl font-black text-error mb-2">Sinkronisasi Gagal</h2>
            <p className="text-sm font-medium text-secondary mb-6">{data?.error || 'Koneksi ke sistem backend utama terputus.'}</p>
            <button onClick={() => window.location.reload()} className="px-6 py-3 bg-surface-container hover:bg-surface-container-high rounded-full font-bold text-xs transition-colors">
              Coba Lagi
            </button>
        </div>
      </div>
    );
  }

  const { planning, calories, weightProgress, macros } = data;
  const localUser = JSON.parse(localStorage.getItem('user') || '{}');
  const user = { ...data.user, role: localUser.role || data.user.role, avatar: localUser.avatar || null };

  // Setup Visualisasi Grafik (Chart.js) matching the High-Tech style
  const chartData = {
    labels: weightProgress.labels,
    datasets: [
      {
        label: 'Weight',
        data: weightProgress.data,
        borderColor: '#006c51', // primary
        backgroundColor: 'rgba(0, 108, 81, 0.05)',
        tension: 0.4,
        borderWidth: 3,
        pointBackgroundColor: '#006c51',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 4,
        fill: true,
      },
      {
        label: 'Target',
        data: weightProgress.labels.map(() => weightProgress.targetWeight),
        borderColor: '#a43c12', // tertiary
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
        backgroundColor: 'rgba(28, 27, 27, 0.9)',
        titleColor: '#ffffff',
        bodyColor: '#e5e2e1',
        borderColor: 'rgba(0, 108, 81, 0.1)',
        borderWidth: 1,
      }
    },
    scales: {
      x: {
        grid: { display: false, drawBorder: false },
        ticks: { color: '#5f5e5e', font: { family: 'Inter', size: 10 } }
      },
      y: {
        suggestedMin: Math.min(...weightProgress.data) - 1,
        suggestedMax: Math.max(...weightProgress.data, weightProgress.targetWeight) + 1,
        grid: { color: 'rgba(0, 108, 81, 0.05)', drawBorder: false },
        ticks: { color: '#5f5e5e', font: { family: 'Inter', size: 10 } }
      }
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background text-on-background font-body antialiased">
      
      {/* Sidebar Component */}
      <Sidebar user={user} />

      {/* Main Content Area */}
      <main className="flex-1 lg:ml-72 flex flex-col min-h-screen overflow-y-auto pb-24 lg:pb-0">


        {/* Dashboard Canvas (Bento Grid Layout) */}
        <div className="flex-1 p-6 md:p-8 max-w-screen-2xl mx-auto w-full space-y-8">
          
          {/* Page Header */}
          <div className="flex justify-between items-end">
            <div>
              <h2 className="text-display-md text-on-surface font-headline mb-1">Today's Vitality</h2>
              <p className="text-on-surface-variant text-base">Welcome back, {user.nama.split(' ')[0]}. Your biometrics are trending towards optimal.</p>
            </div>
          </div>

          {/* Main Bento Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
            
            {/* Hero / Quick Scan CTA (Span 12) */}
            <div className="col-span-1 lg:col-span-12 rounded-[2rem] overflow-hidden relative min-h-[260px] flex items-center bg-surface-container-high shadow-sm border border-outline-variant/10 group cursor-pointer" onClick={() => navigate('/upload-food')}>
              {/* Background Image */}
              <img 
                alt="Healthy fresh food" 
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 bg-surface-container-high" 
                src="https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=1200" 
              />
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-on-surface/60 via-on-surface/20 to-transparent"></div>
              
              {/* Content */}
              <div className="relative z-10 p-10 max-w-xl text-surface-container-lowest">
                <h3 className="text-display-sm font-headline mb-3 text-white">Discover Nutritional Truth</h3>
                <p className="text-surface-variant text-base mb-6 leading-relaxed opacity-90">Instantly analyze your meal's macro and micro-nutrient profile with our advanced visual recognition engine.</p>
                <div className="bg-primary hover:bg-primary-fixed-dim text-on-primary px-6 py-3 rounded-full font-semibold inline-flex items-center space-x-3 transition-all shadow-lg active:scale-95">
                  <span className="material-symbols-outlined">center_focus_strong</span>
                  <span>Quick Scan</span>
                </div>
              </div>
            </div>

            {/* Macro Summary Ring (Span 4) */}
            <div className="col-span-1 lg:col-span-4 bg-surface-container-lowest rounded-[2rem] p-8 relative overflow-hidden flex flex-col items-center justify-center border border-outline-variant/15 shadow-sm">
              <h3 className="text-lg font-bold text-on-surface mb-8 w-full text-left">Macro Integrity</h3>
              <div className="relative w-48 h-48 flex items-center justify-center mb-6 shadow-sm rounded-full">
                {/* SVG Ring and Text */}
                <div className="absolute inset-0 rounded-full border-[14px] border-surface-container"></div>
                {/* Simplified Conic Gradient for the Ring Look */}
                <div 
                  className="absolute inset-0 rounded-full border-[14px] border-transparent"
                  style={{
                    background: `conic-gradient(#006c51 0% ${macros.protein}%, #2ee0ad ${macros.protein}% ${macros.protein + macros.fat}%, #a43c12 ${macros.protein + macros.fat}% 100%)`,
                    WebkitMask: 'radial-gradient(farthest-side, transparent calc(100% - 14px), white calc(100% - 13px))'
                  }}
                ></div>
                
                <div className="flex flex-col items-center justify-center text-center">
                  <span className="text-3xl font-black text-on-surface tracking-tighter">{calories.target}</span>
                  <span className="text-xs text-on-surface-variant font-medium uppercase tracking-widest">Target kcal</span>
                </div>
              </div>

              <div className="grid grid-cols-3 w-full gap-2 mt-2">
                <div className="flex flex-col items-center">
                  <div className="flex items-center space-x-1.5 mb-1">
                    <div className="w-2 h-2 rounded-full bg-primary"></div>
                    <span className="text-xs font-semibold text-secondary">Protein</span>
                  </div>
                  <span className="text-sm font-bold">{macros.protein}g</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="flex items-center space-x-1.5 mb-1">
                    <div className="w-2 h-2 rounded-full bg-primary-fixed-dim"></div>
                    <span className="text-xs font-semibold text-secondary">Fats</span>
                  </div>
                  <span className="text-sm font-bold">{macros.fat}g</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="flex items-center space-x-1.5 mb-1">
                    <div className="w-2 h-2 rounded-full bg-tertiary"></div>
                    <span className="text-xs font-semibold text-secondary">Carbs</span>
                  </div>
                  <span className="text-sm font-bold">{macros.carbs}g</span>
                </div>
              </div>
            </div>

            {/* Metabolic Trend Chart (Span 8) */}
            <div className="col-span-1 lg:col-span-8 bg-surface-container-lowest rounded-[2rem] p-8 flex flex-col border border-outline-variant/15 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-xl font-bold text-on-surface tracking-tight">Metabolic Trend</h3>
                  <p className="text-xs text-secondary">Weight progress vs target trajectory</p>
                </div>
                <div className="bg-surface-container-low px-4 py-2 rounded-full text-xs font-bold text-on-surface-variant flex items-center space-x-2 border border-outline-variant/10">
                  <span className="material-symbols-outlined text-[16px]">calendar_today</span>
                  <span>Last 30 Days</span>
                </div>
              </div>
              
              <div className="flex-1 w-full min-h-[220px]">
                <Line data={chartData} options={chartOptions} />
              </div>

              <div className="mt-6 flex justify-between items-center px-2">
                 <div className="flex flex-col text-left">
                    <span className="text-[10px] font-bold text-secondary uppercase tracking-[0.2em] mb-1">Current</span>
                    <span className="text-2xl font-black text-on-surface">{weightProgress.todayWeight}<span className="text-sm text-secondary font-medium ml-1">kg</span></span>
                 </div>
                 <div className="h-10 w-px bg-surface-container"></div>
                 <div className="flex flex-col text-right">
                    <span className="text-[10px] font-bold text-secondary uppercase tracking-[0.2em] mb-1">Start Weight</span>
                    <span className="text-2xl font-black text-on-surface">{weightProgress.startWeight}<span className="text-sm text-secondary font-medium ml-1">kg</span></span>
                 </div>
              </div>
            </div>

            {/* Quick Metrics (Span 12) */}
            <div className="col-span-1 lg:col-span-12 grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Planning Metric */}
              <div className="bg-surface-container-low rounded-[2rem] p-6 border border-outline-variant/10 flex items-center gap-5">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                  <span className="material-symbols-outlined text-2xl">event_upcoming</span>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-1">{planning.goalWeeks} Week Goal</p>
                  <p className="text-2xl font-black text-on-surface">{planning.totalWeightChange} <span className="text-sm font-medium">kg total</span></p>
                </div>
              </div>

              {/* Weekly Velocity */}
              <div className="bg-surface-container-low rounded-[2rem] p-6 border border-outline-variant/10 flex items-center gap-5">
                <div className="w-14 h-14 rounded-2xl bg-tertiary/10 flex items-center justify-center text-tertiary border border-tertiary/20">
                  <span className="material-symbols-outlined text-2xl">trending_down</span>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-1">Weekly Velocity</p>
                  <p className="text-2xl font-black text-on-surface">{planning.weightPerWeekChange} <span className="text-sm font-medium">kg/week</span></p>
                </div>
              </div>

              {/* BMR Stat */}
              <div className="bg-primary-container/10 border border-primary/20 rounded-[2rem] p-6 flex items-center gap-5">
                <div className="w-14 h-14 rounded-2xl bg-primary text-on-primary flex items-center justify-center shadow-md">
                  <span className="material-symbols-outlined text-2xl">bolt</span>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1">Basal Metabolic Rate</p>
                  <p className="text-2xl font-black text-on-surface">{calories.bmr} <span className="text-sm font-medium">kcal</span></p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
