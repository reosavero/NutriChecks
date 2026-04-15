import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faLock } from '@fortawesome/free-solid-svg-icons';
import { Leaf, ShieldCheck, Check } from 'lucide-react';

const LeftPanel = () => {
  return (
    <div className="hidden lg:flex lg:w-[42%] xl:w-[38%] bg-gradient-to-br from-emerald-900/40 via-slate-900 to-slate-950 flex-col justify-center items-center p-10 xl:p-14 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute -top-20 -left-20 w-72 h-72 bg-emerald-500/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-32 -right-20 w-96 h-96 bg-teal-500/5 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-emerald-400/3 rounded-full blur-2xl"></div>
      </div>

      {/* Branding */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-sm">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-12">
          <div className="bg-emerald-500/20 p-2.5 rounded-xl border border-emerald-500/30">
            <Leaf className="w-7 h-7 text-emerald-400" />
          </div>
          <span className="text-2xl font-bold tracking-tight">NutriCheck</span>
        </div>

        {/* Info card */}
        <div className="w-full">
          <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/40 rounded-2xl p-8 mb-8">
            <div className="bg-emerald-500/15 p-4 rounded-2xl w-fit mx-auto mb-5 border border-emerald-500/20">
              <ShieldCheck className="w-10 h-10 text-emerald-400" />
            </div>
            <h3 className="text-xl font-bold mb-3">Selamat Datang</h3>
            <p className="text-slate-400 text-sm leading-relaxed">Masuk untuk melanjutkan perjalanan kesehatan Anda dan pantau nutrisi harian secara teratur.</p>
          </div>

          {/* Feature list */}
          <div className="space-y-3">
            {[
              'Akses rencana kalori Anda',
              'Pantau progres berat badan',
              'Data pribadi aman terenkripsi'
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-3 text-sm">
                <div className="bg-emerald-500/20 p-1 rounded-full flex-shrink-0">
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <span className="text-slate-300">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

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
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Terjadi kesalahan pada server saat login.');
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="flex h-screen overflow-hidden bg-slate-950 text-white font-sans">
      
      {/* ═══ Left Panel (Desktop only) ═══ */}
      <LeftPanel />

      {/* ═══ Right Panel (Form area) ═══ */}
      <main className="flex-1 overflow-y-auto relative flex flex-col">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/8 via-slate-950 to-teal-900/8 pointer-events-none"></div>

        {/* Content wrapper — vertically centered */}
        <div className="flex-1 flex flex-col justify-center relative z-10 px-6 md:px-12 lg:px-16 xl:px-20 py-8">
          
          <div className="w-full max-w-lg mx-auto">
            {/* Judul Halaman */}
            <div className="mb-10 text-center">
              <h1 className="text-4xl font-extrabold tracking-tight text-white mb-3">
                Login Akun
              </h1>
              <p className="text-slate-400 text-sm">
                Silakan login menggunakan email yang terdaftar.
              </p>
            </div>

            {/* Glassmorphism Login Card */}
            <div className="bg-slate-900/80 backdrop-blur-md border border-slate-700/50 p-8 md:p-10 rounded-2xl shadow-2xl transition-all hover:border-slate-600/60">
              
              {error && (
                <div className="mb-6 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm text-center">
                  {error}
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-6">
                {/* Input Email */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2 ml-1">Email</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                      <FontAwesomeIcon icon={faUser} className="text-slate-500" />
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-slate-800/60 border border-slate-600/80 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 focus:outline-none transition-all text-white placeholder-slate-500 hover:bg-slate-800/80"
                      placeholder="nama@email.com"
                    />
                  </div>
                </div>

                {/* Input Password */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2 ml-1">Kata Sandi</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                      <FontAwesomeIcon icon={faLock} className="text-slate-500" />
                    </div>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-slate-800/60 border border-slate-600/80 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 focus:outline-none transition-all text-white placeholder-slate-500 hover:bg-slate-800/80"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                {/* Lupa Password */}
                <div className="flex justify-end">
                  <button type="button" className="text-sm text-emerald-400 hover:text-emerald-300 font-medium transition-colors">
                    Lupa Password?
                  </button>
                </div>

                {/* Tombol Login */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-white py-3.5 rounded-xl font-bold tracking-wide transition-all shadow-lg hover:shadow-emerald-500/25 disabled:opacity-50 disabled:cursor-not-allowed text-base"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
                      Memproses...
                    </span>
                  ) : (
                    'Login'
                  )}
                </button>
              </form>

              {/* Footer */}
              <p className="mt-8 text-center text-slate-400 text-sm">
                Belum punya akun?{' '}
                <Link to="/register" className="text-emerald-400 hover:text-emerald-300 transition-colors font-semibold">
                  Daftar di sini
                </Link>
              </p>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
