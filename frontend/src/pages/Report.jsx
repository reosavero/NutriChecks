import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

export default function Report() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [range, setRange] = useState('7days');
  const [reportData, setReportData] = useState(null);
  
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
    const fetchReportData = () => {
      setIsLoading(true);
      setTimeout(() => {
        const dummyData = {
          summary: {
            avgCalories: 1850,
            weightChange: -1.2,
            targetCompliance: 85,
            caloricVelocity: -200
          },
          charts: {
            weeklyData: [
                { day: 'M', value: 60, status: 'normal' },
                { day: 'T', value: 75, status: 'normal' },
                { day: 'W', value: 45, status: 'active' },
                { day: 'T', value: 80, status: 'normal' },
                { day: 'F', value: 95, status: 'tertiary' },
                { day: 'S', value: 70, status: 'normal' },
                { day: 'S', value: 65, status: 'normal' }
            ],
            macros: {
                protein: { current: 112, target: 130, percent: 40 },
                carbs: { current: 180, target: 200, percent: 30 },
                fats: { current: 65, target: 70, percent: 30 }
            },
            micros: [
                { name: 'Iron', current: 14, target: 18, unit: 'mg', icon: 'water_drop', color: 'text-tertiary', bar: 'bg-tertiary', width: '77%' },
                { name: 'Vitamin D', current: 15, target: 15, unit: 'mcg', icon: 'wb_sunny', color: 'text-primary', bar: 'bg-primary', width: '100%' },
                { name: 'Calcium', current: 850, target: 1000, unit: 'mg', icon: 'medication', color: 'text-secondary', bar: 'bg-secondary', width: '85%' },
                { name: 'Fiber', current: 22, target: 25, unit: 'g', icon: 'eco', color: 'text-primary', bar: 'bg-primary', width: '88%' }
            ]
          },
          recommendation: {
              title: 'Boost Iron Intake',
              desc: 'Your iron levels have been trending slightly below your ideal weight goal metrics. Adding dark leafy greens to your morning routine can help close this gap.',
              image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?q=80&w=1000&auto=format&fit=crop'
          }
        };
        setReportData(dummyData);
        setIsLoading(false);
      }, 800); 
    };
    fetchReportData();
  }, [range]);

  if (!user) return null;

  return (
    <div className="flex h-screen overflow-hidden bg-background text-on-background font-body antialiased">
      <Sidebar user={user} />

      <main className="flex-1 lg:ml-72 flex flex-col min-h-screen overflow-y-auto pb-24 lg:pb-0">
        <Header user={user} />

        <div className="flex-1 p-6 md:p-8 lg:p-12 max-w-screen-2xl mx-auto w-full space-y-12">
          {/* Header Section */}
          <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h2 className="text-sm font-bold text-primary tracking-widest uppercase mb-2">Nutritional Insights</h2>
              <h1 className="text-display-md font-headline font-bold text-on-surface leading-tight">Weekly <br/><span className="text-secondary font-medium">Breakdown</span></h1>
            </div>
            {/* Date Selector */}
            <div className="inline-flex items-center bg-surface-container-high/40 backdrop-blur-md rounded-full p-1 border border-outline-variant/20 self-start shadow-sm hover:shadow-md transition-all">
              <button className="px-5 py-2 rounded-full text-xs font-bold text-secondary hover:text-on-surface transition-colors" onClick={() => setRange('7days')}>7 DAYS</button>
              <button className="px-5 py-2 rounded-full text-xs font-bold bg-surface-container-lowest text-on-surface shadow-sm">OCT 12-18</button>
              <button className="p-2 ml-1 rounded-full text-secondary hover:bg-surface-container transition-colors"><span className="material-symbols-outlined text-[18px]">calendar_month</span></button>
            </div>
          </header>

          {isLoading ? (
            <div className="flex-1 flex flex-col items-center justify-center py-20 animate-pulse">
                <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4"></div>
                <p className="text-secondary font-bold tracking-widest text-xs uppercase">Computing Bio-Metrics...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
              
              {/* Energy Balance Bento */}
              <div className="md:col-span-8 bg-surface-container-low rounded-[2.5rem] p-10 relative overflow-hidden flex flex-col justify-between min-h-[400px] border border-outline-variant/10 group">
                <div className="absolute -right-32 -top-32 w-80 h-80 bg-primary/5 rounded-full blur-[80px] group-hover:bg-primary/10 transition-colors duration-1000"></div>
                
                <div className="relative z-10 flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-bold text-on-surface mb-1">Energy Balance</h3>
                    <p className="text-sm text-secondary font-medium">Tracking towards <span className="text-primary font-bold">Ideal Weight</span> goal</p>
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary/10 text-primary rounded-full text-[10px] font-black uppercase tracking-wider border border-primary/20">
                    <span className="material-symbols-outlined text-[16px] fill">trending_down</span>
                    {reportData.summary.caloricVelocity} kcal/day
                  </span>
                </div>

                <div className="relative z-10 mt-12 flex flex-col md:flex-row md:items-end gap-12">
                  <div className="flex items-baseline gap-3">
                    <span className="text-7xl font-black tracking-tighter text-on-surface">{reportData.summary.avgCalories}</span>
                    <span className="text-xl font-bold text-secondary lowercase">kcal avg</span>
                  </div>
                  
                  {/* Custom Bar Chart */}
                  <div className="flex-1 h-32 flex items-end gap-2.5 pb-2">
                    {reportData.charts.weeklyData.map((d, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-3 group/bar">
                         <div className="w-full bg-surface-container-high rounded-full relative h-full flex items-end overflow-hidden transition-all group-hover/bar:bg-surface-container-highest">
                            <div 
                              className={`w-full rounded-full transition-all duration-1000 delay-${i*100} ${d.status === 'active' ? 'bg-primary shadow-[0_0_15px_rgba(0,108,81,0.4)]' : d.status === 'tertiary' ? 'bg-tertiary' : 'bg-outline-variant/40'}`} 
                              style={{ height: `${d.value}%` }}
                            ></div>
                         </div>
                         <span className={`text-[10px] font-black group-hover/bar:scale-125 transition-transform ${d.status === 'active' ? 'text-primary' : 'text-secondary'}`}>{d.day}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Macro Ring Bento */}
              <div className="md:col-span-4 bg-surface-container-low rounded-[2.5rem] p-10 flex flex-col items-center justify-between relative border border-outline-variant/10 shadow-sm">
                <h3 className="text-lg font-bold text-on-surface absolute top-10 left-10">Macronutrients</h3>
                
                <div className="relative w-56 h-56 mt-8 flex items-center justify-center group">
                  <svg className="w-full h-full transform -rotate-90 filter drop-shadow-xl" viewBox="0 0 100 100">
                    <circle className="text-surface-container-high" cx="50" cy="50" fill="transparent" r="42" stroke="currentColor" strokeWidth="10"></circle>
                    {/* Protein */}
                    <circle className="text-primary transition-all duration-1000" cx="50" cy="50" fill="transparent" r="42" stroke="currentColor" strokeWidth="11" strokeDasharray="263.9" strokeDashoffset={263.9 - (263.9 * 0.4)} strokeLinecap="round"></circle>
                    {/* Carbs */}
                    <circle className="text-secondary-fixed-dim transition-all duration-1000" cx="50" cy="50" fill="transparent" r="42" stroke="currentColor" strokeWidth="11" strokeDasharray="263.9" strokeDashoffset={263.9 - (263.9 * 0.3)} strokeLinecap="round" style={{ transform: 'rotate(144deg)', transformOrigin: '50% 50%' }}></circle>
                    {/* Fats */}
                    <circle className="text-tertiary-container transition-all duration-1000" cx="50" cy="50" fill="transparent" r="42" stroke="currentColor" strokeWidth="11" strokeDasharray="263.9" strokeDashoffset={263.9 - (263.9 * 0.3)} strokeLinecap="round" style={{ transform: 'rotate(252deg)', transformOrigin: '50% 50%' }}></circle>
                  </svg>
                  <div className="absolute text-center flex flex-col items-center justify-center">
                    <span className="text-4xl font-black tracking-tighter text-on-surface">{reportData.charts.macros.protein.current}<span className="text-sm text-secondary font-bold">g</span></span>
                    <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mt-1 group-hover:scale-110 transition-transform">Protein</span>
                  </div>
                </div>

                <div className="w-full mt-10 space-y-4">
                  <div className="flex justify-between items-center text-xs">
                    <div className="flex items-center gap-3"><div className="w-2.5 h-2.5 rounded-full bg-primary shadow-sm"></div><span className="font-bold text-secondary">Protein ({reportData.charts.macros.protein.percent}%)</span></div>
                    <span className="font-black text-on-surface">{reportData.charts.macros.protein.current}g / {reportData.charts.macros.protein.target}g</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <div className="flex items-center gap-3"><div className="w-2.5 h-2.5 rounded-full bg-secondary-fixed-dim shadow-sm"></div><span className="font-bold text-secondary">Carbs ({reportData.charts.macros.carbs.percent}%)</span></div>
                    <span className="font-black text-on-surface">{reportData.charts.macros.carbs.current}g / {reportData.charts.macros.carbs.target}g</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <div className="flex items-center gap-3"><div className="w-2.5 h-2.5 rounded-full bg-tertiary-container shadow-sm"></div><span className="font-bold text-secondary">Fats ({reportData.charts.macros.fats.percent}%)</span></div>
                    <span className="font-black text-on-surface">{reportData.charts.macros.fats.current}g / {reportData.charts.macros.fats.target}g</span>
                  </div>
                </div>
              </div>

              {/* Micronutrients Bento */}
              <div className="md:col-span-5 bg-surface-container-lowest shadow-2xl rounded-[2.5rem] p-10 border border-outline-variant/15 group">
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-lg font-bold text-on-surface">Micro Goals</h3>
                  <button className="p-2 text-secondary hover:bg-surface-container rounded-full transition-colors"><span className="material-symbols-outlined text-[20px]">more_horiz</span></button>
                </div>
                <div className="space-y-8">
                  {reportData.charts.micros.map((m, i) => (
                    <div key={i} className="group/micro">
                      <div className="flex justify-between items-end text-xs mb-3">
                        <span className={`font-black uppercase tracking-widest flex items-center gap-2 ${m.color}`}>
                          <span className="material-symbols-outlined text-[18px] fill">{m.icon}</span> 
                          {m.name}
                        </span>
                        <span className="text-secondary font-bold">
                          {m.current}{m.unit} / <span className={`${m.color} font-black`}>{m.target}{m.unit}</span>
                        </span>
                      </div>
                      <div className="w-full h-2.5 bg-surface-container-high/50 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${m.bar} rounded-full transition-all duration-1000 shadow-sm`}
                          style={{ width: m.width }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommendation Editorial Bento */}
              <div className="md:col-span-7 bg-surface-container-low rounded-[2.5rem] overflow-hidden flex flex-col md:flex-row border border-outline-variant/10 shadow-sm hover:shadow-md transition-shadow">
                <div className="p-10 flex-1 flex flex-col justify-center items-start text-left">
                  <span className="text-[10px] font-black text-tertiary tracking-[0.3em] uppercase mb-3">Insights Engine</span>
                  <h3 className="text-3xl font-black text-on-surface leading-tight mb-4 tracking-tighter">{reportData.recommendation.title}</h3>
                  <p className="text-secondary text-sm font-medium leading-relaxed mb-8 max-w-[340px]">{reportData.recommendation.desc}</p>
                  <button className="px-8 py-4 bg-surface-container-lowest text-on-surface rounded-full text-xs font-black uppercase tracking-widest border border-outline-variant/20 hover:bg-primary hover:text-white hover:border-transparent transition-all flex items-center gap-3 shadow-sm active:scale-95">
                    Explore Recipes <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </button>
                </div>
                <div className="w-full md:w-2/5 h-64 md:h-auto bg-cover bg-center relative group overflow-hidden">
                  <img src={reportData.recommendation.image} alt="Recommendation" className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-l from-on-surface/20 to-transparent"></div>
                </div>
              </div>

            </div>
          )}
        </div>
      </main>
    </div>
  );
}
