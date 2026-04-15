import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import {
  Leaf, ArrowRight, ArrowLeft, TrendingUp, TrendingDown,
  User, Ruler, Weight, Gauge, Calendar, Check, Target,
  Sparkles, ShieldCheck, BarChart3
} from 'lucide-react';

const TOTAL_STEPS = 7;

const STEP_META = [
  { num: 1, label: 'Akun' },
  { num: 2, label: 'Tujuan' },
  { num: 3, label: 'Gender' },
  { num: 4, label: 'Usia' },
  { num: 5, label: 'Tinggi' },
  { num: 6, label: 'Berat' },
  { num: 7, label: 'Kecepatan' },
];

const LEFT_PANEL_DATA = {
  1: {
    icon: ShieldCheck,
    title: 'Keamanan Data Terjamin',
    desc: 'Data pribadi Anda dienkripsi dan dilindungi dengan standar keamanan terbaik.',
    features: ['Enkripsi password BCrypt', 'Token JWT 24 jam', 'Perlindungan data pribadi'],
  },
  2: {
    icon: Target,
    title: 'Tentukan Tujuan Anda',
    desc: 'Setiap orang memiliki tujuan yang berbeda. Kami akan membuat rencana yang tepat untuk Anda.',
    features: ['Rencana kalori personal', 'Rekomendasi nutrisi harian', 'Tracking progres mingguan'],
  },
  3: {
    icon: BarChart3,
    title: 'Perhitungan Akurat',
    desc: 'Jenis kelamin mempengaruhi perhitungan BMR Anda secara signifikan.',
    features: ['Rumus Mifflin-St Jeor', 'BMR yang akurat', 'TDEE yang presisi'],
  },
  4: {
    icon: Calendar,
    title: 'Faktor Usia',
    desc: 'Metabolisme berubah seiring bertambahnya usia. Kami memperhitungkan hal ini.',
    features: ['Metabolisme berdasarkan usia', 'Kebutuhan nutrisi spesifik', 'Rekomendasi yang tepat'],
  },
  5: {
    icon: Ruler,
    title: 'Body Mass Index',
    desc: 'Tinggi badan adalah komponen penting dalam menghitung BMI dan kebutuhan kalori Anda.',
    features: ['Kalkulasi BMI otomatis', 'Kategori berat badan', 'Target yang realistis'],
  },
  6: {
    icon: Weight,
    title: 'Progres Berat Badan',
    desc: 'Pantau perjalanan berat badan Anda dari titik awal menuju target impian.',
    features: ['Grafik progres visual', 'Milestone mingguan', 'Prediksi pencapaian'],
  },
  7: {
    icon: Sparkles,
    title: 'Hampir Selesai!',
    desc: 'Langkah terakhir untuk menentukan kecepatan yang paling sesuai dengan gaya hidup Anda.',
    features: ['Kecepatan yang aman', 'Sustainable & sehat', 'Hasil jangka panjang'],
  },
};

export default function Register() {
  const [step, setStep] = useState(1);
  const [animDir, setAnimDir] = useState('next');
  const [formData, setFormData] = useState({
    nama: '',
    email: '',
    password: '',
    konfirmasi_password: '',
    tujuan: '',
    gender: '',
    usia: '',
    tinggi_badan: '',
    berat_badan: '',
    target_berat: '',
    kecepatan: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // ─── Handlers ──────────────────────────────────────────
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const selectOption = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  // ─── Validation ────────────────────────────────────────
  const validateStep = () => {
    setError('');
    switch (step) {
      case 1:
        if (!formData.nama.trim()) { setError('Nama lengkap wajib diisi'); return false; }
        if (!formData.email.trim()) { setError('Email wajib diisi'); return false; }
        if (!formData.password) { setError('Password wajib diisi'); return false; }
        if (formData.password.length < 6) { setError('Password minimal 6 karakter'); return false; }
        if (formData.password !== formData.konfirmasi_password) { setError('Konfirmasi password tidak cocok'); return false; }
        return true;
      case 2:
        if (!formData.tujuan) { setError('Pilih tujuan Anda'); return false; }
        return true;
      case 3:
        if (!formData.gender) { setError('Pilih jenis kelamin Anda'); return false; }
        return true;
      case 4:
        if (!formData.usia || parseInt(formData.usia) < 10 || parseInt(formData.usia) > 120) { setError('Masukkan usia yang valid (10–120 tahun)'); return false; }
        return true;
      case 5:
        if (!formData.tinggi_badan || parseFloat(formData.tinggi_badan) < 50 || parseFloat(formData.tinggi_badan) > 300) { setError('Masukkan tinggi badan yang valid (50–300 cm)'); return false; }
        return true;
      case 6:
        if (!formData.berat_badan || parseFloat(formData.berat_badan) <= 0) { setError('Masukkan berat badan saat ini'); return false; }
        if (!formData.target_berat || parseFloat(formData.target_berat) <= 0) { setError('Masukkan target berat badan'); return false; }
        return true;
      case 7:
        if (!formData.kecepatan) { setError('Pilih kecepatan Anda'); return false; }
        return true;
      default:
        return true;
    }
  };

  // ─── Navigation ────────────────────────────────────────
  const nextStep = () => {
    if (validateStep()) {
      setAnimDir('next');
      setStep((s) => Math.min(s + 1, TOTAL_STEPS));
    }
  };

  const prevStep = () => {
    setAnimDir('prev');
    setError('');
    setStep((s) => Math.max(s - 1, 1));
  };

  // ─── Submit ────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!validateStep()) return;
    setLoading(true);
    setError('');
    try {
      const { konfirmasi_password, ...submitData } = formData;
      await axios.post('http://localhost:5000/api/register', submitData);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Terjadi kesalahan saat registrasi.');
    } finally {
      setLoading(false);
    }
  };

  // ─── Shared CSS ────────────────────────────────────────
  const inputClass =
    'w-full px-4 py-3.5 rounded-xl bg-slate-800/60 border border-slate-600/80 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 focus:outline-none transition-all text-white placeholder-slate-500 text-base';

  // ─── Progress Bar ──────────────────────────────────────
  const renderProgressBar = useMemo(() => (
    <div className="flex items-center justify-center mb-10">
      {STEP_META.map((s, i) => (
        <div key={s.num} className="flex items-center">
          <div className="flex flex-col items-center">
            <div
              className={`w-10 h-10 lg:w-11 lg:h-11 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-500 ${
                step > s.num
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                  : step === s.num
                  ? 'bg-emerald-500/20 border-2 border-emerald-400 text-emerald-400 shadow-lg shadow-emerald-500/20 option-card-glow'
                  : 'bg-slate-800/60 border border-slate-600/50 text-slate-500'
              }`}
            >
              {step > s.num ? <Check className="w-4 h-4" /> : s.num}
            </div>
            <span
              className={`text-[10px] mt-1.5 font-medium hidden md:block transition-colors duration-300 ${
                step >= s.num ? 'text-emerald-400' : 'text-slate-600'
              }`}
            >
              {s.label}
            </span>
          </div>
          {i < STEP_META.length - 1 && (
            <div
              className={`h-[2px] w-6 sm:w-8 md:w-12 lg:w-16 mx-1 md:mx-1.5 transition-all duration-500 rounded-full ${
                step > s.num ? 'bg-emerald-500' : 'bg-slate-700/60'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  ), [step]);

  // ─── Option Card Component ─────────────────────────────
  const OptionCard = ({ field, value, icon: Icon, title, subtitle, selected }) => (
    <button
      type="button"
      onClick={() => selectOption(field, value)}
      className={`group relative p-6 lg:p-7 rounded-2xl border-2 transition-all duration-300 text-left w-full ${
        selected
          ? 'border-emerald-400 bg-emerald-500/10 shadow-xl shadow-emerald-500/10 option-card-glow'
          : 'border-slate-700/60 bg-slate-800/40 hover:border-slate-500/80 hover:bg-slate-800/60 hover:shadow-lg'
      }`}
    >
      {selected && (
        <div className="absolute top-3 right-3 bg-emerald-500 rounded-full p-1 shadow-md">
          <Check className="w-3.5 h-3.5 text-white" />
        </div>
      )}
      <div
        className={`p-3.5 rounded-xl w-fit mb-3 transition-colors duration-300 ${
          selected ? 'bg-emerald-500/20' : 'bg-slate-700/50 group-hover:bg-slate-700/80'
        }`}
      >
        <Icon
          className={`w-7 h-7 transition-colors duration-300 ${
            selected ? 'text-emerald-400' : 'text-slate-400 group-hover:text-slate-300'
          }`}
        />
      </div>
      <h3 className="font-bold text-lg mb-0.5">{title}</h3>
      {subtitle && <p className="text-sm text-slate-400">{subtitle}</p>}
    </button>
  );

  // ─── Step Header Component ─────────────────────────────
  const StepHeader = ({ icon: Icon, title, description }) => (
    <div className="text-center mb-8 lg:mb-10">
      <div className="inline-flex bg-emerald-500/15 p-4 rounded-2xl mb-4 border border-emerald-500/20 shadow-lg shadow-emerald-500/10">
        <Icon className="w-8 h-8 text-emerald-400" />
      </div>
      <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight">{title}</h2>
      <p className="text-slate-400 mt-2 text-sm lg:text-base max-w-lg mx-auto leading-relaxed">{description}</p>
    </div>
  );

  // ─── Left Panel ────────────────────────────────────────
  const renderLeftPanel = React.useMemo(() => {
    const data = LEFT_PANEL_DATA[step];
    const PanelIcon = data.icon;
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

          {/* Step info card */}
          <div key={step} className={`w-full ${animDir === 'next' ? 'step-slide-right' : 'step-slide-left'}`}>
            <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/40 rounded-2xl p-8 mb-8">
              <div className="bg-emerald-500/15 p-4 rounded-2xl w-fit mx-auto mb-5 border border-emerald-500/20">
                <PanelIcon className="w-10 h-10 text-emerald-400" />
              </div>
              <h3 className="text-xl font-bold mb-3">{data.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{data.desc}</p>
            </div>

            {/* Feature list */}
            <div className="space-y-3">
              {data.features.map((feature, i) => (
                <div key={i} className="flex items-center gap-3 text-sm">
                  <div className="bg-emerald-500/20 p-1 rounded-full flex-shrink-0">
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  <span className="text-slate-300">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Step counter */}
          <div className="mt-10 text-slate-500 text-sm">
            Langkah <span className="text-emerald-400 font-bold">{step}</span> dari <span className="font-bold">{TOTAL_STEPS}</span>
          </div>
        </div>
      </div>
    );
  }, [step, animDir]);

  // ─── Render Steps ──────────────────────────────────────
  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div>
            <StepHeader
              icon={Leaf}
              title="Buat Akun Anda"
              description="Lengkapi informasi akun untuk memulai perjalanan nutrisi Anda."
            />
            <div className="space-y-4 max-w-lg mx-auto">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5 ml-1">Nama Lengkap</label>
                <input type="text" name="nama" value={formData.nama} onChange={handleChange}
                  className={inputClass} placeholder="Masukkan nama lengkap" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5 ml-1">Email</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange}
                  className={inputClass} placeholder="nama@email.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5 ml-1">Password</label>
                <input type="password" name="password" value={formData.password} onChange={handleChange}
                  className={inputClass} placeholder="Minimal 6 karakter" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5 ml-1">Konfirmasi Password</label>
                <input type="password" name="konfirmasi_password" value={formData.konfirmasi_password} onChange={handleChange}
                  className={inputClass} placeholder="Ketik ulang password" />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div>
            <StepHeader
              icon={Target}
              title="Apa tujuan utama Anda?"
              description="Pilihan ini akan membantu kami menyesuaikan target kalori harian Anda."
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto">
              <OptionCard field="tujuan" value="menaikkan berat badan"
                icon={TrendingUp} title="Menaikkan" subtitle="Berat Badan"
                selected={formData.tujuan === 'menaikkan berat badan'} />
              <OptionCard field="tujuan" value="menurunkan berat badan"
                icon={TrendingDown} title="Menurunkan" subtitle="Berat Badan"
                selected={formData.tujuan === 'menurunkan berat badan'} />
            </div>
          </div>
        );

      case 3:
        return (
          <div>
            <StepHeader
              icon={User}
              title="Apa jenis kelamin Anda?"
              description="Informasi ini penting untuk perhitungan BMR (Basal Metabolic Rate)."
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto">
              <OptionCard field="gender" value="laki-laki"
                icon={User} title="Laki-laki" subtitle=""
                selected={formData.gender === 'laki-laki'} />
              <OptionCard field="gender" value="perempuan"
                icon={User} title="Perempuan" subtitle=""
                selected={formData.gender === 'perempuan'} />
            </div>
          </div>
        );

      case 4:
        return (
          <div>
            <StepHeader
              icon={Calendar}
              title="Berapa usia Anda?"
              description="Usia Anda digunakan untuk kalkulasi kebutuhan kalori harian."
            />
            <div className="max-w-sm mx-auto">
              <label className="block text-sm font-medium text-slate-300 mb-2 ml-1">Usia (tahun)</label>
              <div className="relative">
                <input type="number" name="usia" value={formData.usia} onChange={handleChange}
                  min="10" max="120"
                  className={`${inputClass} text-center text-4xl font-bold py-6`}
                  placeholder="25" />
                <span className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-500 text-base font-medium">tahun</span>
              </div>
              <p className="text-slate-500 text-xs text-center mt-3">Rentang valid: 10 – 120 tahun</p>
            </div>
          </div>
        );

      case 5:
        return (
          <div>
            <StepHeader
              icon={Ruler}
              title="Berapa tinggi badan Anda?"
              description="Informasi ini digunakan untuk menghitung BMI Anda."
            />
            <div className="max-w-sm mx-auto">
              <label className="block text-sm font-medium text-slate-300 mb-2 ml-1">Tinggi Badan</label>
              <div className="relative">
                <input type="number" name="tinggi_badan" value={formData.tinggi_badan} onChange={handleChange}
                  step="0.1" min="50" max="300"
                  className={`${inputClass} text-center text-4xl font-bold py-6`}
                  placeholder="170" />
                <span className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-500 text-base font-medium">cm</span>
              </div>
              <p className="text-slate-500 text-xs text-center mt-3">Contoh: 170.5</p>
            </div>
          </div>
        );

      case 6:
        return (
          <div>
            <StepHeader
              icon={Weight}
              title="Berapa berat badan Anda?"
              description="Masukkan berat badan awal dan target yang ingin Anda capai."
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-lg mx-auto">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2 ml-1">Berat Badan Saat Ini</label>
                <div className="relative">
                  <input type="number" name="berat_badan" value={formData.berat_badan} onChange={handleChange}
                    step="0.1" min="1"
                    className={`${inputClass} text-center text-3xl font-bold py-5`}
                    placeholder="65" />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm font-medium">kg</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2 ml-1">Target Berat Badan</label>
                <div className="relative">
                  <input type="number" name="target_berat" value={formData.target_berat} onChange={handleChange}
                    step="0.1" min="1"
                    className={`${inputClass} text-center text-3xl font-bold py-5`}
                    placeholder="60" />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm font-medium">kg</span>
                </div>
              </div>
            </div>
          </div>
        );

      case 7:
        return (
          <div>
            <StepHeader
              icon={Gauge}
              title="Pilih kecepatan Anda"
              description="Ini adalah langkah terakhir. Pilihan ini akan menentukan target kalori harian Anda."
            />
            <div className="space-y-3 max-w-lg mx-auto">
              {[
                { value: '0.25', label: 'Perlahan', desc: 'Target 0.25 kg / minggu' },
                { value: '0.5', label: 'Normal', desc: 'Target 0.5 kg / minggu' },
                { value: '1', label: 'Cepat', desc: 'Target 1 kg / minggu' },
              ].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => selectOption('kecepatan', opt.value)}
                  className={`w-full flex items-center gap-4 p-5 lg:p-6 rounded-2xl border-2 transition-all duration-300 text-left ${
                    formData.kecepatan === opt.value
                      ? 'border-emerald-400 bg-emerald-500/10 shadow-xl shadow-emerald-500/10 option-card-glow'
                      : 'border-slate-700/60 bg-slate-800/40 hover:border-slate-500/80 hover:bg-slate-800/60'
                  }`}
                >
                  <div className={`p-3 rounded-xl transition-colors ${formData.kecepatan === opt.value ? 'bg-emerald-500/20' : 'bg-slate-700/50'}`}>
                    <Gauge className={`w-6 h-6 ${formData.kecepatan === opt.value ? 'text-emerald-400' : 'text-slate-400'}`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-base">{opt.label}</h3>
                    <p className="text-sm text-slate-400">{opt.desc}</p>
                  </div>
                  {formData.kecepatan === opt.value && (
                    <div className="bg-emerald-500 rounded-full p-1 shadow-md">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // ─── Main Render ───────────────────────────────────────
  return (
    <div className="flex h-screen overflow-hidden bg-slate-950 text-white font-sans">

      {/* ═══ Left Panel (Desktop only) ═══ */}
      {renderLeftPanel}

      {/* ═══ Right Panel (Form area) ═══ */}
      <main className="flex-1 overflow-y-auto relative flex flex-col">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/8 via-slate-950 to-teal-900/8 pointer-events-none"></div>

        {/* Content wrapper — vertically centered */}
        <div className="flex-1 flex flex-col justify-center relative z-10 px-6 md:px-12 lg:px-16 xl:px-20 py-8">
          {/* Progress bar */}
          {renderProgressBar}

          {/* Error */}
          {error && (
            <div className="mb-5 max-w-lg mx-auto w-full p-3 bg-red-500/15 border border-red-500/40 rounded-xl text-red-300 text-sm text-center step-fade-up">
              {error}
            </div>
          )}

          {/* Step Content with animation */}
          <div key={step} className={animDir === 'next' ? 'step-slide-right' : 'step-slide-left'}>
            {renderStep()}
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-10 max-w-lg mx-auto w-full">
            {step > 1 ? (
              <button
                type="button"
                onClick={prevStep}
                className="flex items-center gap-2 px-5 py-3 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/60 transition-all border border-slate-700/50 hover:border-slate-600 text-sm"
              >
                <ArrowLeft className="w-4 h-4" />
                Kembali
              </button>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-2 px-5 py-3 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/60 transition-all border border-slate-700/50 hover:border-slate-600 text-sm"
              >
                <ArrowLeft className="w-4 h-4" />
                Login
              </Link>
            )}

            {step < TOTAL_STEPS ? (
              <button
                type="button"
                onClick={nextStep}
                className="flex items-center gap-2 px-7 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 active:from-emerald-600 active:to-teal-700 text-white font-semibold transition-all shadow-lg hover:shadow-emerald-500/25 text-sm"
              >
                Lanjutkan
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="flex items-center gap-2 px-7 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 active:from-emerald-600 active:to-teal-700 text-white font-semibold transition-all shadow-lg hover:shadow-emerald-500/25 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
                    Memproses...
                  </span>
                ) : (
                  <>
                    Selesai
                    <Check className="w-4 h-4" />
                  </>
                )}
              </button>
            )}
          </div>

          {/* Footer link */}
          <p className="mt-6 text-center text-slate-500 text-xs">
            Sudah punya akun?{' '}
            <Link to="/login" className="text-emerald-400 hover:text-emerald-300 transition-colors font-semibold">
              Masuk di sini
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
