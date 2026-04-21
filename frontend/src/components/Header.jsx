import React from 'react';

/**
 * Header component for NutriCheck.
 * @param {object|null} user - Data user with avatar and name.
 */
export default function Header({ user = null }) {
  const profileName = user?.nama || 'Guest';
  const profileAvatar = user?.avatar || `https://ui-avatars.com/api/?name=${profileName.charAt(0)}&background=006c51&color=ffffff`;

  return (
    <header className="bg-white/60 backdrop-blur-lg font-sans text-sm tracking-tight sticky top-0 w-full z-30 flex justify-between items-center px-8 h-20 max-w-screen-2xl mx-auto shadow-[0_32px_64px_-15px_rgba(0,0,0,0.06)] transition-colors border-b border-surface-container-high/20">
      {/* Brand Logo (Mobile mostly) */}
      <div className="flex items-center lg:hidden">
        <span className="text-2xl font-black tracking-tighter text-on-surface">NutriCheck</span>
      </div>

      {/* Navigation Links (Desktop - optional if sidebar is enough, but design had them) */}
      <nav className="hidden md:flex space-x-8 items-center h-full">
        <a className="h-full flex items-center text-primary font-bold border-b-2 border-primary scale-95 duration-200 ease-out" href="/dashboard">Dashboard</a>
        <a className="h-full flex items-center text-secondary font-medium hover:text-primary transition-colors scale-95 duration-200 ease-out" href="/upload-food">AI Scan</a>
        <a className="h-full flex items-center text-secondary font-medium hover:text-primary transition-colors scale-95 duration-200 ease-out" href="/report">History</a>
      </nav>

      {/* Trailing Actions */}
      <div className="flex items-center space-x-4">
        <button className="text-secondary hover:text-primary transition-all scale-95 duration-200 ease-out flex items-center justify-center w-10 h-10 rounded-full bg-surface-container-low hover:bg-primary/5">
          <span className="material-symbols-outlined">notifications</span>
        </button>
        <button className="text-secondary hover:text-primary transition-all scale-95 duration-200 ease-out flex items-center justify-center w-10 h-10 rounded-full bg-surface-container-low hover:bg-primary/5">
          <span className="material-symbols-outlined">settings</span>
        </button>
        <div className="relative group ml-2">
          <img 
            alt="User profile" 
            className="w-10 h-10 rounded-full object-cover border-2 border-surface-container-lowest shadow-sm group-hover:border-primary transition-colors cursor-pointer" 
            src={profileAvatar} 
          />
        </div>
      </div>
    </header>
  );
}
