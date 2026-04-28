import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    // Hapus semua data sesi lama saat masuk ke halaman login
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await axios.post('http://localhost:5000/api/login', {
        email,
        password
      });

      if (res.data.token) {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        // Arahkan admin ke panel admin, user biasa ke dashboard
        if (res.data.user.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/dashboard');
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const bgImage = "https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=2000&auto=format&fit=crop";

  return (
    <div className="font-body text-on-background bg-background antialiased min-h-screen relative overflow-x-hidden flex items-center justify-center p-4">
      {/* Background with overlay */}
      <div className="absolute inset-0 z-0 bg-cover bg-center" style={{ backgroundImage: `url(${bgImage})` }}></div>
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-surface/90 via-surface/70 to-primary/20 mix-blend-multiply"></div>

      <main className="relative z-10 w-full max-w-lg">
        {/* Glassmorphism Card */}
        <div className="bg-surface/85 backdrop-blur-[24px] rounded-[24px] shadow-[0_32px_64px_-15px_rgba(28,27,27,0.12)] border border-outline-variant/15 p-8 sm:p-12 overflow-hidden relative transition-all duration-500">
          <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-primary/10 to-transparent pointer-events-none"></div>
          
          {/* Brand Header */}
          <div className="flex items-center justify-center mb-10 gap-2">
            <span className="material-symbols-outlined text-primary text-3xl fill">eco</span>
            <h1 className="font-headline font-black tracking-tighter text-2xl text-on-surface">NutriCheck</h1>
          </div>

          <div className="mb-10 text-center text-on-surface animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-3xl font-extrabold tracking-tight mb-2">Welcome Back</h2>
            <p className="text-on-surface-variant text-sm font-medium">Continue your high-performance <br/>wellness journey.</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-error-container text-on-error-container rounded-xl text-xs font-bold border border-error/10 animate-pulse">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
            {/* Input Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-on-surface uppercase tracking-wider ml-1">Email Access</label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-primary group-focus-within:scale-110 transition-transform text-[20px]">alternate_email</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-surface-container border-none rounded-xl pl-12 pr-4 py-4 focus:ring-2 focus:ring-primary/30 transition-all font-medium placeholder:text-outline"
                  placeholder="name@vitality.com"
                />
              </div>
            </div>

            {/* Input Password */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-end mb-1">
                <label className="text-xs font-bold text-on-surface uppercase tracking-wider ml-1">Secure Passkey</label>
                <button type="button" className="text-[10px] font-black uppercase text-secondary hover:text-primary transition-colors tracking-widest">Forgot?</button>
              </div>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-primary group-focus-within:scale-110 transition-transform text-[20px]">lock_open</span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full bg-surface-container border-none rounded-xl pl-12 pr-4 py-4 focus:ring-2 focus:ring-primary/30 transition-all font-medium placeholder:text-outline"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-on-background text-surface rounded-full py-5 font-bold text-lg shadow-xl hover:opacity-95 transition-all flex items-center justify-center gap-3 active:scale-[0.98] mt-4 disabled:opacity-50"
            >
              {loading ? <span className="w-5 h-5 border-2 border-surface border-t-transparent animate-spin rounded-full"></span> : 'Initialize Session'}
              {!loading && <span className="material-symbols-outlined">rocket_launch</span>}
            </button>
          </form>

          {/* Footer */}
          <p className="mt-8 text-center text-xs text-on-surface-variant font-medium">
            New to the ecosystem? <Link to="/register" className="text-primary font-bold hover:underline">Create Agent</Link>
          </p>
        </div>
        
        <div className="mt-8 text-center text-on-surface/60 text-[10px] font-black uppercase tracking-[0.2em] px-8 leading-relaxed">
            Locked by NutriCheck Bio-Metric Protocol v2.4
        </div>
      </main>
    </div>
  );
}
