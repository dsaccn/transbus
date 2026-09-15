import React from 'react';
import { useTransport } from '../context/TransportContext';
import {
  Bus,
  Clock,
  Globe,
  UserCheck,
  Shield,
  Briefcase,
  Ticket as TicketIcon,
  Search,
  CheckCircle2,
  LogOut,
  Cpu,
  Layers,
  Sliders,
} from 'lucide-react';
import { Role } from '../types';

export const Navbar: React.FC = () => {
  const {
    language,
    setLanguage,
    t,
    currentUser,
    logout,
    activeTab,
    setActiveTab,
    currentTime,
  } = useTransport();

  const getRoleIcon = (role: Role) => {
    switch (role) {
      case 'admin':
        return <Shield className="w-3.5 h-3.5 text-purple-400" />;
      case 'manager':
        return <Briefcase className="w-3.5 h-3.5 text-blue-400" />;
      case 'agent':
        return <TicketIcon className="w-3.5 h-3.5 text-emerald-400" />;
    }
  };

  const getRoleBadgeStyle = (role: Role) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-950/80 text-purple-300 border-purple-800';
      case 'manager':
        return 'bg-blue-950/80 text-blue-300 border-blue-800';
      case 'agent':
        return 'bg-emerald-950/80 text-emerald-300 border-emerald-800';
    }
  };

  // Permitted navigation tabs based on user role
  const allNavItems = [
    {
      id: 'ticketCounter',
      label: t.tabTicketCounter,
      icon: TicketIcon,
      allowedRoles: ['agent', 'manager', 'admin'],
    },
    {
      id: 'dispatchManifest',
      label: t.tabDispatchManifest,
      icon: Bus,
      allowedRoles: ['manager', 'admin'],
    },
    {
      id: 'verifyTicket',
      label: t.tabVerifyTicket,
      icon: CheckCircle2,
      allowedRoles: ['agent', 'manager', 'admin'],
    },
    {
      id: 'agentLedger',
      label: t.tabAgentLedger,
      icon: UserCheck,
      allowedRoles: ['agent', 'manager', 'admin'],
    },
    {
      id: 'busRouteControl',
      label: t.tabBusRouteControl,
      icon: Sliders,
      allowedRoles: ['manager', 'admin'],
    },
    {
      id: 'fleet',
      label: t.tabFleet,
      icon: Layers,
      allowedRoles: ['manager', 'admin'],
    },
    {
      id: 'routes',
      label: t.tabRoutes,
      icon: Search,
      allowedRoles: ['admin'],
    },
    {
      id: 'adminSettings',
      label: t.tabAdminSettings,
      icon: Shield,
      allowedRoles: ['admin'],
    },
  ];

  const permittedNavItems = allNavItems.filter((item) =>
    item.allowedRoles.includes(currentUser.role)
  );

  return (
    <header className="bg-slate-900 text-white sticky top-0 z-40 shadow-xl border-b border-slate-800">
      {/* Top utility bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 border-b border-slate-800/70 flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Terminal status */}
        <div className="flex items-center gap-2 text-slate-300">
          <span className="inline-flex items-center px-2 py-0.5 rounded-full font-bold text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5 animate-pulse" />
            {language === 'am' ? 'ተርሚናል ክፍት ነው' : 'TERMINAL ONLINE'}
          </span>
          <span className="hidden sm:inline text-slate-600">|</span>
          <span className="font-semibold text-slate-300 text-[11px]">
            {language === 'am' ? 'አዲስ አበባ ዋና ተርሚናል (Addis Central)' : 'Addis Ababa Central Terminal'}
          </span>
        </div>

        {/* Clock, Language, Logged in User & Logout */}
        <div className="flex items-center gap-2.5 sm:gap-4">
          {/* Live Clock */}
          <div className="flex items-center gap-1.5 text-slate-300 font-mono-code bg-slate-950/80 px-2.5 py-1 rounded-xl border border-slate-800 text-xs">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-amber-300 font-bold">{currentTime || '06:00:00'}</span>
          </div>

          {/* Bilingual Language Switcher */}
          <button
            id="lang-switcher-btn"
            onClick={() => setLanguage(language === 'en' ? 'am' : 'en')}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition cursor-pointer text-xs font-semibold"
            title="Toggle Language / ቋንቋ ቀይር"
          >
            <Globe className="w-3.5 h-3.5 text-sky-400" />
            <span>{language === 'en' ? 'አማርኛ' : 'English'}</span>
          </button>

          {/* Current User Profile Display */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
            <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-white">
              {currentUser.avatar || currentUser.name.charAt(0)}
            </div>
            <div className="hidden md:block text-left leading-tight">
              <div className="font-bold text-xs text-white">
                {language === 'am' ? currentUser.nameAm : currentUser.name}
              </div>
              <div className="text-[10px] font-mono-code text-slate-400">
                {currentUser.agentCode}
              </div>
            </div>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full border font-bold uppercase flex items-center gap-1 ${getRoleBadgeStyle(
                currentUser.role
              )}`}
            >
              {getRoleIcon(currentUser.role)}
              <span>{currentUser.role}</span>
            </span>
          </div>

          {/* Logout Button */}
          <button
            id="logout-btn"
            onClick={logout}
            className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 hover:text-rose-100 border border-rose-900/60 transition cursor-pointer text-xs font-bold shadow-sm ml-1"
            title={t.logout}
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t.logout}</span>
          </button>
        </div>
      </div>

      {/* Main branding & navigation bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-400 p-0.5 shadow-lg shadow-emerald-950/50">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Cpu className="w-5 h-5 text-emerald-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-1.5">
                NOXORA <span className="text-emerald-400">TECH</span>
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded font-mono-code bg-emerald-950 text-emerald-300 border border-emerald-700/50 font-bold">
                PRO
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block font-medium">
              {t.appSubtitle}
            </p>
          </div>
        </div>

        {/* Permitted Navigation Tabs */}
        <nav className="flex items-center gap-1 overflow-x-auto py-1 scrollbar-none">
          {permittedNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-tab-${item.id}`}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
