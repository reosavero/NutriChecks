import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';


export default function FoodMenu() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [dummyFoods, setDummyFoods] = useState([]);

  const navigate = useNavigate();

  const filterChips = [
    'All', 
    'High Protein', 
    'Low Carb', 
    'Low Fat', 
    'Breakfast', 
    'Dinner'
  ];

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
    const fetchCatalog = () => {
      setIsLoading(true);
      setTimeout(() => {
        setDummyFoods([
          {
            id: 1,
            name: 'Berry Honey Oatmeal',
            kalori: 250,
            protein: 8,
            karbo: 45,
            lemak: 4,
            kategori: ['Breakfast', 'Low Fat'],
            image: 'https://images.pexels.com/photos/1099680/pexels-photo-1099680.jpeg?auto=compress&cs=tinysrgb&w=800'
          },
          {
            id: 2,
            name: 'Herbed Chicken Breast',
            kalori: 165,
            protein: 31,
            karbo: 0,
            lemak: 3.6,
            kategori: ['Dinner', 'High Protein', 'Low Carb'],
            image: 'https://images.pexels.com/photos/6294348/pexels-photo-6294348.jpeg?auto=compress&cs=tinysrgb&w=800'
          },
          {
            id: 3,
            name: 'Special Avocado Toast',
            kalori: 320,
            protein: 10,
            karbo: 35,
            lemak: 18,
            kategori: ['Breakfast'],
            image: 'https://images.pexels.com/photos/1351238/pexels-photo-1351238.jpeg?auto=compress&cs=tinysrgb&w=800'
          },
          {
            id: 4,
            name: 'Butter Grilled Salmon',
            kalori: 350,
            protein: 35,
            karbo: 2,
            lemak: 22,
            kategori: ['Dinner', 'High Protein', 'Low Carb'],
            image: 'https://images.pexels.com/photos/262959/pexels-photo-262959.jpeg?auto=compress&cs=tinysrgb&w=800'
          },
          {
            id: 5,
            name: 'Green Quinoa Salad',
            kalori: 210,
            protein: 8,
            karbo: 38,
            lemak: 5,
            kategori: ['Low Fat', 'Dinner'],
            image: 'https://images.pexels.com/photos/1640772/pexels-photo-1640772.jpeg?auto=compress&cs=tinysrgb&w=800'
          },
          {
            id: 6,
            name: 'Prime Beef Steak',
            kalori: 540,
            protein: 45,
            karbo: 25,
            lemak: 28.1,
            kategori: ['Dinner', 'High Protein', 'Low Carb'],
            image: 'https://images.pexels.com/photos/675951/pexels-photo-675951.jpeg?auto=compress&cs=tinysrgb&w=800'
          }
        ]);
        setIsLoading(false);
      }, 1000); 
    };
    fetchCatalog();
  }, []);

  const filteredFoods = dummyFoods.filter((food) => {
    const isMatchSearch = food.name.toLowerCase().includes(searchQuery.toLowerCase());
    const isMatchCategory = activeCategory === 'All' || food.kategori.includes(activeCategory);
    return isMatchSearch && isMatchCategory;
  });

  if (!user) return null;

  return (
    <div className="flex h-screen overflow-hidden bg-background text-on-background font-body antialiased">
      <Sidebar activePage="menu" user={user} />

      <main className="flex-1 lg:ml-72 flex flex-col min-h-screen overflow-y-auto pb-24 lg:pb-0">


        <div className="flex-1 p-6 md:p-8 lg:p-12 max-w-screen-2xl mx-auto w-full space-y-12">
          {/* Header */}
          <div className="animate-in fade-in slide-in-from-left-4 duration-500">
            <h1 className="text-display-md font-headline font-black tracking-tight text-on-surface mb-2">
              NutriCatalog <br/><span className="text-secondary font-medium">Food Resources</span>
            </h1>
            <p className="text-on-surface-variant font-medium max-w-2xl">Discover curated bio-metric compatible meals tailored to your caloric velocity and weight goals.</p>
          </div>

          {/* Search & Filters */}
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="relative group max-w-3xl">
              <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-primary group-focus-within:scale-110 transition-transform">search</span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search functional foods, macros, or dietary profiles..."
                className="w-full bg-surface-container border-none rounded-[2rem] py-5 pl-14 pr-8 focus:ring-2 focus:ring-primary/30 transition-all font-medium placeholder:text-outline shadow-sm hover:shadow-md"
              />
            </div>

            <div className="flex overflow-x-auto pb-4 gap-3 scrollbar-hide no-scrollbar">
              {filterChips.map(chip => (
                <button
                  key={chip}
                  onClick={() => setActiveCategory(chip)}
                  className={`flex-shrink-0 px-6 py-3 rounded-full text-xs font-black uppercase tracking-widest border transition-all duration-300 shadow-sm ${
                    activeCategory === chip
                      ? 'bg-primary border-transparent text-white shadow-primary/20 scale-105'
                      : 'bg-surface-container border-outline-variant/10 text-secondary hover:bg-surface-container-high hover:border-outline-variant/30'
                  }`}
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-32 text-primary animate-pulse">
              <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4"></div>
              <p className="text-secondary font-black tracking-[0.2em] text-[10px] uppercase">Retrieving Catalog Matrix...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
              {filteredFoods.map(food => (
                <div 
                  key={food.id}
                  className="bg-surface-container-low rounded-[2rem] overflow-hidden flex flex-col group border border-outline-variant/10 hover:border-primary/30 hover:shadow-2xl transition-all duration-500"
                >
                  {/* Image Area */}
                  <div className="h-60 w-full relative overflow-hidden">
                    <img 
                      src={food.image} 
                      alt={food.name} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-on-surface/40 to-transparent opacity-60"></div>
                    <div className="absolute top-4 right-4 bg-surface/90 backdrop-blur-md px-4 py-2 rounded-full border border-outline-variant/20 flex items-center shadow-lg">
                       <span className="text-on-surface font-black text-sm">{food.kalori}</span>
                       <span className="text-secondary text-[10px] uppercase font-bold ml-1">Kcal</span>
                    </div>
                  </div>

                  {/* Content Area */}
                  <div className="p-8 flex-1 flex flex-col">
                    <h3 className="font-headline font-bold text-xl text-on-surface leading-tight mb-4 group-hover:text-primary transition-colors">{food.name}</h3>

                    {/* Macros */}
                    <div className="grid grid-cols-3 gap-3 mb-8">
                       <div className="bg-surface-container p-3 rounded-2xl flex flex-col items-center border border-outline-variant/5">
                          <span className="text-[10px] font-black uppercase text-secondary tracking-widest mb-1">PRO</span>
                          <span className="font-bold text-primary">{food.protein}g</span>
                       </div>
                       <div className="bg-surface-container p-3 rounded-2xl flex flex-col items-center border border-outline-variant/5">
                          <span className="text-[10px] font-black uppercase text-secondary tracking-widest mb-1">CHO</span>
                          <span className="font-bold text-secondary-fixed-dim">{food.karbo}g</span>
                       </div>
                       <div className="bg-surface-container p-3 rounded-2xl flex flex-col items-center border border-outline-variant/5">
                          <span className="text-[10px] font-black uppercase text-secondary tracking-widest mb-1">FAT</span>
                          <span className="font-bold text-tertiary">{food.lemak}g</span>
                       </div>
                    </div>

                    {/* Action Button */}
                    <button className="mt-auto w-full flex items-center justify-center gap-3 bg-on-background text-surface py-4 rounded-full font-black uppercase tracking-widest text-xs transition-all hover:bg-primary shadow-lg active:scale-95 group/btn">
                      <span className="material-symbols-outlined text-[18px] transition-transform group-hover/btn:rotate-90">add</span>
                      Log to Timeline
                    </button>
                  </div>
                </div>
              ))}
              
              {filteredFoods.length === 0 && (
                <div className="col-span-full py-24 text-center">
                    <span className="material-symbols-outlined text-6xl text-outline-variant mb-4">search_off</span>
                    <h3 className="text-xl font-bold text-on-surface">No Catalog Matches</h3>
                    <p className="text-secondary font-medium">Adjust your search parameters or bio-profile filters.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
