import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API = 'http://localhost:5000/api/admin';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [foods, setFoods] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ open: false, type: '', mode: '', data: null });
  const [formData, setFormData] = useState({});
  const [toast, setToast] = useState(null);
  const [recFilter, setRecFilter] = useState('semua');
  const [selectedIds, setSelectedIds] = useState([]);
  const [isScanning, setIsScanning] = useState(false);
  const navigate = useNavigate();

  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    
    // Jika tidak ada token (belum login), lempar ke halaman login
    if (!token) {
      navigate('/login');
      return;
    }

    // Jika sudah login tapi bukan admin, lempar ke dashboard biasa
    if (user?.role !== 'admin') {
      navigate('/dashboard');
      return;
    }

    fetchAll();
  }, []);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [s, u, f, r] = await Promise.all([
        axios.get(`${API}/stats`, { headers }),
        axios.get(`${API}/users`, { headers }),
        axios.get(`${API}/food-catalog`, { headers }),
        axios.get(`${API}/recommendations`, { headers }),
      ]);
      setStats(s.data.data);
      setUsers(u.data.data);
      setFoods(f.data.data);
      setRecommendations(r.data.data);
    } catch (err) {
      console.error(err);
      if (err.response?.status === 403) navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  // ──── CRUD Handlers ────
  const handleDelete = async (type, id) => {
    if (!confirm('Yakin ingin menghapus data ini?')) return;
    try {
      await axios.delete(`${API}/${type}/${id}`, { headers });
      showToast('Data berhasil dihapus.');
      fetchAll();
    } catch (err) {
      showToast(err.response?.data?.message || 'Gagal menghapus.', 'error');
    }
  };

  const handleRoleChange = async (id, newRole) => {
    try {
      await axios.put(`${API}/users/${id}/role`, { role: newRole }, { headers });
      showToast(`Role berhasil diubah ke "${newRole}".`);
      fetchAll();
    } catch (err) {
      showToast(err.response?.data?.message || 'Gagal mengubah role.', 'error');
    }
  };

  const handleTujuanChange = async (id, tujuan) => {
    try {
      await axios.put(`${API}/recommendations/${id}`, { tujuan }, { headers });
      showToast(`Tujuan berhasil diubah.`);
      fetchAll();
    } catch (err) {
      showToast(err.response?.data?.message || 'Gagal mengubah tujuan.', 'error');
    }
  };

  const handleBulkTujuan = async (tujuan) => {
    if (selectedIds.length === 0) { showToast('Pilih makanan terlebih dahulu.', 'error'); return; }
    try {
      await axios.put(`${API}/recommendations/bulk`, { ids: selectedIds, tujuan }, { headers });
      showToast(`${selectedIds.length} makanan berhasil diperbarui.`);
      setSelectedIds([]);
      fetchAll();
    } catch (err) {
      showToast(err.response?.data?.message || 'Gagal memperbarui.', 'error');
    }
  };

  const toggleSelect = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const filteredRecs = recommendations.filter(r => {
    if (recFilter === 'semua') return true;
    return r.tujuan === recFilter;
  });

  const openModal = (type, mode, data = null) => {
    setModal({ open: true, type, mode, data });
    if (mode === 'edit' && data) {
      setFormData({ ...data });
    } else {
      if (type === 'food-catalog') setFormData({ name: '', kalori: '', protein: '', karbohidrat: '', lemak: '', kategori: '', image_url: '' });
      if (type === 'recommendations') setFormData({ judul: '', konten: '', kategori_target: 'semua', image_url: '' });
    }
  };

  const handleScanImage = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsScanning(true);
    showToast('Mengirim ke AI Scanner...', 'success');
    const fd = new FormData();
    fd.append('image', file);
    try {
      const res = await axios.post('http://localhost:5000/api/analyze-food', fd, {
        headers: { 'Content-Type': 'multipart/form-data', ...headers }
      });
      const aiData = res.data.data;
      setFormData(prev => ({
        ...prev,
        name: aiData.nama_makanan || '',
        kalori: aiData.kalori || '',
        protein: aiData.protein || '',
        karbohidrat: aiData.karbohidrat || '',
        lemak: aiData.lemak || ''
      }));
      showToast('Scan AI Berhasil! Data telah terisi.');
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || 'Gagal melakukan scan gambar.', 'error');
    } finally {
      setIsScanning(false);
      e.target.value = null; 
    }
  };

  const handleSubmit = async () => {
    try {
      if (modal.mode === 'add') {
        await axios.post(`${API}/${modal.type}`, formData, { headers });
        showToast('Data berhasil ditambahkan!');
      } else {
        await axios.put(`${API}/${modal.type}/${modal.data.id}`, formData, { headers });
        showToast('Data berhasil diperbarui!');
      }
      setModal({ open: false, type: '', mode: '', data: null });
      fetchAll();
    } catch (err) {
      showToast(err.response?.data?.message || 'Gagal menyimpan data.', 'error');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const tabs = [
    { key: 'overview', label: 'Overview', icon: 'dashboard' },
    { key: 'users', label: 'Users', icon: 'group' },
    { key: 'foods', label: 'Food Catalog', icon: 'restaurant_menu' },
    { key: 'recommendations', label: 'Rekomendasi', icon: 'lightbulb' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
          <p className="text-secondary font-bold tracking-widest text-xs uppercase">Loading Admin Panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-on-background font-body antialiased">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-6 right-6 z-[100] px-6 py-4 rounded-2xl shadow-2xl font-bold text-sm flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300 ${toast.type === 'error' ? 'bg-error text-on-error' : 'bg-primary text-on-primary'}`}>
          <span className="material-symbols-outlined text-[20px]">{toast.type === 'error' ? 'error' : 'check_circle'}</span>
          {toast.msg}
        </div>
      )}

      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 bg-surface/80 backdrop-blur-xl border-b border-outline-variant/10">
        <div className="max-w-screen-2xl mx-auto px-6 md:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-md">
              <span className="material-symbols-outlined text-on-primary text-[18px] fill">admin_panel_settings</span>
            </div>
            <div>
              <h1 className="font-black text-on-surface tracking-tight text-lg leading-none">Admin Panel</h1>
              <p className="text-[10px] text-secondary font-bold uppercase tracking-widest">NutriCheck Control Center</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/dashboard')} className="px-4 py-2 text-xs font-bold text-secondary border border-outline-variant/20 rounded-xl hover:bg-surface-container transition-colors flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px]">arrow_back</span> Dashboard User
            </button>
            <button onClick={handleLogout} className="px-4 py-2 text-xs font-bold text-error border border-error/20 rounded-xl hover:bg-error/5 transition-colors flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px]">logout</span> Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-screen-2xl mx-auto px-6 md:px-8 py-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-shrink-0 flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold transition-all duration-200 ${
                activeTab === tab.key
                  ? 'bg-primary text-on-primary shadow-lg shadow-primary/20'
                  : 'bg-surface-container text-secondary hover:bg-surface-container-high border border-outline-variant/10'
              }`}
            >
              <span className={`material-symbols-outlined text-[18px] ${activeTab === tab.key ? 'fill' : ''}`}>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* ═══ OVERVIEW TAB ═══ */}
        {activeTab === 'overview' && stats && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div>
              <h2 className="text-3xl font-black tracking-tight text-on-surface mb-1">Selamat Datang, Admin 👋</h2>
              <p className="text-secondary font-medium">Berikut ringkasan data keseluruhan aplikasi NutriCheck.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: 'Total Users', value: stats.totalUsers, icon: 'group', color: 'primary' },
                { label: 'Food Catalog', value: stats.totalFoods, icon: 'restaurant_menu', color: 'tertiary' },
                { label: 'Terklasifikasi', value: stats.totalClassified, icon: 'lightbulb', color: 'primary' },
                { label: 'Food Logs', value: stats.totalFoodLogs, icon: 'receipt_long', color: 'tertiary' },
              ].map((s, i) => (
                <div key={i} className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/10 shadow-sm hover:shadow-md transition-shadow">
                  <div className={`w-12 h-12 rounded-2xl bg-${s.color}/10 flex items-center justify-center mb-4 border border-${s.color}/20`}>
                    <span className={`material-symbols-outlined text-${s.color} text-2xl`}>{s.icon}</span>
                  </div>
                  <p className="text-[10px] font-black text-secondary uppercase tracking-widest mb-1">{s.label}</p>
                  <p className="text-3xl font-black text-on-surface">{s.value}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ═══ USERS TAB ═══ */}
        {activeTab === 'users' && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-black tracking-tight">Kelola Users</h2>
                <p className="text-secondary text-sm">{users.length} user terdaftar</p>
              </div>
            </div>
            <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/10 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-surface-container text-left">
                      <th className="px-6 py-4 font-black text-[10px] uppercase tracking-widest text-secondary">ID</th>
                      <th className="px-6 py-4 font-black text-[10px] uppercase tracking-widest text-secondary">Nama</th>
                      <th className="px-6 py-4 font-black text-[10px] uppercase tracking-widest text-secondary">Email</th>
                      <th className="px-6 py-4 font-black text-[10px] uppercase tracking-widest text-secondary">Gender</th>
                      <th className="px-6 py-4 font-black text-[10px] uppercase tracking-widest text-secondary">Role</th>
                      <th className="px-6 py-4 font-black text-[10px] uppercase tracking-widest text-secondary">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u.id} className="border-t border-outline-variant/10 hover:bg-surface-container/50 transition-colors">
                        <td className="px-6 py-4 font-bold text-secondary">{u.id}</td>
                        <td className="px-6 py-4 font-bold text-on-surface">{u.nama}</td>
                        <td className="px-6 py-4 text-secondary">{u.email}</td>
                        <td className="px-6 py-4 text-secondary capitalize">{u.gender}</td>
                        <td className="px-6 py-4">
                          <select
                            value={u.role}
                            onChange={e => handleRoleChange(u.id, e.target.value)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold border-none cursor-pointer ${
                              u.role === 'admin'
                                ? 'bg-primary/10 text-primary'
                                : 'bg-surface-container text-secondary'
                            }`}
                          >
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                          </select>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleDelete('users', u.id)}
                            className="p-2 rounded-lg text-error hover:bg-error/10 transition-colors"
                            title="Hapus user"
                          >
                            <span className="material-symbols-outlined text-[18px]">delete</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ═══ FOOD CATALOG TAB ═══ */}
        {activeTab === 'foods' && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-black tracking-tight">Kelola Food Catalog</h2>
                <p className="text-secondary text-sm">{foods.length} item makanan</p>
              </div>
              <button
                onClick={() => openModal('food-catalog', 'add')}
                className="px-5 py-3 bg-primary text-on-primary rounded-xl font-bold text-sm shadow-lg hover:shadow-primary/20 transition-all flex items-center gap-2 hover:-translate-y-0.5 transform"
              >
                <span className="material-symbols-outlined text-[18px]">add_circle</span>
                Tambah Makanan
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {foods.map(f => (
                <div key={f.id} className="bg-surface-container-lowest rounded-2xl overflow-hidden border border-outline-variant/10 shadow-sm hover:shadow-md transition-all group">
                  {f.image_url && (
                    <div className="h-44 w-full overflow-hidden">
                      <img src={f.image_url} alt={f.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                  )}
                  <div className="p-6">
                    <h3 className="font-bold text-lg text-on-surface mb-1">{f.name}</h3>
                    {f.kategori && <span className="text-[10px] font-black text-primary bg-primary/10 px-2 py-1 rounded-md uppercase tracking-wider">{f.kategori}</span>}
                    <div className="grid grid-cols-4 gap-2 mt-4">
                      <div className="text-center p-2 bg-surface-container rounded-xl">
                        <p className="text-[9px] font-black text-secondary uppercase">Kal</p>
                        <p className="font-bold text-on-surface">{f.kalori}</p>
                      </div>
                      <div className="text-center p-2 bg-surface-container rounded-xl">
                        <p className="text-[9px] font-black text-secondary uppercase">Pro</p>
                        <p className="font-bold text-primary">{f.protein}g</p>
                      </div>
                      <div className="text-center p-2 bg-surface-container rounded-xl">
                        <p className="text-[9px] font-black text-secondary uppercase">Cho</p>
                        <p className="font-bold text-secondary">{f.karbohidrat}g</p>
                      </div>
                      <div className="text-center p-2 bg-surface-container rounded-xl">
                        <p className="text-[9px] font-black text-secondary uppercase">Fat</p>
                        <p className="font-bold text-tertiary">{f.lemak}g</p>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <button onClick={() => openModal('food-catalog', 'edit', f)} className="flex-1 py-2.5 text-xs font-bold text-primary bg-primary/10 rounded-xl hover:bg-primary/20 transition-colors flex items-center justify-center gap-1">
                        <span className="material-symbols-outlined text-[16px]">edit</span> Edit
                      </button>
                      <button onClick={() => handleDelete('food-catalog', f.id)} className="py-2.5 px-4 text-xs font-bold text-error bg-error/10 rounded-xl hover:bg-error/20 transition-colors flex items-center justify-center gap-1">
                        <span className="material-symbols-outlined text-[16px]">delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {foods.length === 0 && (
                <div className="col-span-full py-20 text-center">
                  <span className="material-symbols-outlined text-5xl text-outline-variant mb-3">inventory_2</span>
                  <h3 className="font-bold text-lg text-on-surface mb-1">Belum Ada Data</h3>
                  <p className="text-secondary text-sm">Klik "Tambah Makanan" untuk mulai mengisi katalog.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ═══ RECOMMENDATIONS TAB ═══ */}
        {activeTab === 'recommendations' && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="text-2xl font-black tracking-tight">Klasifikasi Rekomendasi</h2>
                <p className="text-secondary text-sm">Tentukan setiap makanan di katalog untuk tujuan menaikkan atau menurunkan berat badan.</p>
              </div>
            </div>

            {/* Summary Badges */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { label: 'Belum Ditentukan', filter: 'belum ditentukan', count: recommendations.filter(r => r.tujuan === 'belum ditentukan').length, icon: 'help', bg: 'bg-surface-container', text: 'text-secondary', border: 'border-outline-variant/20' },
                { label: 'Menurunkan BB', filter: 'menurunkan berat badan', count: recommendations.filter(r => r.tujuan === 'menurunkan berat badan').length, icon: 'trending_down', bg: 'bg-primary/5', text: 'text-primary', border: 'border-primary/20' },
                { label: 'Menaikkan BB', filter: 'menaikkan berat badan', count: recommendations.filter(r => r.tujuan === 'menaikkan berat badan').length, icon: 'trending_up', bg: 'bg-tertiary/5', text: 'text-tertiary', border: 'border-tertiary/20' },
              ].map(b => (
                <button
                  key={b.filter}
                  onClick={() => setRecFilter(recFilter === b.filter ? 'semua' : b.filter)}
                  className={`p-5 rounded-2xl border ${b.border} ${b.bg} flex items-center gap-4 transition-all hover:shadow-md ${
                    recFilter === b.filter ? 'ring-2 ring-offset-2 ring-primary shadow-lg' : ''
                  }`}
                >
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${b.bg} ${b.text}`}>
                    <span className="material-symbols-outlined text-2xl">{b.icon}</span>
                  </div>
                  <div className="text-left">
                    <p className="text-[10px] font-black uppercase tracking-widest text-secondary">{b.label}</p>
                    <p className="text-2xl font-black text-on-surface">{b.count}</p>
                  </div>
                </button>
              ))}
            </div>

            {/* Bulk Action Bar */}
            {selectedIds.length > 0 && (
              <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                <p className="text-sm font-bold text-primary">
                  <span className="material-symbols-outlined text-[16px] align-middle mr-1">check_circle</span>
                  {selectedIds.length} makanan terpilih
                </p>
                <div className="flex gap-2">
                  <button onClick={() => handleBulkTujuan('menurunkan berat badan')} className="px-4 py-2 bg-primary text-on-primary rounded-xl text-xs font-bold flex items-center gap-1.5 hover:shadow-lg transition-all">
                    <span className="material-symbols-outlined text-[14px]">trending_down</span> Menurunkan BB
                  </button>
                  <button onClick={() => handleBulkTujuan('menaikkan berat badan')} className="px-4 py-2 bg-tertiary text-on-tertiary rounded-xl text-xs font-bold flex items-center gap-1.5 hover:shadow-lg transition-all">
                    <span className="material-symbols-outlined text-[14px]">trending_up</span> Menaikkan BB
                  </button>
                  <button onClick={() => handleBulkTujuan('belum ditentukan')} className="px-4 py-2 bg-surface-container text-secondary rounded-xl text-xs font-bold flex items-center gap-1.5 hover:shadow-md transition-all border border-outline-variant/20">
                    <span className="material-symbols-outlined text-[14px]">restart_alt</span> Reset
                  </button>
                  <button onClick={() => setSelectedIds([])} className="px-4 py-2 text-secondary rounded-xl text-xs font-bold hover:bg-surface-container transition-colors">
                    Batal
                  </button>
                </div>
              </div>
            )}

            {/* Food Classification Table */}
            <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/10 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-surface-container text-left">
                      <th className="px-4 py-4 w-10">
                        <input
                          type="checkbox"
                          className="rounded cursor-pointer accent-primary"
                          checked={filteredRecs.length > 0 && selectedIds.length === filteredRecs.length}
                          onChange={e => {
                            if (e.target.checked) setSelectedIds(filteredRecs.map(r => r.id));
                            else setSelectedIds([]);
                          }}
                        />
                      </th>
                      <th className="px-4 py-4 font-black text-[10px] uppercase tracking-widest text-secondary">Makanan</th>
                      <th className="px-4 py-4 font-black text-[10px] uppercase tracking-widest text-secondary">Kalori</th>
                      <th className="px-4 py-4 font-black text-[10px] uppercase tracking-widest text-secondary">Protein</th>
                      <th className="px-4 py-4 font-black text-[10px] uppercase tracking-widest text-secondary">Karbo</th>
                      <th className="px-4 py-4 font-black text-[10px] uppercase tracking-widest text-secondary">Lemak</th>
                      <th className="px-4 py-4 font-black text-[10px] uppercase tracking-widest text-secondary min-w-[200px]">Tujuan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRecs.map(r => (
                      <tr key={r.id} className={`border-t border-outline-variant/10 hover:bg-surface-container/50 transition-colors ${selectedIds.includes(r.id) ? 'bg-primary/5' : ''}`}>
                        <td className="px-4 py-4">
                          <input
                            type="checkbox"
                            className="rounded cursor-pointer accent-primary"
                            checked={selectedIds.includes(r.id)}
                            onChange={() => toggleSelect(r.id)}
                          />
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            {r.image_url ? (
                              <img src={r.image_url} alt={r.name} className="w-10 h-10 rounded-xl object-cover flex-shrink-0" />
                            ) : (
                              <div className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center flex-shrink-0">
                                <span className="material-symbols-outlined text-secondary text-[18px]">restaurant</span>
                              </div>
                            )}
                            <div className="min-w-0">
                              <p className="font-bold text-on-surface truncate">{r.name}</p>
                              {r.kategori && <p className="text-[10px] text-secondary font-bold uppercase tracking-wider">{r.kategori}</p>}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 font-bold text-on-surface">{r.kalori}</td>
                        <td className="px-4 py-4 font-bold text-primary">{r.protein}g</td>
                        <td className="px-4 py-4 font-bold text-secondary">{r.karbohidrat}g</td>
                        <td className="px-4 py-4 font-bold text-tertiary">{r.lemak}g</td>
                        <td className="px-4 py-4">
                          <select
                            value={r.tujuan}
                            onChange={e => handleTujuanChange(r.id, e.target.value)}
                            className={`px-3 py-2 rounded-xl text-xs font-bold border-none cursor-pointer transition-colors ${
                              r.tujuan === 'menurunkan berat badan'
                                ? 'bg-primary/10 text-primary'
                                : r.tujuan === 'menaikkan berat badan'
                                ? 'bg-tertiary/10 text-tertiary'
                                : 'bg-surface-container text-secondary'
                            }`}
                          >
                            <option value="belum ditentukan">⏳ Belum Ditentukan</option>
                            <option value="menurunkan berat badan">📉 Menurunkan BB</option>
                            <option value="menaikkan berat badan">📈 Menaikkan BB</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {filteredRecs.length === 0 && (
                <div className="py-20 text-center">
                  <span className="material-symbols-outlined text-5xl text-outline-variant mb-3">inventory_2</span>
                  <h3 className="font-bold text-lg text-on-surface mb-1">{recFilter !== 'semua' ? 'Tidak Ada Makanan di Kategori Ini' : 'Belum Ada Makanan'}</h3>
                  <p className="text-secondary text-sm">{recFilter !== 'semua' ? 'Coba ganti filter atau tambahkan makanan baru di Food Catalog.' : 'Tambahkan makanan terlebih dahulu di tab Food Catalog.'}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ═══ MODAL (Add / Edit) ═══ */}
      {modal.open && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4" onClick={() => setModal({ open: false, type: '', mode: '', data: null })}>
          <div className="absolute inset-0 bg-on-surface/40 backdrop-blur-sm"></div>
          <div className="relative bg-surface rounded-3xl shadow-2xl w-full max-w-lg p-8 border border-outline-variant/20 max-h-[90vh] overflow-y-auto modal-scrollbar animate-in fade-in zoom-in-95 duration-300" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-black text-on-surface">
                {modal.mode === 'add' ? 'Tambah' : 'Edit'} Makanan
              </h3>
              <button onClick={() => setModal({ open: false, type: '', mode: '', data: null })} className="p-2 rounded-xl hover:bg-surface-container transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {modal.type === 'food-catalog' && (
              <div className="space-y-4">
                
                {/* AI Input Block */}
                <div className="bg-primary/5 p-4 rounded-xl border border-primary/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 relative overflow-hidden group">
                  <div className="absolute right-0 top-0 opacity-5 p-2 transition-transform group-hover:scale-125 duration-1000">
                    <span className="material-symbols-outlined text-6xl">auto_awesome</span>
                  </div>
                  <div className="relative z-10">
                    <h4 className="text-sm font-black text-primary flex items-center gap-1.5 uppercase tracking-widest">
                       <span className="material-symbols-outlined text-[16px]">center_focus_strong</span> NutriScan AI
                    </h4>
                    <p className="text-xs text-secondary mt-1 font-medium max-w-[250px]">Unggah foto masakan untuk mengekstrak data protein, kalori, dan molekul gizi secara otomatis.</p>
                  </div>
                  <label className={`relative z-10 cursor-pointer px-5 py-3 w-full md:w-auto text-center bg-primary text-on-primary rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${isScanning ? 'opacity-70 pointer-events-none' : 'hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-0.5'}`}>
                    {isScanning ? <span className="material-symbols-outlined text-[16px] animate-spin">sync</span> : <span className="material-symbols-outlined text-[16px]">add_a_photo</span>}
                    {isScanning ? 'Membongkar...' : 'Scan Foto'}
                    <input type="file" accept="image/*" className="hidden" onChange={handleScanImage} disabled={isScanning} />
                  </label>
                </div>
                
                <div className="flex items-center gap-3 my-4">
                   <div className="h-px bg-outline-variant/20 flex-1"></div>
                   <span className="text-[9px] font-black tracking-[0.2em] text-secondary uppercase">Atau Input Manual</span>
                   <div className="h-px bg-outline-variant/20 flex-1"></div>
                </div>

                <InputField label="Nama Makanan" value={formData.name || ''} onChange={v => setFormData({...formData, name: v})} placeholder="Contoh: Nasi Goreng Ayam" />
                <div className="grid grid-cols-2 gap-4">
                  <InputField label="Kalori" type="number" value={formData.kalori || ''} onChange={v => setFormData({...formData, kalori: v})} placeholder="250" />
                  <InputField label="Protein (g)" type="number" value={formData.protein || ''} onChange={v => setFormData({...formData, protein: v})} placeholder="15" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <InputField label="Karbohidrat (g)" type="number" value={formData.karbohidrat || ''} onChange={v => setFormData({...formData, karbohidrat: v})} placeholder="45" />
                  <InputField label="Lemak (g)" type="number" value={formData.lemak || ''} onChange={v => setFormData({...formData, lemak: v})} placeholder="8" />
                </div>
                <InputField label="Kategori" value={formData.kategori || ''} onChange={v => setFormData({...formData, kategori: v})} placeholder="High Protein, Breakfast" />
                <InputField label="Image URL" value={formData.image_url || ''} onChange={v => setFormData({...formData, image_url: v})} placeholder="https://..." />
              </div>
            )}

            <div className="flex gap-3 mt-8">
              <button
                onClick={() => setModal({ open: false, type: '', mode: '', data: null })}
                className="flex-1 py-3.5 text-sm font-bold text-secondary border border-outline-variant/20 rounded-xl hover:bg-surface-container transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleSubmit}
                className="flex-[2] py-3.5 text-sm font-bold bg-primary text-on-primary rounded-xl shadow-lg hover:shadow-primary/20 transition-all flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">save</span>
                {modal.mode === 'add' ? 'Simpan' : 'Perbarui'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Reusable Input Component
function InputField({ label, value, onChange, placeholder, type = 'text' }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-bold text-on-surface uppercase tracking-wider ml-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full bg-surface-container border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/30 transition-all font-medium"
        placeholder={placeholder}
      />
    </div>
  );
}
