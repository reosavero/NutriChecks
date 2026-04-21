import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

export default function Register() {
  const [step, setStep] = useState(1);
  const totalSteps = 4;
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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateStep = () => {
    setError('');
    if (step === 1) {
      if (!formData.nama || !formData.email || !formData.password) {
        setError('Please complete all identification fields.');
        return false;
      }
      if (formData.password !== formData.konfirmasi_password) {
        setError('Passwords do not match.');
        return false;
      }
    } else if (step === 2) {
      if (!formData.tinggi_badan || !formData.berat_badan || !formData.target_berat) {
        setError('Vital metrics are required to calibrate your profile.');
        return false;
      }
    } else if (step === 3) {
      if (!formData.tujuan || !formData.kecepatan) {
        setError('Please select your objective and velocity.');
        return false;
      }
    } else if (step === 4) {
      if (!formData.gender || !formData.usia) {
        setError('Biological context is required for BMR calculation.');
        return false;
      }
    }
    return true;
  };

  const nextStep = () => {
    if (validateStep()) setStep(s => s + 1);
  };

  const prevStep = () => setStep(s => s - 1);

  const handleSubmit = async () => {
    if (!validateStep()) return;
    setLoading(true);
    try {
      const { konfirmasi_password, ...submitData } = formData;
      await axios.post('http://localhost:5001/api/register', submitData);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Registrasi gagal. Cek kembali data Anda.');
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

          {/* Progress Indicator */}
          <div className="flex gap-2 mb-10">
            {[1, 2, 3, 4].map(num => (
              <div key={num} className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${step >= num ? 'bg-primary' : 'bg-surface-container-highest'}`}></div>
            ))}
          </div>

          {error && (
            <div className="mb-6 p-4 bg-error-container text-on-error-container rounded-xl text-xs font-bold border border-error/10 animate-pulse">
              {error}
            </div>
          )}

          {/* Form Step 1: Identification */}
          {step === 1 && (
            <div className="animate-in fade-in slide-in-from-right duration-500">
              <div className="mb-8 text-center text-on-surface">
                <h2 className="text-3xl font-extrabold tracking-tight mb-2">Initialize Profile</h2>
                <p className="text-on-surface-variant text-sm">Secure your account to begin your journey.</p>
              </div>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-on-surface uppercase tracking-wider ml-1">Nama Lengkap</label>
                  <input name="nama" value={formData.nama} onChange={handleChange} className="w-full bg-surface-container-low border-none rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-primary/30 transition-all font-medium" placeholder="E.g. Reo Savero" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-on-surface uppercase tracking-wider ml-1">Email</label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full bg-surface-container-low border-none rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-primary/30 transition-all font-medium" placeholder="reo@example.com" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-on-surface uppercase tracking-wider ml-1">Password</label>
                  <input type="password" name="password" value={formData.password} onChange={handleChange} className="w-full bg-surface-container-low border-none rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-primary/30 transition-all font-medium" placeholder="••••••••" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-on-surface uppercase tracking-wider ml-1">Confirm Password</label>
                  <input type="password" name="konfirmasi_password" value={formData.konfirmasi_password} onChange={handleChange} className="w-full bg-surface-container-low border-none rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-primary/30 transition-all font-medium" placeholder="••••••••" />
                </div>
              </div>
            </div>
          )}

          {/* Form Step 2: Vital Baseline */}
          {step === 2 && (
            <div className="animate-in fade-in slide-in-from-right duration-500">
              <div className="mb-8 text-center text-on-surface">
                <h2 className="text-3xl font-extrabold tracking-tight mb-2">Vital Baseline</h2>
                <p className="text-on-surface-variant text-sm">Physical metrics to calibrate your insights.</p>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-on-surface uppercase tracking-wider ml-1">Height (cm)</label>
                    <input type="number" name="tinggi_badan" value={formData.tinggi_badan} onChange={handleChange} className="w-full bg-surface-container-low border-none rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-primary/30 transition-all font-bold text-xl text-center" placeholder="175" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-on-surface uppercase tracking-wider ml-1">Weight (kg)</label>
                    <input type="number" name="berat_badan" value={formData.berat_badan} onChange={handleChange} className="w-full bg-surface-container-low border-none rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-primary/30 transition-all font-bold text-xl text-center" placeholder="70" />
                  </div>
                </div>
                <div className="p-6 bg-surface-container rounded-2xl border border-outline-variant/10">
                  <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-2">Target Ideal Weight (kg)</label>
                  <input type="number" name="target_berat" value={formData.target_berat} onChange={handleChange} className="w-full bg-surface-container-lowest border-none rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-tertiary/30 transition-all font-bold text-2xl text-center text-tertiary shadow-sm" placeholder="65" />
                  <p className="text-[10px] text-on-surface-variant mt-2 text-center">This metric shapes your daily caloric velocity.</p>
                </div>
              </div>
            </div>
          )}

          {/* Form Step 3: Intensity & Goal */}
          {step === 3 && (
            <div className="animate-in fade-in slide-in-from-right duration-500">
              <div className="mb-8 text-center text-on-surface">
                <h2 className="text-3xl font-extrabold tracking-tight mb-2">Strategic Goal</h2>
                <p className="text-on-surface-variant text-sm">Define your objective and tempo.</p>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <button onClick={() => setFormData({...formData, tujuan: 'menaikkan berat badan'})} className={`p-4 rounded-xl border-2 transition-all text-center ${formData.tujuan === 'menaikkan berat badan' ? 'border-primary bg-primary/5 text-primary' : 'border-outline-variant/20 text-on-surface-variant'}`}>
                    <span className="material-symbols-outlined block mb-1">trending_up</span>
                    <span className="text-xs font-bold">Gain Weight</span>
                  </button>
                  <button onClick={() => setFormData({...formData, tujuan: 'menurunkan berat badan'})} className={`p-4 rounded-xl border-2 transition-all text-center ${formData.tujuan === 'menurunkan berat badan' ? 'border-primary bg-primary/5 text-primary' : 'border-outline-variant/20 text-on-surface-variant'}`}>
                    <span className="material-symbols-outlined block mb-1">trending_down</span>
                    <span className="text-xs font-bold">Lose Weight</span>
                  </button>
                </div>
                <div className="space-y-1.5 pt-2">
                  <label className="text-xs font-bold text-on-surface uppercase tracking-wider ml-1">Velocity (kg / week)</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['0.25', '0.5', '1.0'].map(val => (
                      <button key={val} onClick={() => setFormData({...formData, kecepatan: val})} className={`py-3 rounded-lg font-bold text-sm transition-all ${formData.kecepatan === val ? 'bg-on-background text-surface' : 'bg-surface-container text-on-surface-variant'}`}>
                         {val} kg
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Form Step 4: Biological Context */}
          {step === 4 && (
            <div className="animate-in fade-in slide-in-from-right duration-500">
              <div className="mb-8 text-center text-on-surface">
                <h2 className="text-3xl font-extrabold tracking-tight mb-2">Biological Context</h2>
                <p className="text-on-surface-variant text-sm">Final calibration for BMR accuracy.</p>
              </div>
              <div className="space-y-6">
                 <div className="space-y-1.5">
                    <label className="text-xs font-bold text-on-surface uppercase tracking-wider ml-1">Gender</label>
                    <div className="grid grid-cols-2 gap-4">
                      <button onClick={() => setFormData({...formData, gender: 'laki-laki'})} className={`p-4 rounded-xl border-2 transition-all flex items-center justify-center gap-2 ${formData.gender === 'laki-laki' ? 'border-primary bg-primary/5 text-primary' : 'border-outline-variant/20 text-on-surface-variant'}`}>
                        <span className="material-symbols-outlined fill">male</span>
                        <span className="text-sm font-bold">Male</span>
                      </button>
                      <button onClick={() => setFormData({...formData, gender: 'perempuan'})} className={`p-4 rounded-xl border-2 transition-all flex items-center justify-center gap-2 ${formData.gender === 'perempuan' ? 'border-primary bg-primary/5 text-primary' : 'border-outline-variant/20 text-on-surface-variant'}`}>
                        <span className="material-symbols-outlined fill">female</span>
                        <span className="text-sm font-bold">Female</span>
                      </button>
                    </div>
                 </div>
                 <div className="space-y-1.5">
                    <label className="text-xs font-bold text-on-surface uppercase tracking-wider ml-1">Chronological Age</label>
                    <input type="number" name="usia" value={formData.usia} onChange={handleChange} className="w-full bg-surface-container-low border-none rounded-xl px-4 py-4 focus:ring-2 focus:ring-primary/30 transition-all font-bold text-2xl text-center" placeholder="25" />
                 </div>
              </div>
            </div>
          )}

          {/* Navigation Actions */}
          <div className="mt-12 flex gap-4">
            {step > 1 && (
              <button onClick={prevStep} className="flex-1 py-4 px-6 border border-outline-variant/20 rounded-full font-bold text-on-surface-variant hover:bg-surface-container transition-all">
                Back
              </button>
            )}
            {step < totalSteps ? (
              <button onClick={nextStep} className="flex-[2] py-4 bg-primary text-on-primary rounded-full font-bold text-lg shadow-lg hover:shadow-primary/20 transition-all flex items-center justify-center gap-2">
                Continue <span className="material-symbols-outlined">arrow_forward</span>
              </button>
            ) : (
              <button onClick={handleSubmit} disabled={loading} className="flex-[2] py-4 bg-on-background text-surface rounded-full font-bold text-lg shadow-xl hover:opacity-90 transition-all flex items-center justify-center gap-2">
                {loading ? <span className="w-5 h-5 border-2 border-surface border-t-transparent animate-spin rounded-full"></span> : 'Finalize Profile'}
                {!loading && <span className="material-symbols-outlined">check_circle</span>}
              </button>
            )}
          </div>

          {!loading && step === 1 && (
             <p className="mt-8 text-center text-xs text-on-surface-variant font-medium">
                Already have an account? <Link to="/login" className="text-primary font-bold hover:underline">Sign In</Link>
             </p>
          )}
        </div>
        
        <div className="mt-8 text-center text-on-surface/60 text-xs font-medium px-8 leading-relaxed">
            By continuing, you agree to treat your body like the masterpiece it is. <br/>
            Vitality intelligence powered by NutriCheck AI.
        </div>
      </main>
    </div>
  );
}
