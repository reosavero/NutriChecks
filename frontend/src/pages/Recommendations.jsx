import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

export default function Recommendations() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Lunch');
  const [dummyRecommendations, setDummyRecommendations] = useState([]);
  
  const navigate = useNavigate();

  const tabs = ['Breakfast', 'Lunch', 'Dinner', 'Healthy Snacking'];

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
    const fetchRecommendations = () => {
      setIsLoading(true);
      setTimeout(() => {
        setDummyRecommendations([
          {
            id: 1,
            nama: 'Berry Fusion Oatmeal',
            waktu: 'Breakfast',
            kalori: 250,
            protein: 8,
            alasan_rekomendasi: 'Rich in slow-release fibers, perfect for metabolic stabilization without spiking insulin levels.',
            match_score: 98,
            badge: '98% Synergy',
            gambar: 'https://images.pexels.com/photos/1099680/pexels-photo-1099680.jpeg?auto=compress&cs=tinysrgb&w=800'
          },
          {
            id: 2,
            nama: 'Quinoa Chicken Bowl',
            waktu: 'Lunch',
            kalori: 410,
            protein: 38,
            alasan_rekomendasi: 'Optimized for your current protein deficit. This meal closes 45% of your daily amino acid requirement.',
            match_score: 95,
            badge: 'Perfect Match',
            gambar: 'https://images.pexels.com/photos/1640772/pexels-photo-1640772.jpeg?auto=compress&cs=tinysrgb&w=800'
          },
          {
            id: 3,
            nama: 'Miso Glazed Tofu Sup',
            waktu: 'Dinner',
            kalori: 120,
            protein: 10,
            alasan_rekomendasi: 'Low-latency caloric load for late-night satiety without impacting sleep-induced thermogenesis.',
            match_score: 92,
            badge: 'Low Load',
            gambar: 'https://images.pexels.com/photos/6608542/pexels-photo-6608542.jpeg?auto=compress&cs=tinysrgb&w=800'
          },
          {
            id: 4,
            nama: 'Raspberry Greek Yogurt',
            waktu: 'Healthy Snacking',
            kalori: 150,
            protein: 14,
            alasan_rekomendasi: 'High bio-availability protein snack to maintain nitrogen balance during intermittent fasts.',
            match_score: 99,
            badge: 'High Bio-Value',
            gambar: 'https://images.pexels.com/photos/4099234/pexels-photo-4099234.jpeg?auto=compress&cs=tinysrgb&w=800'
          }
        ]);
        setIsLoading(false);
      }, 700);
    };
    fetchRecommendations();
  }, [activeTab]);

  const filteredRecommendations = dummyRecommendations.filter(rec => rec.waktu === activeTab);

  if (!user) return null;

  return (
    <div className="flex h-screen overflow-hidden bg-background text-on-background font-body antialiased">
      <Sidebar activePage="rekomendasi" user={user} />

      <main className="flex-1 lg:ml-72 flex flex-col min-h-screen overflow-y-auto pb-24 lg:pb-0">
        <Header user={user} />

        <div className="flex-1 p-6 md:p-8 lg:p-12 max-w-screen-2xl mx-auto w-full space-y-12">
          {/* Header */}
          <div className="flex items-center gap-4 animate-in fade-in slide-in-from-left-4 duration-500">
            <div className="p-3 bg-primary/10 rounded-2xl border border-primary/20">
              <span className="material-symbols-outlined text-primary text-3xl fill">auto_awesome</span>
            </div>
            <div>
                <h1 className="text-display-md font-headline font-black tracking-tight text-on-surface mb-1">
                    AI Recommendations
                </h1>
                <p className="text-secondary font-medium">Predictive nutritional modeling for your bio-profile.</p>
            </div>
          </div>

          {/* AI Banner Bento */}
          <div className="w-full bg-surface-container-high rounded-[2.5rem] p-10 relative overflow-hidden group shadow-2xl border border-primary/10 transition-all duration-700 hover:shadow-primary/5">
            <div className="absolute -left-24 top-0 bottom-0 w-64 bg-primary/10 blur-[100px] skew-x-[-20deg] pointer-events-none transition-transform duration-[3000ms] group-hover:translate-x-[1200px]"></div>
            
            <div className="relative z-10 flex flex-col lg:flex-row justify-between items-center gap-10">
              <div className="text-center lg:text-left space-y-2">
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-secondary">Real-Time Caloric Delta</span>
                <div className="text-7xl font-black tracking-tighter text-on-surface">
                  450 <span className="text-2xl text-primary font-bold">kcal budget</span>
                </div>
              </div>
              <div className="max-w-md bg-surface/60 backdrop-blur-md p-6 rounded-3xl border border-outline-variant/20 shadow-sm transition-all duration-500 hover:bg-surface">
                <p className="text-on-surface-variant text-sm font-medium leading-relaxed">
                  Our neural engine has calculated the <span className="text-primary font-black">optimal nutrient density</span> for your remaining 450 kcal pool. High-synergy choices are prioritized below.
                </p>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex overflow-x-auto gap-3 pb-2 scrollbar-hide no-scrollbar animate-in fade-in duration-700">
            {tabs.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-8 py-4 rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 border ${
                  activeTab === tab
                    ? 'bg-on-background border-transparent text-surface shadow-xl scale-105'
                    : 'bg-surface-container border-outline-variant/10 text-secondary hover:bg-surface-container-high hover:border-outline-variant/30'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-32 text-primary animate-pulse">
              <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4"></div>
              <p className="text-secondary font-black tracking-[0.2em] text-[10px] uppercase">Neural Filtering In Progress...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-12 duration-1000">
              {filteredRecommendations.map(rec => (
                <div 
                  key={rec.id}
                  className="bg-surface-container-low rounded-[2.5rem] overflow-hidden flex flex-col border border-outline-variant/10 hover:border-primary/40 hover:shadow-2xl transition-all duration-500 relative group"
                >
                  {/* Synergy Badge */}
                  <div className="absolute top-6 left-6 z-20 flex items-center gap-2 bg-primary/90 backdrop-blur-lg border border-primary/20 text-surface px-4 py-2 rounded-full shadow-lg transition-transform group-hover:scale-110">
                    <span className="material-symbols-outlined text-[14px]">verified</span>
                    <span className="text-[10px] font-black tracking-widest uppercase">{rec.badge}</span>
                  </div>

                  {/* Image Container */}
                  <div className="h-56 w-full relative overflow-hidden">
                    <img 
                      src={rec.gambar} 
                      alt={rec.nama} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-on-surface/60 via-transparent to-transparent"></div>
                    
                    <div className="absolute bottom-4 left-6 flex items-baseline gap-1.5">
                      <span className="text-4xl font-black text-surface tracking-tighter">{rec.kalori}</span>
                      <span className="text-xs font-bold text-surface/80">Kcal</span>
                    </div>
                  </div>

                  {/* Content Area */}
                  <div className="p-8 flex-1 flex flex-col">
                    <h3 className="font-headline font-bold text-2xl text-on-surface mb-4 line-clamp-1 group-hover:text-primary transition-colors">
                      {rec.nama}
                    </h3>
                    
                    <div className="bg-surface-container-highest/30 p-5 rounded-[1.5rem] mb-8 flex-1 border border-outline-variant/5">
                      <p className="text-sm text-on-surface-variant leading-relaxed font-medium italic">
                        "{rec.alasan_rekomendasi}"
                      </p>
                    </div>

                    <button className="w-full bg-on-background text-surface rounded-full py-5 font-black uppercase tracking-widest text-xs shadow-xl transition-all hover:bg-primary active:scale-95 flex items-center justify-center gap-3">
                      <span className="material-symbols-outlined text-[18px]">add_circle</span>
                      Execute Intake
                    </button>
                  </div>
                </div>
              ))}
              
              {filteredRecommendations.length === 0 && (
                <div className="col-span-full py-24 text-center">
                    <span className="material-symbols-outlined text-6xl text-outline-variant mb-4 animate-bounce">auto_fix_off</span>
                    <h3 className="text-2xl font-black text-on-surface">Matrix Integrity Verified</h3>
                    <p className="text-secondary font-medium">Please re-select meal window or bio-sync profile.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
