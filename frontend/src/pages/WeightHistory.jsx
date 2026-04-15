import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Filler, Legend } from 'chart.js';
import { Line } from 'react-chartjs-2';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashAlt, faPlus, faWeightScale, faCalendarAlt } from '@fortawesome/free-solid-svg-icons';
import Sidebar from '../components/Sidebar';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Filler, Legend);

export default function WeightHistory() {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);

  // Form State
  const [showModal, setShowModal] = useState(false);
  const [newWeight, setNewWeight] = useState('');
  const todayStr = new Date().toISOString().split('T')[0];
  const [newDate, setNewDate] = useState(todayStr);



  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
      try {
        // Fetch ke backend: await axios.get('/api/weight-history')
        // Karena endpoint belum dibuat jadi saya supply dari dummy data
        const resUser = await axios.get('http://localhost:5000/api/dashboard', { headers: { Authorization: `Bearer ${token}` } });
        setUserProfile(resUser.data.user);
        setDashboardData(resUser.data);
        // For now, no history endpoint exists, keep history empty
        setHistory([]);
        setLoading(false);

      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };
    fetchData();
  }, [navigate]);

  if (loading) {
    const storedUser = JSON.parse(localStorage.getItem('user') || 'null');
    return (
      <div className="flex h-screen overflow-hidden bg-slate-950 text-white font-sans">
        <Sidebar activePage="weight-history" user={storedUser} />
        <main className="flex-1 overflow-y-auto bg-slate-950 flex h-full items-center justify-center relative">
          <p className="font-bold flex flex-col items-center text-slate-300 relative z-10">
              <span className="w-8 h-8 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin mb-4"></span>
              Loading Analisis...
          </p>
        </main>
      </div>
    );
  }

  // Calculate Metrics Dynamic
  const sortedHistory = [...history].sort((a, b) => new Date(a.date) - new Date(b.date));
  
  // Ambil angka dari setting User / DB Auth Register
  const targetBerat = dashboardData?.weightProgress?.targetWeight || 0;
  const regWeight = dashboardData?.weightProgress?.startWeight || 0;

  const beratAwal = sortedHistory.length > 0 ? sortedHistory[0].weight : regWeight;
  const beratSekarang = sortedHistory.length > 0 ? sortedHistory[sortedHistory.length - 1].weight : regWeight;
  const totalPerubahan = (beratSekarang - beratAwal).toFixed(1);
  const sisaTarget = Math.abs(beratSekarang - targetBerat).toFixed(1);
  // Chart Data Preparation
  const chartData = {
    labels: sortedHistory.map(h => h.date),
    datasets: [
      {
        label: 'Berat Badan (kg)',
        data: sortedHistory.map(h => h.weight),
        borderColor: '#10b981', // Emerald
        backgroundColor: 'rgba(16, 185, 129, 0.1)', 
        tension: 0.4,
        fill: true,
        pointBackgroundColor: '#0f172a',
        pointBorderColor: '#10b981',
        pointBorderWidth: 2,
        pointRadius: 4,
      },
      {
        label: 'Target',
        data: sortedHistory.map(() => targetBerat),
        borderColor: '#3b82f6', // Blue horizontal line
        borderDash: [5, 5],
        borderWidth: 2,
        pointRadius: 0,
        fill: false,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top', labels: { color: '#cbd5e1', usePointStyle: true, boxWidth: 8 } },
      tooltip: { backgroundColor: 'rgba(15, 23, 42, 0.9)', titleColor: '#fff', bodyColor: '#cbd5e1', borderColor: 'rgba(51, 65, 85, 0.5)', borderWidth: 1 }
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: '#94a3b8' } },
      y: { 
        suggestedMax: Math.max(...sortedHistory.map(h => h.weight)) + 5,
        suggestedMin: Math.min(...sortedHistory.map(h => h.weight), targetBerat) - 5,
        grid: { color: 'rgba(51, 65, 85, 0.3)' }, 
        ticks: { color: '#94a3b8' } 
      }
    }
  };

  // Processing Table Diff Logic
  const getTableData = () => {
    let result = [];
    const descHistory = [...sortedHistory].reverse();
    for (let i = 0; i < descHistory.length; i++) {
        const current = descHistory[i];
        const previous = descHistory[i + 1];
        let diff = '-';
        let diffColor = 'text-slate-400';
        if (previous) {
            const chg = (current.weight - previous.weight).toFixed(1);
            if (chg > 0) { diff = `+${chg} kg`; diffColor = 'text-red-400'; }
            else if (chg < 0) { diff = `${chg} kg`; diffColor = 'text-emerald-400'; }
            else { diff = `0 kg`; }
        }
        result.push({ ...current, diff, diffColor });
    }
    return result;
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-950 text-white font-sans">
      <Sidebar activePage="weight-history" user={userProfile || JSON.parse(localStorage.getItem('user') || 'null')} />

      <main className="flex-1 overflow-y-auto p-6 md:p-10 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/10 via-slate-950 to-blue-900/10 pointer-events-none"></div>

        <div className="max-w-6xl mx-auto relative z-10">
          
          {/* Top Section: Header & Action */}
          <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight mb-1">Analisis Progres Berat Badan</h1>
              <p className="text-sm text-slate-400">Pantau dan catat perkembangan berat badanmu secara terperinci.</p>
            </div>
            <button 
              onClick={() => setShowModal(true)}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white rounded-lg font-semibold text-sm transition-colors shadow-lg shadow-emerald-500/20 whitespace-nowrap flex items-center gap-2"
            >
              <FontAwesomeIcon icon={faPlus} />
              Tambah Data Baru
            </button>
          </header>

          {/* Metrics Row Section */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-slate-900/80 backdrop-blur-md border border-slate-700/50 p-5 rounded-2xl shadow-lg">
              <p className="text-slate-400 text-sm font-medium mb-1">Berat Awal</p>
              <p className="text-2xl font-bold text-slate-200">{beratAwal} kg</p>
            </div>
            <div className="bg-slate-900/80 backdrop-blur-md border border-slate-700/50 p-5 rounded-2xl shadow-lg border-b-4 border-b-emerald-500 relative overflow-hidden">
              <div className="absolute -right-4 -top-4 w-16 h-16 bg-emerald-500/20 blur-xl rounded-full"></div>
              <p className="text-emerald-400/80 text-sm font-medium mb-1 relative z-10">Berat Sekarang</p>
              <p className="text-3xl font-bold text-emerald-400 relative z-10">{beratSekarang} kg</p>
            </div>
            <div className="bg-slate-900/80 backdrop-blur-md border border-slate-700/50 p-5 rounded-2xl shadow-lg">
              <p className="text-slate-400 text-sm font-medium mb-1">Total Perubahan</p>
              <p className={`text-2xl font-bold ${totalPerubahan <= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {totalPerubahan > 0 ? '+' : ''}{totalPerubahan} kg
              </p>
            </div>
            <div className="bg-slate-900/80 backdrop-blur-md border border-slate-700/50 p-5 rounded-2xl shadow-lg">
              <p className="text-slate-400 text-sm font-medium mb-1">Sisa Target ({targetBerat} kg)</p>
              <p className="text-2xl font-bold text-blue-400">{sisaTarget} kg</p>
            </div>
          </div>

          {/* Middle Section: Area Grafik Detail Component */}
          <div className="bg-slate-900/80 backdrop-blur-md border border-slate-700/50 p-6 rounded-2xl shadow-xl flex flex-col mb-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold tracking-tight">Tren Perjalanan Tubuh Ideal</h3>
              <span className="px-3 py-1 bg-slate-800 text-slate-300 rounded text-xs font-semibold">Line Chart</span>
            </div>
            <div className="w-full min-h-[350px]">
              <Line data={chartData} options={chartOptions} />
            </div>
          </div>

        {/* Bottom Section: Tabel Data Lengkap */}
          <div className="bg-slate-900/80 backdrop-blur-md border border-slate-700/50 rounded-2xl shadow-xl overflow-hidden mb-12">
            <div className="p-6 border-b border-slate-700/50 flex justify-between items-center">
              <h3 className="text-xl font-bold tracking-tight">Data Riwayat Lengkap</h3>
              <span className="text-sm font-semibold text-slate-400 bg-slate-800 px-3 py-1 rounded-md">{history.length} Entri Ditemukan</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-800/30 text-slate-400 uppercase tracking-wider text-xs font-bold">
                  <tr>
                    <th className="px-6 py-4">Tanggal Pengukuran</th>
                    <th className="px-6 py-4">Berat (kg)</th>
                    <th className="px-6 py-4">Perubahan vs Data Sebelumnya</th>
                    <th className="px-6 py-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {getTableData().map((row) => (
                    <tr key={row.id} className="hover:bg-slate-800/40 transition-colors group">
                      <td className="px-6 py-4 text-slate-300 font-medium">{row.date}</td>
                      <td className="px-6 py-4 font-bold text-white text-base">{row.weight}</td>
                      <td className="px-6 py-4">
                        <span className={`font-semibold bg-slate-900/50 px-2.5 py-1 rounded border border-slate-800 ${row.diffColor}`}>
                          {row.diff}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-slate-600 hover:text-red-400 transition-colors p-2 rounded-md hover:bg-red-400/10 opacity-0 group-hover:opacity-100 focus:opacity-100">
                          <FontAwesomeIcon icon={faTrashAlt} /> Hapus
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </main>

      {/* Modal / Panel Tambah Data Baru Layer */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-7 w-full max-w-sm shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-emerald-500 to-blue-500"></div>
            <h3 className="text-2xl font-bold mb-1">Catat Progres Baru</h3>
            <p className="text-sm text-slate-400 mb-6">Jangan lupa timbang di waktu yang konsisten setiap harinya.</p>
            
            <div className="space-y-4 mb-8">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1.5 uppercase tracking-wider">Berat (kg)</label>
                <div className="relative">
                  <FontAwesomeIcon icon={faWeightScale} className="absolute left-3.5 top-3.5 text-slate-500" />
                  <input type="number" step="0.1" value={newWeight} onChange={(e)=>setNewWeight(e.target.value)} className="w-full bg-slate-950/50 focus:bg-slate-950 border border-slate-700 rounded-xl py-3 px-4 pl-10 text-white outline-none focus:border-emerald-500 transition-colors" placeholder="0.0" />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1.5 uppercase tracking-wider">Tanggal</label>
                <div className="relative">
                  <FontAwesomeIcon icon={faCalendarAlt} className="absolute left-3.5 top-3.5 text-slate-500" />
                  <input type="date" value={newDate} onChange={(e)=>setNewDate(e.target.value)} className="w-full bg-slate-950/50 focus:bg-slate-950 border border-slate-700 rounded-xl py-3 px-4 pl-10 text-white outline-none focus:border-emerald-500 transition-colors [&::-webkit-calendar-picker-indicator]:hidden" />
                </div>
              </div>
            </div>
            <div className="flex gap-3 justify-end mt-2">
              <button onClick={() => setShowModal(false)} className="px-5 py-2.5 rounded-xl text-slate-300 bg-slate-800 hover:bg-slate-700 font-bold text-sm transition-colors border border-transparent hover:border-slate-600">
                Batal
              </button>
              <button onClick={() => setShowModal(false)} className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-sm shadow-xl shadow-emerald-500/20 transition-all active:scale-95">
                Simpan Entri
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
