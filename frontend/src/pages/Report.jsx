import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Sidebar from '../components/Sidebar';

const API = 'http://localhost:5000/api';

export default function Report() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [foodLogs, setFoodLogs] = useState([]);
  const [catalogFoods, setCatalogFoods] = useState([]);
  const [toast, setToast] = useState(null);

  // Upload states
  const [uploadMode, setUploadMode] = useState(null); // 'gallery', 'camera', 'catalog'
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [scanProgress, setScanProgress] = useState(0);

  // History navigation
  const [expandedWeek, setExpandedWeek] = useState(null);
  const [expandedDay, setExpandedDay] = useState(null);

  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const navigate = useNavigate();

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!token || !storedUser) { navigate('/login'); return; }
    setUser(JSON.parse(storedUser));
    fetchLogs();
  }, [navigate]);

  // Scan progress animation
  useEffect(() => {
    let interval;
    if (isScanning) {
      setScanProgress(0);
      interval = setInterval(() => setScanProgress(p => p < 95 ? p + Math.random() * 8 : p), 120);
    } else { setScanProgress(0); }
    return () => clearInterval(interval);
  }, [isScanning]);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/food-logs`, { headers });
      setFoodLogs(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally { setLoading(false); }
  };

  const fetchCatalog = async () => {
    try {
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      const tujuan = storedUser.tujuan || 'semua';
      const res = await axios.get(`${API}/food-catalog/public?tujuan=${encodeURIComponent(tujuan)}`, { headers });
      setCatalogFoods(res.data.data || []);
    } catch (err) { console.error(err); }
  };

  // Handle file pick (gallery)
  const handleGalleryPick = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setScanResult(null);
      setUploadMode('gallery');
    }
  };

  // Handle camera capture
  const handleCameraPick = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setScanResult(null);
      setUploadMode('camera');
    }
  };

  // AI Scan
  const handleScan = async () => {
    if (!imageFile) return;
    setIsScanning(true);
    try {
      const fd = new FormData();
      fd.append('image', imageFile);
      const res = await axios.post(`${API}/analyze-food`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setScanResult(res.data.data);
    } catch (err) {
      showToast(err.response?.data?.message || 'Gagal scan gambar.', 'error');
    } finally { setIsScanning(false); }
  };

  // Save food log (from scan or catalog)
  const saveFoodLog = async (food) => {
    try {
      await axios.post(`${API}/food-logs`, {
        nama_makanan: food.nama_makanan || food.name,
        porsi: food.porsi || '1 porsi',
        kalori: food.kalori,
        protein: food.protein,
        karbohidrat: food.karbohidrat,
        lemak: food.lemak,
        image_url: food.image_url || null
      }, { headers });
      showToast(`"${food.nama_makanan || food.name}" berhasil dicatat!`);
      resetUpload();
      fetchLogs();
    } catch (err) {
      showToast(err.response?.data?.message || 'Gagal menyimpan.', 'error');
    }
  };

  const deleteFoodLog = async (id) => {
    if (!confirm('Hapus catatan makanan ini?')) return;
    try {
      await axios.delete(`${API}/food-logs/${id}`, { headers });
      showToast('Berhasil dihapus.');
      fetchLogs();
    } catch (err) {
      showToast('Gagal menghapus.', 'error');
    }
  };

  const resetUpload = () => {
    setUploadMode(null);
    setImageFile(null);
    setPreviewUrl(null);
    setScanResult(null);
  };

  // === Group logs by week and day ===
  const groupLogsByWeek = () => {
    if (foodLogs.length === 0) return [];

    const sorted = [...foodLogs].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    const firstDate = new Date(sorted[0].created_at);
    // Normalize to Monday of the first week
    const firstMonday = new Date(firstDate);
    firstMonday.setDate(firstDate.getDate() - ((firstDate.getDay() + 6) % 7));
    firstMonday.setHours(0, 0, 0, 0);

    const weeks = {};
    sorted.forEach(log => {
      const logDate = new Date(log.created_at);
      const diffDays = Math.floor((logDate - firstMonday) / (1000 * 60 * 60 * 24));
      const weekNum = Math.floor(diffDays / 7) + 1;
      const dayNum = (diffDays % 7) + 1;

      if (!weeks[weekNum]) weeks[weekNum] = { days: {} };
      if (!weeks[weekNum].days[dayNum]) {
        weeks[weekNum].days[dayNum] = {
          date: new Date(logDate).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
          logs: []
        };
      }
      weeks[weekNum].days[dayNum].logs.push(log);
    });

    return Object.entries(weeks)
      .sort(([a], [b]) => Number(b) - Number(a))
      .map(([num, data]) => ({
        weekNum: Number(num),
        totalKalori: Object.values(data.days).flatMap(d => d.logs).reduce((s, l) => s + l.kalori, 0),
        totalItems: Object.values(data.days).flatMap(d => d.logs).length,
        days: Object.entries(data.days)
          .sort(([a], [b]) => Number(b) - Number(a))
          .map(([dayNum, dayData]) => ({
            dayNum: Number(dayNum),
            date: dayData.date,
            totalKalori: dayData.logs.reduce((s, l) => s + l.kalori, 0),
            logs: dayData.logs
          }))
      }));
  };

  const weeklyData = groupLogsByWeek();

  if (!user) return null;

  return (
    <div className="flex h-screen overflow-hidden bg-background text-on-background font-body antialiased">
      <Sidebar activePage="report" user={user} />

      <main className="flex-1 lg:ml-72 flex flex-col min-h-screen overflow-y-auto pb-24 lg:pb-0">
        <div className="flex-1 p-6 md:p-8 lg:p-12 max-w-screen-2xl mx-auto w-full space-y-10">

          {/* === HEADER === */}
          <header className="animate-in fade-in slide-in-from-left-4 duration-500">
            <h2 className="text-sm font-bold text-primary tracking-widest uppercase mb-2">Nutrisi Harian</h2>
            <h1 className="text-display-md font-headline font-bold text-on-surface leading-tight">
              Catat <br /><span className="text-secondary font-medium">Makanan Anda</span>
            </h1>
          </header>

          {/* === UPLOAD SECTION === */}
          <div className="space-y-6">
            {/* Upload Method Picker */}
            {!uploadMode && !previewUrl && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Gallery Upload */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-surface-container-lowest rounded-2xl p-8 border border-outline-variant/10 hover:border-primary/30 hover:shadow-xl transition-all group flex flex-col items-center gap-4 text-center"
                >
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-primary text-3xl">photo_library</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-on-surface mb-1">Unggah Foto</h3>
                    <p className="text-xs text-secondary">Pilih dari galeri perangkat</p>
                  </div>
                </button>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleGalleryPick} />

                {/* Camera Capture */}
                <button
                  onClick={() => cameraInputRef.current?.click()}
                  className="bg-surface-container-lowest rounded-2xl p-8 border border-outline-variant/10 hover:border-tertiary/30 hover:shadow-xl transition-all group flex flex-col items-center gap-4 text-center"
                >
                  <div className="w-16 h-16 rounded-2xl bg-tertiary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-tertiary text-3xl">photo_camera</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-on-surface mb-1">Ambil Foto</h3>
                    <p className="text-xs text-secondary">Langsung buka kamera</p>
                  </div>
                </button>
                <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleCameraPick} />

                {/* Pick from Catalog */}
                <button
                  onClick={() => { setUploadMode('catalog'); fetchCatalog(); }}
                  className="bg-surface-container-lowest rounded-2xl p-8 border border-outline-variant/10 hover:border-primary/30 hover:shadow-xl transition-all group flex flex-col items-center gap-4 text-center"
                >
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-primary text-3xl">menu_book</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-on-surface mb-1">Pilih Rekomendasi</h3>
                    <p className="text-xs text-secondary">Ambil dari katalog makanan</p>
                  </div>
                </button>
              </div>
            )}

            {/* Image Preview & Scan */}
            {previewUrl && (
              <div className="bg-surface-container-lowest rounded-3xl overflow-hidden border border-outline-variant/10 shadow-lg animate-in fade-in zoom-in-95 duration-300">
                <div className="relative">
                  <img src={previewUrl} alt="Preview" className="w-full h-64 sm:h-80 object-cover" />
                  {isScanning && (
                    <>
                      <div className="absolute inset-0 bg-primary/10 backdrop-blur-[2px]"></div>
                      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent shadow-[0_0_15px_#006c51]" style={{ top: `${scanProgress}%`, transition: 'top 0.12s linear' }}></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="bg-surface/90 backdrop-blur-md px-6 py-3 rounded-full border border-primary/20 shadow-xl flex items-center gap-3">
                          <div className="w-4 h-4 border-2 border-primary border-t-transparent animate-spin rounded-full"></div>
                          <span className="text-sm font-bold text-primary">Menganalisis... {Math.round(scanProgress)}%</span>
                        </div>
                      </div>
                    </>
                  )}
                  <button onClick={resetUpload} className="absolute top-4 right-4 bg-surface/80 backdrop-blur-md p-2 rounded-full hover:bg-surface transition-colors shadow-md">
                    <span className="material-symbols-outlined text-[20px]">close</span>
                  </button>
                </div>

                <div className="p-6 space-y-4">
                  {!scanResult ? (
                    <button
                      onClick={handleScan}
                      disabled={isScanning}
                      className="w-full py-4 bg-primary text-on-primary rounded-2xl font-bold text-sm flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-primary/20 transition-all disabled:opacity-60"
                    >
                      <span className="material-symbols-outlined text-[18px]">center_focus_strong</span>
                      {isScanning ? 'Sedang Menganalisis...' : 'Scan dengan AI'}
                    </button>
                  ) : (
                    <div className="space-y-4 animate-in fade-in duration-500">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-secondary">Terdeteksi</p>
                          <h3 className="text-2xl font-black text-on-surface capitalize">{scanResult.nama_makanan}</h3>
                          <p className="text-xs text-secondary font-medium mt-1">{scanResult.porsi}</p>
                        </div>
                        <div className="bg-primary/10 px-3 py-1.5 rounded-xl border border-primary/20">
                          <span className="text-[10px] font-black text-primary">{Math.round(scanResult.confidence_score * 100)}% Akurat</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-4 gap-3">
                        {[
                          { label: 'Kalori', val: scanResult.kalori, unit: 'kcal', color: 'text-on-surface' },
                          { label: 'Protein', val: scanResult.protein, unit: 'g', color: 'text-primary' },
                          { label: 'Karbo', val: scanResult.karbohidrat, unit: 'g', color: 'text-secondary' },
                          { label: 'Lemak', val: scanResult.lemak, unit: 'g', color: 'text-tertiary' },
                        ].map(m => (
                          <div key={m.label} className="bg-surface-container rounded-xl p-3 text-center">
                            <p className="text-[9px] font-black uppercase tracking-widest text-secondary">{m.label}</p>
                            <p className={`text-lg font-black ${m.color}`}>{m.val}<span className="text-[10px] font-bold text-secondary">{m.unit}</span></p>
                          </div>
                        ))}
                      </div>
                      <button
                        onClick={() => saveFoodLog(scanResult)}
                        className="w-full py-4 bg-on-background text-surface rounded-2xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-primary transition-all shadow-xl active:scale-[0.98]"
                      >
                        <span className="material-symbols-outlined text-[18px]">add_circle</span>
                        Catat ke Riwayat
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Catalog Picker Mode */}
            {uploadMode === 'catalog' && (
              <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/10 shadow-lg overflow-hidden animate-in fade-in zoom-in-95 duration-300">
                <div className="flex items-center justify-between p-6 border-b border-outline-variant/10">
                  <div>
                    <h3 className="text-lg font-black text-on-surface">Pilih dari Katalog Makanan</h3>
                    <p className="text-xs text-secondary">Makanan yang direkomendasikan sesuai tujuan Anda</p>
                  </div>
                  <button onClick={resetUpload} className="p-2 rounded-xl hover:bg-surface-container transition-colors">
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>
                <div className="p-6 max-h-[400px] overflow-y-auto modal-scrollbar space-y-3">
                  {catalogFoods.length === 0 ? (
                    <div className="text-center py-12">
                      <span className="material-symbols-outlined text-4xl text-outline-variant mb-3">inventory_2</span>
                      <p className="text-secondary font-medium">Belum ada makanan di katalog.</p>
                    </div>
                  ) : (
                    catalogFoods.map(food => (
                      <div key={food.id} className="flex items-center justify-between p-4 rounded-2xl bg-surface-container/50 hover:bg-surface-container transition-colors group">
                        <div className="flex items-center gap-4 min-w-0">
                          {food.image_url ? (
                            <img src={food.image_url} alt={food.name} className="w-12 h-12 rounded-xl object-cover flex-shrink-0" />
                          ) : (
                            <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center flex-shrink-0">
                              <span className="material-symbols-outlined text-secondary">restaurant</span>
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="font-bold text-on-surface truncate">{food.name}</p>
                            <p className="text-[10px] text-secondary font-medium">{food.kalori} kcal • P:{food.protein}g • K:{food.karbohidrat}g • L:{food.lemak}g</p>
                          </div>
                        </div>
                        <button
                          onClick={() => saveFoodLog({ nama_makanan: food.name, kalori: food.kalori, protein: food.protein, karbohidrat: food.karbohidrat, lemak: food.lemak, image_url: food.image_url })}
                          className="px-4 py-2 bg-primary text-on-primary rounded-xl text-xs font-bold flex-shrink-0 opacity-0 group-hover:opacity-100 hover:shadow-lg transition-all"
                        >
                          <span className="material-symbols-outlined text-[14px] mr-1 align-middle">add</span>Catat
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* === DIVIDER === */}
          <div className="flex items-center gap-4">
            <div className="h-px bg-outline-variant/20 flex-1"></div>
            <span className="text-[10px] font-black tracking-[0.2em] text-secondary uppercase">Riwayat Makanan</span>
            <div className="h-px bg-outline-variant/20 flex-1"></div>
          </div>

          {/* === FOOD HISTORY (Week > Day > Items) === */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 animate-pulse">
              <div className="w-14 h-14 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4"></div>
              <p className="text-secondary font-bold tracking-widest text-xs uppercase">Memuat riwayat...</p>
            </div>
          ) : weeklyData.length === 0 ? (
            <div className="text-center py-20 animate-in fade-in duration-500">
              <span className="material-symbols-outlined text-6xl text-outline-variant mb-4">receipt_long</span>
              <h3 className="text-xl font-bold text-on-surface mb-2">Belum Ada Riwayat</h3>
              <p className="text-secondary text-sm">Mulai catat makanan Anda menggunakan fitur di atas.</p>
            </div>
          ) : (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {weeklyData.map(week => (
                <div key={week.weekNum} className="bg-surface-container-lowest rounded-2xl border border-outline-variant/10 overflow-hidden shadow-sm hover:shadow-md transition-all">
                  {/* Week Header */}
                  <button
                    onClick={() => setExpandedWeek(expandedWeek === week.weekNum ? null : week.weekNum)}
                    className="w-full flex items-center justify-between p-6 hover:bg-surface-container/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                        <span className="material-symbols-outlined text-primary text-2xl">date_range</span>
                      </div>
                      <div className="text-left">
                        <h3 className="font-black text-on-surface text-lg">Minggu {week.weekNum}</h3>
                        <p className="text-xs text-secondary font-medium">{week.totalItems} makanan • {Math.round(week.totalKalori)} kcal total</p>
                      </div>
                    </div>
                    <span className={`material-symbols-outlined text-secondary transition-transform ${expandedWeek === week.weekNum ? 'rotate-180' : ''}`}>expand_more</span>
                  </button>

                  {/* Days inside Week */}
                  {expandedWeek === week.weekNum && (
                    <div className="border-t border-outline-variant/10 animate-in fade-in slide-in-from-top-2 duration-300">
                      {week.days.map(day => (
                        <div key={day.dayNum} className="border-b border-outline-variant/5 last:border-b-0">
                          {/* Day Header */}
                          <button
                            onClick={() => setExpandedDay(expandedDay === `${week.weekNum}-${day.dayNum}` ? null : `${week.weekNum}-${day.dayNum}`)}
                            className="w-full flex items-center justify-between px-6 py-4 hover:bg-surface-container/30 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-xl bg-tertiary/10 flex items-center justify-center">
                                <span className="material-symbols-outlined text-tertiary text-[18px]">today</span>
                              </div>
                              <div className="text-left">
                                <p className="font-bold text-on-surface text-sm">Hari {day.dayNum}</p>
                                <p className="text-[10px] text-secondary">{day.date}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full">{Math.round(day.totalKalori)} kcal</span>
                              <span className={`material-symbols-outlined text-secondary text-[18px] transition-transform ${expandedDay === `${week.weekNum}-${day.dayNum}` ? 'rotate-180' : ''}`}>expand_more</span>
                            </div>
                          </button>

                          {/* Food items inside Day */}
                          {expandedDay === `${week.weekNum}-${day.dayNum}` && (
                            <div className="px-6 pb-4 space-y-2 animate-in fade-in slide-in-from-top-1 duration-200">
                              {day.logs.map(log => (
                                <div key={log.id} className="flex items-center justify-between p-4 rounded-xl bg-surface-container/40 hover:bg-surface-container/80 transition-colors group">
                                  <div className="flex items-center gap-3 min-w-0">
                                    {log.image_url ? (
                                      <img src={log.image_url} alt={log.nama_makanan} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                                    ) : (
                                      <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center flex-shrink-0">
                                        <span className="material-symbols-outlined text-secondary text-[16px]">restaurant</span>
                                      </div>
                                    )}
                                    <div className="min-w-0">
                                      <p className="font-bold text-on-surface text-sm truncate">{log.nama_makanan}</p>
                                      <p className="text-[10px] text-secondary">{log.porsi || '-'} • {new Date(log.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <div className="text-right hidden sm:block">
                                      <span className="text-xs font-black text-on-surface block">{log.kalori} kcal</span>
                                      <span className="text-[9px] text-secondary">P:{log.protein}g K:{log.karbohidrat}g L:{log.lemak}g</span>
                                    </div>
                                    <button
                                      onClick={() => deleteFoodLog(log.id)}
                                      className="p-1.5 rounded-lg text-secondary hover:text-error hover:bg-error/10 transition-all opacity-0 group-hover:opacity-100"
                                    >
                                      <span className="material-symbols-outlined text-[16px]">delete</span>
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 rounded-full text-sm font-bold shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-4 duration-300 ${toast.type === 'error' ? 'bg-error text-on-error' : 'bg-primary text-on-primary'}`}>
          <span className="material-symbols-outlined text-[16px]">{toast.type === 'error' ? 'error' : 'check_circle'}</span>
          {toast.msg}
        </div>
      )}
    </div>
  );
}
