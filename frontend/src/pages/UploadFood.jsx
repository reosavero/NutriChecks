import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import ChatBot from '../components/ChatBot';

export default function UploadFood() {
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [error, setError] = useState(null);
  const [scanProgress, setScanProgress] = useState(0);
  
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (!token || !storedUser) {
      navigate('/login');
      return;
    }
    setUser(JSON.parse(storedUser));
  }, [navigate]);

  useEffect(() => {
    let interval;
    if (isLoading) {
      setScanProgress(0);
      interval = setInterval(() => {
        setScanProgress(prev => (prev < 95 ? prev + Math.random() * 10 : prev));
      }, 100);
    } else {
      setScanProgress(0);
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setError(null);
      setAnalysisResult(null);
    }
  };

  const handleUpload = async () => {
    if (!imageFile) return;
    setIsLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('image', imageFile);

    try {
      const response = await axios.post('http://localhost:5001/api/analyze-food', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setAnalysisResult(response.data.data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Gagal terhubung ke server AI saat ini.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background text-on-background font-body antialiased">
      <Sidebar user={user} />

      <main className="flex-1 lg:ml-72 flex flex-col min-h-screen overflow-y-auto pb-24 lg:pb-0">
        <Header user={user} />

        <div className="flex-1 p-6 md:p-8 max-w-screen-2xl mx-auto w-full space-y-8">
          {/* Page Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h2 className="text-sm font-bold text-primary tracking-widest uppercase mb-2">Visual Engine</h2>
              <h1 className="text-display-md text-on-surface font-headline leading-tight">AI Molecular <br/><span className="text-secondary">Signature Scan</span></h1>
            </div>
            {analysisResult && (
              <button 
                onClick={() => { setAnalysisResult(null); setPreviewUrl(null); setImageFile(null); }}
                className="bg-surface-container-low hover:bg-surface-container text-on-surface px-6 py-3 rounded-full font-bold text-sm transition-all border border-outline-variant/10 flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">refresh</span>
                New Scan
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Analysis Canvas (Left) */}
            <div className="lg:col-span-7 bg-surface-container-lowest rounded-[2rem] p-4 relative overflow-hidden flex flex-col items-center justify-center min-h-[400px] border border-outline-variant/15 shadow-sm group">
              {previewUrl ? (
                <div className="relative w-full h-full rounded-[1.5rem] overflow-hidden shadow-2xl">
                  <img src={previewUrl} alt="Food scan" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  
                  {/* Scanning Overlays */}
                  {isLoading && (
                    <>
                      <div className="absolute inset-0 bg-primary/10 backdrop-blur-[2px]"></div>
                      <div 
                        className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent shadow-[0_0_15px_#006c51]"
                        style={{ top: `${scanProgress}%`, transition: 'top 0.1s linear' }}
                      ></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="bg-surface/90 backdrop-blur-md px-6 py-3 rounded-full border border-primary/20 shadow-xl flex items-center gap-3">
                            <div className="w-4 h-4 border-2 border-primary border-t-transparent animate-spin rounded-full"></div>
                            <span className="text-sm font-bold text-primary uppercase tracking-widest">Analyzing Micro-Structure... {Math.round(scanProgress)}%</span>
                        </div>
                      </div>
                    </>
                  )}

                  {!isLoading && !analysisResult && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <button onClick={handleUpload} className="bg-primary text-on-primary px-8 py-4 rounded-full font-bold text-lg shadow-2xl transform transition-transform active:scale-95">
                        Start Deep Scan
                      </button>
                    </div>
                  )}

                  {analysisResult && (
                    <div className="absolute top-8 left-8 flex flex-col gap-3">
                      <div className="bg-primary/90 backdrop-blur-md px-4 py-2 rounded-full border border-primary-container/30 text-white text-xs font-bold flex items-center gap-2 shadow-lg animate-in slide-in-from-left duration-500">
                        <span className="material-symbols-outlined text-[16px] fill">check_circle</span>
                        SIG: {analysisResult.nama_makanan.toUpperCase()}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer border-2 border-dashed border-outline-variant/30 rounded-[1.5rem] hover:bg-surface-container-low transition-colors py-20">
                  <div className="w-20 h-20 rounded-full bg-surface-container flex items-center justify-center text-primary mb-6 transition-transform group-hover:scale-110">
                    <span className="material-symbols-outlined text-4xl">add_a_photo</span>
                  </div>
                  <h3 className="text-xl font-bold text-on-surface mb-2">Capture Material</h3>
                  <p className="text-sm text-secondary px-10 text-center">Place your meal under the visual engine focus. Supports JPEG, PNG or Device Camera.</p>
                  <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                </label>
              )}
            </div>

            {/* Results Insights (Right) */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              {!analysisResult ? (
                <div className="bg-surface-container-low rounded-[2rem] p-10 flex flex-col items-center justify-center text-center space-y-6 flex-1 min-h-[300px] border border-outline-variant/5">
                   <div className="w-16 h-px bg-outline-variant/30"></div>
                   <p className="text-secondary text-sm leading-relaxed max-w-[280px]">The AI assistant will break down molecular structure to identify nutrients once the scan is initiated.</p>
                   {error && <p className="text-error text-xs font-bold bg-error/10 px-4 py-2 rounded-full border border-error/20">{error}</p>}
                   {!previewUrl && (
                      <div className="flex gap-2">
                         {[1,2,3].map(i => <div key={i} className="w-1.5 h-1.5 rounded-full bg-outline-variant/30 animate-pulse" style={{animationDelay: `${i*200}ms`}}></div>)}
                      </div>
                   )}
                </div>
              ) : (
                <div className="space-y-6 animate-in fade-in slide-in-from-right duration-700">
                  {/* Result Header Card */}
                  <div className="bg-surface-container-lowest rounded-[2rem] p-8 border border-outline-variant/15 shadow-sm space-y-4">
                    <div className="flex justify-between items-start">
                        <div>
                            <span className="text-[10px] font-bold text-secondary uppercase tracking-[0.2em] mb-1 block">Detected Resource</span>
                            <h3 className="text-3xl font-black text-on-surface tracking-tighter capitalize">{analysisResult.nama_makanan}</h3>
                        </div>
                        <div className="bg-primary/10 px-3 py-1.5 rounded-xl border border-primary/20 flex items-center gap-1.5">
                            <span className="text-[10px] font-black text-primary uppercase tracking-widest">{Math.round(analysisResult.confidence_score * 100)}% Match</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 text-secondary">
                        <span className="material-symbols-outlined text-[18px]">straighten</span>
                        <span className="text-xs font-bold uppercase tracking-widest">{analysisResult.porsi}</span>
                    </div>
                    
                    <div className="flex items-end gap-3 bg-surface-container-low p-6 rounded-2xl relative overflow-hidden group">
                      <div className="absolute right-0 top-0 p-4 opacity-10">
                        <span className="material-symbols-outlined text-6xl">energy_savings_leaf</span>
                      </div>
                      <span className="text-5xl font-black text-primary tracking-tighter leading-none">{analysisResult.kalori}</span>
                      <span className="text-sm font-bold text-secondary mb-1">kcal total</span>
                    </div>

                    <p className="text-xs font-medium text-secondary leading-relaxed bg-surface-container-low/50 p-4 rounded-xl border border-outline-variant/10">
                        <span className="text-primary font-black uppercase tracking-widest block mb-1 text-[9px]">AI Analysis Summary</span>
                        {analysisResult.analisis_singkat}
                    </p>
                  </div>

                  {/* Macro Breakdown Bento */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-primary/5 rounded-3xl p-5 border border-primary/10 flex flex-col items-center text-center">
                      <div className="w-3 h-3 rounded-full bg-primary mb-3"></div>
                      <span className="text-[10px] font-bold text-primary uppercase tracking-wider mb-1">Protein</span>
                      <span className="text-2xl font-black text-on-surface">{analysisResult.protein}g</span>
                    </div>
                    <div className="bg-tertiary/5 rounded-3xl p-5 border border-tertiary/10 flex flex-col items-center text-center">
                      <div className="w-3 h-3 rounded-full bg-tertiary mb-3"></div>
                      <span className="text-[10px] font-bold text-tertiary uppercase tracking-wider mb-1">Fats</span>
                      <span className="text-2xl font-black text-on-surface">{analysisResult.lemak}g</span>
                    </div>
                    <div className="bg-primary-fixed-dim/10 rounded-3xl p-5 border border-primary-fixed-dim/20 flex flex-col items-center text-center">
                      <div className="w-3 h-3 rounded-full bg-primary-fixed-dim mb-3"></div>
                      <span className="text-[10px] font-bold text-on-primary-fixed-variant uppercase tracking-wider mb-1">Carbs</span>
                      <span className="text-2xl font-black text-on-surface">{analysisResult.karbohidrat}g</span>
                    </div>
                  </div>

                  {/* CTA Action */}
                  <button 
                    onClick={() => navigate('/dashboard')}
                    className="w-full bg-on-background text-surface-container-lowest py-5 rounded-full font-black uppercase tracking-widest text-xs hover:bg-primary transition-all flex items-center justify-center gap-3 shadow-xl active:scale-[0.98]"
                  >
                    <span>Log To Bio-Metric Hub</span>
                    <span className="material-symbols-outlined">arrow_forward</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* AI Consultant Section */}
          <div className="space-y-8 pt-12 border-t border-outline-variant/15 animate-in fade-in duration-1000">
            <div className="flex flex-col items-center text-center space-y-3">
               <div className="px-5 py-2 bg-primary/10 rounded-full border border-primary/20 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-sm fill">auto_awesome</span>
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Intelligent Consultation</span>
               </div>
               <h2 className="text-display-sm font-headline font-black text-on-surface">Ask Your <span className="text-secondary">Nutritional Expert</span></h2>
               <p className="text-sm text-secondary max-w-xl">Deep-dive into your dietary habits or get specific recommendations based on your unique bio-profile.</p>
            </div>
            
            <div className="max-w-4xl mx-auto w-full">
               <ChatBot scanResult={analysisResult} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
