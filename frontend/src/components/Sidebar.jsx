import { useNavigate, useLocation } from 'react-router-dom';

/**
 * Sidebar reusable untuk seluruh halaman NutriCheck.
 * @param {object|null} user - Data user dari localStorage/API (null = belum login)
 */
export default function Sidebar({ user = null }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const profileName = user?.nama || 'Guest';
  const profileAvatar = user?.avatar 
    ? (user.avatar.startsWith('http') ? user.avatar : `http://localhost:5000${user.avatar}`) 
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(profileName.charAt(0))}&background=006c51&color=ffffff`;

  const navItems = [
    { key: 'dashboard', label: 'Dashboard', icon: 'monitoring', path: '/dashboard' },
    { key: 'upload', label: 'Asisten AI', icon: 'auto_awesome', path: '/upload-food' },
    { key: 'report', label: 'Laporan', icon: 'history', path: '/report' },
    { key: 'menu', label: 'Rekomendasi Makanan', icon: 'restaurant', path: '/food-menu' },
    { key: 'community', label: 'Komunitas', icon: 'groups', path: '/community' },
  ];

  return (
    <>
      {/* SideNavBar (Desktop) */}
      <aside className="hidden lg:flex bg-surface-container-low font-sans antialiased h-screen w-72 fixed left-0 border-r-0 flex-col p-6 space-y-2 z-40 transition-colors">
        {/* Header */}
        <div className="mb-8 px-4 mt-4">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container shadow-sm border border-primary/10">
              <span className="material-symbols-outlined fill">vital_signs</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-on-surface tracking-tight">NutriCheck</h1>
              <p className="text-xs text-secondary">Premium Wellness</p>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex-1 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.key}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center px-4 py-3 rounded-xl transition-all duration-200 tap-highlight-transparent group ${
                  isActive
                    ? 'bg-primary/10 text-primary font-bold'
                    : 'text-secondary hover:bg-surface-container hover:text-primary transition-colors'
                }`}
              >
                <span className={`material-symbols-outlined mr-3 transition-transform group-hover:scale-110 ${isActive ? 'fill' : ''}`}>
                  {item.icon}
                </span>
                <span className="text-sm">{item.label}</span>
              </button>
            );
          })}
        </nav>



        {/* Footer Tabs */}
        <div className="pt-4 border-t border-outline-variant/10 space-y-1">
          {/* User Profile Info */}
          {/* Interactive Profile Session - Navigate to Settings */}
          <button 
            onClick={() => navigate('/settings')}
            className="w-full px-4 mb-4 py-3 bg-surface-container-high/40 rounded-2xl flex items-center gap-3 border border-outline-variant/10 hover:bg-surface-container-highest hover:border-primary/30 transition-all group text-left"
          >
            <div className="relative">
              <img 
                src={profileAvatar} 
                alt={profileName} 
                className="w-10 h-10 rounded-full border border-primary/20 object-cover group-hover:scale-105 transition-transform" 
              />
              <div className="absolute -bottom-1 -right-1 bg-primary text-white rounded-full p-0.5 shadow-lg scale-0 group-hover:scale-100 transition-transform">
                <span className="material-symbols-outlined text-[10px] block">edit</span>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-black text-on-surface truncate line-clamp-1">{profileName}</p>
              <p className="text-[10px] font-bold text-secondary uppercase tracking-widest group-hover:text-primary transition-colors">Kelola Profil</p>
            </div>
          </button>

          {user?.role === 'admin' && (
            <button 
              onClick={() => navigate('/admin')}
              className="w-full flex items-center px-4 py-3 text-primary bg-primary/5 hover:bg-primary/10 transition-colors rounded-xl group mb-2 border border-primary/10"
            >
              <span className="material-symbols-outlined mr-3 transition-transform group-hover:scale-110 fill">admin_panel_settings</span>
              <span className="font-bold text-sm">Admin Panel</span>
            </button>
          )}

          <button 
            className="w-full flex items-center px-4 py-3 text-secondary hover:bg-surface-container hover:text-primary transition-colors rounded-xl group"
          >
            <span className="material-symbols-outlined mr-3 transition-transform group-hover:scale-110">help</span>
            <span className="font-medium text-sm">Support</span>
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-4 py-3 text-secondary hover:bg-error/10 hover:text-error transition-colors rounded-xl group"
          >
            <span className="material-symbols-outlined mr-3 transition-transform group-hover:scale-110">logout</span>
            <span className="font-medium text-sm">Logout</span>
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Nav */}
      <nav className="lg:hidden fixed bottom-0 w-full bg-surface-container-lowest/90 backdrop-blur-md border-t border-surface-container-high shadow-[0_-10px_40px_-10px_rgba(0,0,0,0.05)] z-50 px-6 py-4 flex justify-between items-center pb-safe">
        {navItems.slice(0, 4).map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.key}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center gap-1 transition-all ${isActive ? 'text-primary' : 'text-secondary'}`}
            >
              <div className={`${isActive ? 'bg-primary/10 px-4 py-1 rounded-full' : ''}`}>
                <span className={`material-symbols-outlined text-[24px] ${isActive ? 'fill' : ''}`}>
                  {item.icon}
                </span>
              </div>
            </button>
          );
        })}
        
        {/* Tombol Admin Khusus Mobile */}
        {user?.role === 'admin' && (
           <button
             onClick={() => navigate('/admin')}
             className={`flex flex-col items-center gap-1 transition-all ${location.pathname === '/admin' ? 'text-primary' : 'text-secondary'}`}
           >
             <div className={`${location.pathname === '/admin' ? 'bg-primary/10 px-4 py-1 rounded-full' : ''}`}>
               <span className={`material-symbols-outlined text-[24px] ${location.pathname === '/admin' ? 'fill' : ''}`}>
                 admin_panel_settings
               </span>
             </div>
           </button>
        )}
      </nav>
    </>
  );
}
