import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

export default function LogFood() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const [foodLogs, setFoodLogs] = useState({
    sarapan: [],
    makanSiang: [],
    makanMalam: [],
    camilan: []
  });

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
    const fetchFoodLogs = () => {
      setIsLoading(true);
      setTimeout(() => {
        const dummyLogs = {
          sarapan: [
            { id: 1, name: 'Fried Egg', portion: '1 Piece (50g)', kalori: 92, protein: 6.3, karbo: 0.4, lemak: 7.3 },
            { id: 2, name: 'Whole Wheat Bread', portion: '2 Slices (60g)', kalori: 150, protein: 6.0, karbo: 28.0, lemak: 2.0 }
          ],
          makanSiang: [
            { id: 3, name: 'White Rice', portion: '1 Serving (150g)', kalori: 204, protein: 4.0, karbo: 45.0, lemak: 0.4 },
            { id: 4, name: 'Grilled Chicken Breast', portion: '1 Piece (100g)', kalori: 165, protein: 31.0, karbo: 0.0, lemak: 3.6 }
          ],
          makanMalam: [
            { id: 5, name: 'Vegetable Salad', portion: '1 Bowl (150g)', kalori: 120, protein: 3.0, karbo: 15.0, lemak: 5.0 }
          ],
          camilan: [
            { id: 6, name: 'Red Apple', portion: '1 Medium (100g)', kalori: 52, protein: 0.3, karbo: 14.0, lemak: 0.2 }
          ]
        };
        setFoodLogs(dummyLogs);
        setIsLoading(false);
      }, 800);
    };
    fetchFoodLogs();
  }, [selectedDate]);

  if (!user) return null;

  const calculateTotal = (field) => Object.values(foodLogs).flat().reduce((acc, curr) => acc + curr[field], 0);

  const totalKalori = calculateTotal('kalori');
  const targetKalori = user?.target_kalori || 2000;
  const persenKalori = Math.min((totalKalori / targetKalori) * 100, 100);

  const totalProtein = calculateTotal('protein');
  const totalKarbo = calculateTotal('karbo');
  const totalLemak = calculateTotal('lemak');

  const targets = { protein: 120, karbo: 250, lemak: 60 };

  const CircularMacro = ({ value, max, color, label, icon }) => {
    const radius = 24;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (Math.min(value / max, 1) * circumference);
    return (
      <div className="flex flex-col items-center gap-3 group">
        <div className="relative w-16 h-16 flex items-center justify-center">
            <svg className="absolute inset-0 w-full h-full -rotate-90">
                <circle cx="32" cy="32" r={radius} fill="transparent" stroke="currentColor" strokeWidth="4" className="text-surface-container-highest" />
                <circle cx="32" cy="32" r={radius} fill="transparent" stroke="currentColor" strokeWidth="5" strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" className={`${color} transition-all duration-1000`} />
            </svg>
            <span className={`material-symbols-outlined text-[18px] ${color} fill`}>{icon}</span>
        </div>
        <div className="text-center">
            <span className="block text-[10px] font-black uppercase tracking-widest text-secondary">{label}</span>
            <span className="text-xs font-bold text-on-surface">{Math.round(value)}g</span>
        </div>
      </div>
    );
  };

  const MealCard = ({ title, icon, dataKey, color }) => {
    const data = foodLogs[dataKey];
    const mealCals = data.reduce((acc, curr) => acc + curr.kalori, 0);
    return (
      <div className="bg-surface-container-low rounded-[2rem] p-8 border border-outline-variant/10 hover:shadow-xl transition-all duration-500 group">
        <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-on-surface flex items-center gap-3">
                <span className={`material-symbols-outlined ${color} text-2xl fill`}>{icon}</span>
                {title}
            </h3>
            <span className={`text-xs font-black px-3 py-1 rounded-full ${color.replace('text-', 'bg-').replace('-500', '/10')} ${color}`}>
                {mealCals} KCAL
            </span>
        </div>
        <div className="space-y-4 mb-8 min-h-[60px]">
            {data.length === 0 ? (
                <p className="text-xs font-medium text-outline italic py-4">No nutrition data logged for this window.</p>
            ) : (
                data.map(item => (
                    <div key={item.id} className="flex justify-between items-center group/item transition-all">
                        <div className="flex flex-col">
                            <span className="text-sm font-bold text-on-surface mb-0.5">{item.name}</span>
                            <span className="text-[10px] font-medium text-secondary">{item.portion}</span>
                        </div>
                        <div className="flex items-center gap-4">
                             <div className="text-right">
                                <span className="block text-xs font-black text-on-surface">{item.kalori}</span>
                                <span className="text-[10px] font-bold text-outline">KCAL</span>
                             </div>
                             <button className="material-symbols-outlined text-[18px] text-outline hover:text-error transition-colors opacity-0 group-hover/item:opacity-100">delete</button>
                        </div>
                    </div>
                ))
            )}
        </div>
        <button className="w-full py-4 rounded-2xl bg-surface-container-highest/50 border border-outline-variant/10 text-on-surface-variant font-black text-[10px] uppercase tracking-[0.2em] hover:bg-on-background hover:text-surface transition-all active:scale-[0.98] flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-[16px]">add_circle</span>
            Initialize Input
        </button>
      </div>
    );
  };

  const changeDate = (offset) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + offset);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const isToday = selectedDate === new Date().toISOString().split('T')[0];

  return (
    <div className="flex h-screen overflow-hidden bg-background text-on-background font-body antialiased">
      <Sidebar activePage="log" user={user} />

      <main className="flex-1 lg:ml-72 flex flex-col min-h-screen overflow-y-auto pb-24 lg:pb-0">
        <Header user={user} />

        <div className="flex-1 p-6 md:p-8 lg:p-12 max-w-screen-2xl mx-auto w-full space-y-10">
          {/* Header & Date Nav */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 animate-in fade-in slide-in-from-left-4 duration-500">
             <div>
                <h1 className="text-display-md font-headline font-black tracking-tight text-on-surface mb-2">
                    Daily <br/><span className="text-secondary font-medium">Timeline Log</span>
                </h1>
                <p className="text-on-surface-variant font-medium">Record and track your bio-metric inputs for real-time <span className="text-primary font-bold">Nutritional Velocity</span>.</p>
             </div>

             <div className="flex items-center bg-surface-container-high/40 backdrop-blur-md rounded-full p-1 border border-outline-variant/20 shadow-sm hover:shadow-md transition-all self-start md:self-auto">
                <button onClick={() => changeDate(-1)} className="p-3 rounded-full hover:bg-surface-container transition-colors"><span className="material-symbols-outlined">chevron_left</span></button>
                <div className="px-6 font-black uppercase tracking-widest text-xs text-on-surface whitespace-nowrap">
                   {isToday ? 'Live: Today' : selectedDate}
                </div>
                <button onClick={() => changeDate(1)} disabled={isToday} className={`p-3 rounded-full transition-colors ${isToday ? 'text-outline opacity-30 cursor-not-allowed' : 'hover:bg-surface-container'}`}><span className="material-symbols-outlined">chevron_right</span></button>
             </div>
          </div>

          {isLoading ? (
            <div className="flex-1 flex flex-col items-center justify-center py-32 animate-pulse">
                <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4"></div>
                <p className="text-secondary font-black tracking-[0.2em] text-[10px] uppercase">Syncing Bio-Data Stream...</p>
            </div>
          ) : (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
                {/* Summary Bento */}
                <div className="bg-surface-container-lowest rounded-[2.5rem] p-10 shadow-2xl border border-outline-variant/10 flex flex-col lg:flex-row items-center gap-12 group">
                   <div className="flex-1 w-full space-y-8">
                       <div className="flex justify-between items-end">
                           <div className="space-y-2">
                               <span className="text-[10px] font-black uppercase tracking-[0.3em] text-secondary">Energy Consumed</span>
                               <div className="text-6xl font-black text-on-surface tracking-tighter">{Math.round(totalKalori)} <span className="text-xl text-outline font-medium">kcal</span></div>
                           </div>
                           <div className="text-right space-y-1">
                               <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Budget Status</span>
                               <div className="text-3xl font-black text-primary tracking-tighter">-{Math.max(targetKalori - totalKalori, 0)} <span className="text-xs">Left</span></div>
                           </div>
                       </div>
                       
                       <div className="relative h-4 bg-surface-container rounded-full overflow-hidden shadow-inner">
                           <div 
                             className={`absolute inset-y-0 left-0 rounded-full transition-all duration-1000 ${persenKalori > 100 ? 'bg-error shadow-[0_0_20px_rgba(186,26,26,0.5)]' : 'bg-primary shadow-[0_0_20px_rgba(0,108,81,0.3)]'}`}
                             style={{ width: `${persenKalori}%` }}
                           ></div>
                       </div>
                       <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-outline">
                          <span>Origin (0 kcal)</span>
                          <span>Allocation Boundary ({targetKalori} kcal)</span>
                       </div>
                   </div>

                   <div className="hidden lg:block w-px h-32 bg-outline-variant/20"></div>

                   <div className="flex items-center justify-around w-full lg:w-auto gap-8 lg:gap-16 pb-2">
                       <CircularMacro value={totalProtein} max={targets.protein} color="text-primary" label="Protein" icon="egg_alt" />
                       <CircularMacro value={totalKarbo} max={targets.karbo} color="text-secondary-fixed-dim" label="Carbs" icon="bakery_dining" />
                       <CircularMacro value={totalLemak} max={targets.lemak} color="text-tertiary" label="Fats" icon="opacity" />
                   </div>
                </div>

                {/* Search / Manual Input */}
                <div className="relative group max-w-2xl">
                    <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-primary group-focus-within:scale-110 transition-transform">search</span>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Manually index bio-assets (e.g. 'Avocado Pulse')..."
                      className="w-full bg-surface-container border-none rounded-full py-5 pl-14 pr-8 focus:ring-2 focus:ring-primary/30 transition-all font-medium placeholder:text-outline shadow-sm hover:shadow-md"
                    />
                </div>

                {/* Meal Sections Bento Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <MealCard title="Breakfast" icon="light_mode" dataKey="sarapan" color="text-primary" />
                    <MealCard title="Lunch" icon="sunny" dataKey="makanSiang" color="text-secondary-fixed-dim" />
                    <MealCard title="Dinner" icon="bedtime" dataKey="makanMalam" color="text-tertiary" />
                    <MealCard title="Snacks" icon="icecream" dataKey="camilan" color="text-on-surface-variant" />
                </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
