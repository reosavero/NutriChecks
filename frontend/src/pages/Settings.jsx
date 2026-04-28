import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Sidebar from '../components/Sidebar';

const API = 'http://localhost:5000/api';

export default function Settings() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState(null);
  
  const [nama, setNama] = useState('');
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { navigate('/login'); return; }
    fetchUserProfile();
  }, [navigate]);

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API}/dashboard`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const userData = res.data.user; // Ambil data user lengkap dari respon baru dashboardController
      setUser(userData);
      setNama(userData.nama || '');
      setIsLoading(false);
    } catch (err) {
      console.error(err);
      setIsLoading(false);
    }
  };

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('avatar', file);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`${API}/user/upload-avatar`, fd, {
        headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` }
      });
      const updatedUser = { ...user, avatar: res.data.avatar };
      const localUser = JSON.parse(localStorage.getItem('user'));
      localStorage.setItem('user', JSON.stringify({ ...localUser, avatar: res.data.avatar, nama }));
      setUser(updatedUser);
      showToast('Avatar berhasil diperbarui!');
    } catch (err) { showToast('Gagal mengunggah foto.', 'error'); }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const token = localStorage.getItem('token');
      const fullUser = JSON.parse(localStorage.getItem('user'));
      const updateData = { ...fullUser, nama };
      
      await axios.put(`${API}/user/profile`, updateData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      localStorage.setItem('user', JSON.stringify(updateData));
      setUser({ ...user, nama });
      showToast('Nama berhasil diperbarui!');
    } catch (err) { showToast('Gagal menyimpan perubahan.', 'error'); } 
    finally { setIsSaving(false); }
  };

  if (isLoading || !user) return null;

  const profileAvatar = user.avatar 
    ? (user.avatar.startsWith('http') ? user.avatar : `http://localhost:5000${user.avatar}`) 
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(user.nama.charAt(0))}&background=006c51&color=fff`;

  const fullUserRes = JSON.parse(localStorage.getItem('user') || '{}');

  return (
    <div className="flex h-screen overflow-hidden bg-background text-on-background font-body antialiased">
      <Sidebar user={{...user, nama}} />

      <main className="flex-1 lg:ml-72 flex flex-col min-h-screen overflow-y-auto pb-24 lg:pb-0">
        <div className="flex-1 p-6 md:p-12 max-w-5xl mx-auto w-full space-y-12">
          
          <header className="flex flex-col space-y-3">
             <div className="flex items-center gap-3">
                <span className="h-px w-8 bg-primary"></span>
                <h2 className="text-[10px] font-black text-primary tracking-[0.4em] uppercase">User Identity Card</h2>
             </div>
             <h1 className="text-display-md font-headline font-black text-on-surface tracking-tighter leading-none">
                NutriCheck <br/>
             </h1>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            
            {/* Left Col: Avatar & Primary ID */}
            <div className="lg:col-span-4 space-y-8">
               <div className="relative group">
                  <div className="aspect-square rounded-[3rem] overflow-hidden border-[6px] border-surface-container-high shadow-2xl relative bg-surface-container">
                     <img src={profileAvatar} alt="Profile" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                     <div onClick={() => fileInputRef.current.click()} className="absolute inset-0 bg-primary/40 backdrop-blur-sm flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 cursor-pointer">
                        <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mb-3 border border-white/30">
                           <span className="material-symbols-outlined text-white text-3xl">add_a_photo</span>
                        </div>
                        <span className="text-white text-[10px] font-black uppercase tracking-[0.2em]">Update Identity Image</span>
                     </div>
                  </div>
                  <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} />
               </div>
            </div>

            {/* Right Col: Editable Name & Static Bio-Matrix */}
            <div className="lg:col-span-8 space-y-8">
               
               {/* Section 1: Dynamic Field */}
               <div className="bg-surface-container-lowest rounded-[2.5rem] p-10 border border-outline-variant/15 shadow-xl space-y-8">
                  <div className="flex items-center justify-between">
                     <h3 className="text-lg font-black text-on-surface uppercase tracking-widest">Edit Information</h3>
                  </div>
                  <form onSubmit={handleUpdateProfile} className="space-y-6">
                    <div className="space-y-3">
                      <label className="text-[11px] font-black text-secondary uppercase tracking-[0.2em] ml-1">Nama Lengkap</label>
                      <div className="relative group">
                         <input 
                           type="text" 
                           value={nama}
                           onChange={(e) => setNama(e.target.value)}
                           className="w-full bg-surface-container-low py-5 px-8 rounded-3xl border-2 border-transparent focus:border-primary/30 focus:ring-4 focus:ring-primary/5 font-black text-lg shadow-inner transition-all"
                           placeholder="Enter your name..."
                         />
                      </div>
                    </div>
                    <button 
                      type="submit" 
                      disabled={isSaving || nama === user.nama}
                      className="w-full bg-on-background text-surface py-5 rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-xs shadow-2xl hover:bg-primary transition-all flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-30 disabled:hover:bg-on-background"
                    >
                      {isSaving ? 'Synchronizing...' : 'Save Updates'}
                    </button>
                  </form>
               </div>

               {/* Section 2: Immutable Bio-Matrix (Bento Style) */}
               <div className="space-y-6">
                  <div className="flex items-center gap-4">
                     <h3 className="text-[11px] font-black text-secondary uppercase tracking-[0.3em] whitespace-nowrap">Immutable Bio-Matrix</h3>
                     <div className="h-px bg-outline-variant/20 flex-1"></div>
                     <span className="material-symbols-outlined text-secondary text-sm">lock</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                     {[
                       { label: 'Weight', val: user.berat_badan, unit: 'kg', icon: 'weights' },
                       { label: 'Height', val: user.tinggi_badan, unit: 'cm', icon: 'height' },
                       { label: 'Age', val: user.usia, unit: 'yrs', icon: 'history_edu' },
                       { label: 'Email', val: user.email, unit: '', icon: 'alternate_email', colSpan: 'sm:col-span-2' },
                       { label: 'Gender', val: user.gender, unit: '', icon: 'face', capitalize: true },
                       { label: 'Target', val: user.tujuan, unit: '', icon: 'track_changes', capitalize: true, colSpan: 'sm:col-span-2' },
                       { label: 'Role', val: user.role, unit: '', icon: 'admin_panel_settings', capitalize: true },
                     ].map((item, idx) => (
                       <div key={idx} className={`bg-surface-container-high/40 p-6 rounded-[2rem] border border-outline-variant/5 hover:bg-surface-container transition-colors group ${item.colSpan || ''}`}>
                          <div className="flex items-center gap-3 mb-3">
                             <span className="material-symbols-outlined text-secondary text-lg group-hover:text-primary transition-colors">{item.icon}</span>
                             <p className="text-[9px] font-black text-secondary uppercase tracking-widest">{item.label}</p>
                          </div>
                          <p className={`text-xl font-black text-on-surface ${item.capitalize ? 'capitalize truncate' : ''} ${item.label.includes('Email') ? 'text-sm lowercase' : ''}`}>
                             {item.val} <span className="text-[10px] text-secondary font-bold font-sans">{item.unit}</span>
                          </p>
                       </div>
                     ))}
                  </div>

                  <div className="bg-primary/5 rounded-[2.5rem] p-8 border border-primary/10 flex items-center justify-between group overflow-hidden relative">
                    <div className="absolute -right-10 -top-10 w-32 h-32 bg-primary/5 rounded-full blur-3xl"></div>
                    <div className="flex items-center gap-6 relative z-10">
                        <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary border border-primary/20">
                           <span className="material-symbols-outlined text-3xl">bolt</span>
                        </div>
                        <div>
                           <p className="text-[9px] font-black text-primary uppercase tracking-[0.4em] mb-1">Metabolic Velocity</p>
                           <h4 className="text-2xl font-black text-on-surface tracking-tighter capitalize">{user.kecepatan} <span className="text-xs text-secondary font-bold">Tempo</span></h4>
                        </div>
                    </div>
                    <div className="text-right hidden sm:block relative z-10">
                       <p className="text-[9px] font-black text-secondary uppercase tracking-widest mb-1">Energy Budget</p>
                       <p className="text-xl font-black text-primary tracking-tighter">{user.target_kalori} <span className="text-[10px] font-medium">KCAL/DAY</span></p>
                    </div>
                  </div>
               </div>
               
               <p className="text-center text-[10px] text-secondary font-medium tracking-wide italic py-4 opacity-50">
                  Data biologis di atas telah dikunci secara sistem untuk menjaga integritas algoritma AI.<br/>Hubungi administrator untuk perubahan data metrik dasar.
               </p>

            </div>

          </div>
        </div>
      </main>

      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-12 left-1/2 -translate-x-1/2 z-[100] px-8 py-4 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl animate-in fade-in slide-in-from-bottom-6 duration-500 flex items-center gap-3 backdrop-blur-xl ${toast.type === 'error' ? 'bg-error/90 text-on-error border border-error-container' : 'bg-on-background/90 text-surface border border-white/10'}`}>
          <span className="material-symbols-outlined text-sm">{toast.type === 'error' ? 'report_problem' : 'verified'}</span>
          {toast.msg}
        </div>
      )}
    </div>
  );
}
