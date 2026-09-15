import React, { useState, useEffect } from 'react';
import { useTransport } from '../../context/TransportContext';
import { Role, User } from '../../types';
import {
  Shield,
  Briefcase,
  Ticket as TicketIcon,
  Lock,
  ArrowRight,
  Sparkles,
  Globe,
  Radio,
  CheckCircle2,
  Cpu,
  UserCheck,
  Check,
  Sliders,
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { t, language, setLanguage, users, login } = useTransport();

  // Active individual login page: 'agent' | 'manager' | 'admin'
  const [activePortal, setActivePortal] = useState<Role>('agent');
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [password, setPassword] = useState<string>('123456');
  const [errorMsg, setErrorMsg] = useState<string>('');

  // Personnel authorized specifically for the active portal
  const portalUsers = users.filter((u) => u.role === activePortal);

  // Synchronize first user when switching between individual login pages
  useEffect(() => {
    if (portalUsers.length > 0) {
      setSelectedUserId(portalUsers[0].id);
    }
    setErrorMsg('');
  }, [activePortal]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const userToLogin = users.find((u) => u.id === selectedUserId);

    if (!userToLogin || userToLogin.role !== activePortal) {
      setErrorMsg(
        language === 'am'
          ? 'ይህ አካውንት ለዚህ መግቢያ በር አልተፈቀደም። እባክዎ ትክክለኛውን ገጽ ይምረጡ።'
          : 'Unauthorized account for this portal. Please choose your assigned login page.'
      );
      return;
    }

    login(userToLogin);
  };

  const handleQuickSignIn = (user: User) => {
    login(user);
  };

  // Visual theming per individual login page
  const portalConfig = {
    agent: {
      themeColor: 'emerald',
      bgGlow: 'bg-emerald-500/10',
      activeTabClass: 'bg-emerald-600 text-white shadow-lg shadow-emerald-950/80',
      submitBtnClass: 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-950/60',
      icon: TicketIcon,
      badgeText: language === 'am' ? 'የትኬት ወኪል መግቢያ ገጽ' : 'Ticketing Agent Login Page',
      pageTitle: language === 'am' ? 'የቲኬት ቆራጭ ወኪል ተርሚናል' : 'Ticketing Agent Terminal Sign-In',
      pageSubtitle:
        language === 'am'
          ? 'የአዲስ አበባ ማዕከላዊ ጣቢያ የወንበር ትኬት መቁረጫ ተርሚናል'
          : 'Addis Ababa Central Station Counter & Ticket Issuance Portal',
      permittedFeatures:
        language === 'am'
          ? ['የትኬት መቁረጫ (Ticket Counter)', 'ትኬት ማረጋገጫ / ስካን (Verify Scan Ticket)', 'የግል ፈረቃ ሽያጭ (My Shift Sales)']
          : ['Ticket Counter', 'Verify Scan Ticket', 'My Shift Sales'],
      accountLabel: language === 'am' ? 'የትኬት ወኪል መለያ *' : 'Agent Staff Code or Name *',
    },
    manager: {
      themeColor: 'blue',
      bgGlow: 'bg-blue-500/10',
      activeTabClass: 'bg-blue-600 text-white shadow-lg shadow-blue-950/80',
      submitBtnClass: 'bg-blue-600 hover:bg-blue-500 shadow-blue-950/60',
      icon: Briefcase,
      badgeText: language === 'am' ? 'የጣቢያ ስራ አስኪያጅ መግቢያ ገጽ' : 'Station Manager Login Page',
      pageTitle: language === 'am' ? 'የጣቢያ ስራ አስኪያጅ እና ኦፕሬሽንስ' : 'Station Operations Manager Sign-In',
      pageSubtitle:
        language === 'am'
          ? 'የስምሪት፣ ማኒፌስት፣ የትኬት ቁጥጥር እና የተሽከርካሪ ክትትል አስተዳደር'
          : 'Dispatch Operations, Passenger Manifest, Fleet Monitoring & Route Oversight',
      permittedFeatures:
        language === 'am'
          ? [
              'የትኬት መቁረጫ (Ticket Counter)',
              'ስምሪት እና ማኒፌስት (Dispatch & Manifest)',
              'ትኬት ማረጋገጫ (Verify Scan Ticket)',
              'የፈረቃ ሽያጭ (My Shift Sales)',
              'ተሽከርካሪዎች እና ፍሊት (Read-only Fleet)',
              'የአውቶቡስ መስመር ቁጥጥር (Bus Route Control)',
            ]
          : [
              'Ticket Counter',
              'Dispatch & Manifest',
              'Verify Scan Ticket',
              'My Shift Sales',
              'Vehicles & Fleet (Read-only)',
              'Bus Route Control',
            ],
      accountLabel: language === 'am' ? 'የስራ አስኪያጅ መለያ *' : 'Manager Staff Code or Name *',
    },
    admin: {
      themeColor: 'purple',
      bgGlow: 'bg-purple-500/10',
      activeTabClass: 'bg-purple-600 text-white shadow-lg shadow-purple-950/80',
      submitBtnClass: 'bg-purple-600 hover:bg-purple-500 shadow-purple-950/60',
      icon: Shield,
      badgeText: language === 'am' ? 'የሲስተም አስተዳዳሪ መግቢያ ገጽ' : 'Executive Admin Login Page',
      pageTitle: language === 'am' ? 'የሲስተም የበላይ አስተዳዳሪ ኮንሶል' : 'System Administrator Console Sign-In',
      pageSubtitle:
        language === 'am'
          ? 'የሙሉ ሲስተም ቁጥጥር፣ የሻጮች ፈረቃ ኦዲት፣ ታሪፍ እና ተሽከርካሪ ምዝገባ'
          : 'Full Terminal Control, Multi-Seller Shift Sales Audit, Tariffs & System Config',
      permittedFeatures:
        language === 'am'
          ? [
              'ሙሉ የጣቢያ ክፍሎች ተደራሽነት (Full System Access)',
              'በወኪሎች እና ስራ አስኪያጆች መሀል የሽያጭ መለያ (Sellers Filter on Shift Sales)',
              'የተሽከርካሪዎች አስተዳደር (Fleet CRUD)',
              'የመስመሮች እና ታሪፍ አስተዳደር (Routes & Tariffs)',
              'የአውቶቡስ መስመር ቁጥጥር (Bus Route Control)',
            ]
          : [
              'Full System Access to All Modules',
              'Choose Between Sellers (Agents vs Managers) on Shift Sales',
              'Fleet Management (Add, Edit, Delete)',
              'Route Tariffs & Car Deployment Scheduler',
              'Bus Route Control Center',
            ],
      accountLabel: language === 'am' ? 'የአስተዳዳሪ መለያ *' : 'Administrator Username or Code *',
    },
  }[activePortal];

  const CurrentIcon = portalConfig.icon;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between relative overflow-hidden font-sans">
      {/* Dynamic Background Tech Glows */}
      <div
        className={`absolute -top-40 -left-40 w-96 h-96 ${portalConfig.bgGlow} rounded-full blur-3xl pointer-events-none transition-all duration-500`}
      />
      <div className="absolute top-1/3 -right-40 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-slate-800/20 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header with Noxora Tech Solutions Branding */}
      <header className="relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-400 p-0.5 shadow-lg shadow-emerald-900/30">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Cpu className="w-5 h-5 text-emerald-400" />
            </div>
          </div>
          <div>
            <span className="font-extrabold text-lg tracking-tight text-white flex items-center gap-1.5">
              NOXORA <span className="text-emerald-400">TECH</span>
            </span>
            <span className="text-[10px] text-slate-400 tracking-wider uppercase block font-semibold">
              Solutions • Transport Systems
            </span>
          </div>
        </div>

        <button
          onClick={() => setLanguage(language === 'am' ? 'en' : 'am')}
          className="flex items-center gap-2 px-3.5 py-1.5 bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white rounded-xl transition cursor-pointer shadow-sm"
        >
          <Globe className="w-3.5 h-3.5 text-emerald-400" />
          <span>{t.switchLanguage}</span>
        </button>
      </header>

      {/* Main Authentication Container */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-8">
        <div className="max-w-xl w-full bg-slate-900/95 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/70 animate-in fade-in zoom-in-95 duration-200">
          
          {/* Individual Login Page Selector Tabs */}
          <div className="mb-6">
            <div className="text-center mb-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                {language === 'am' ? 'የተለዩ የመግቢያ በሮች (Individual Login Pages)' : 'Select Designated Login Page'}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 p-1.5 bg-slate-950/90 border border-slate-800 rounded-2xl">
              {/* Agent Login Page Tab */}
              <button
                id="portal-tab-agent"
                type="button"
                onClick={() => setActivePortal('agent')}
                className={`flex flex-col items-center justify-center py-2.5 px-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                  activePortal === 'agent'
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
                }`}
              >
                <TicketIcon className="w-4 h-4 mb-1" />
                <span>{language === 'am' ? 'ወኪል መግቢያ' : 'Agent Login'}</span>
              </button>

              {/* Manager Login Page Tab */}
              <button
                id="portal-tab-manager"
                type="button"
                onClick={() => setActivePortal('manager')}
                className={`flex flex-col items-center justify-center py-2.5 px-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                  activePortal === 'manager'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-950'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
                }`}
              >
                <Briefcase className="w-4 h-4 mb-1" />
                <span>{language === 'am' ? 'ስራ አስኪያጅ' : 'Manager Login'}</span>
              </button>

              {/* Admin Login Page Tab */}
              <button
                id="portal-tab-admin"
                type="button"
                onClick={() => setActivePortal('admin')}
                className={`flex flex-col items-center justify-center py-2.5 px-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                  activePortal === 'admin'
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-950'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
                }`}
              >
                <Shield className="w-4 h-4 mb-1" />
                <span>{language === 'am' ? 'አስተዳዳሪ' : 'Admin Login'}</span>
              </button>
            </div>
          </div>

          {/* Current Page Header & Visual Identifier */}
          <div className="text-center mb-6">
            <div
              className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold mb-3 border ${
                activePortal === 'agent'
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                  : activePortal === 'manager'
                  ? 'bg-blue-500/10 border-blue-500/20 text-blue-400'
                  : 'bg-purple-500/10 border-purple-500/20 text-purple-400'
              }`}
            >
              <CurrentIcon className="w-3.5 h-3.5" />
              <span>{portalConfig.badgeText}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {portalConfig.pageTitle}
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
              {portalConfig.pageSubtitle}
            </p>
          </div>

          {/* Permitted Modules Card for this login portal */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-3.5 mb-6 text-xs">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-2 tracking-wider">
              {language === 'am' ? 'የተፈቀዱ የሲስተም ክፍሎች (Permitted Access):' : 'Authorized Functional Scope:'}
            </span>
            <div className="flex flex-wrap gap-1.5">
              {portalConfig.permittedFeatures.map((f, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900 text-slate-300 border border-slate-800 text-[11px] font-medium"
                >
                  <Check className="w-3 h-3 text-emerald-400" />
                  <span>{f}</span>
                </span>
              ))}
            </div>
          </div>

          {/* Direct Authorized Personnel Selection (NO ROLE IDENTIFICATION TAGS) */}
          <div className="mb-6">
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              {language === 'am' ? 'የተፈቀዱ ተጠቃሚዎች (ፈጣን ምርጫ)' : 'Authorized Personnel (Quick Select):'}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {portalUsers.map((u) => {
                const isSelected = selectedUserId === u.id;
                return (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => {
                      setSelectedUserId(u.id);
                    }}
                    className={`flex items-center justify-between p-3 rounded-2xl border text-left transition cursor-pointer ${
                      isSelected
                        ? activePortal === 'agent'
                          ? 'bg-emerald-950/50 border-emerald-500 text-white ring-1 ring-emerald-500'
                          : activePortal === 'manager'
                          ? 'bg-blue-950/50 border-blue-500 text-white ring-1 ring-blue-500'
                          : 'bg-purple-950/50 border-purple-500 text-white ring-1 ring-purple-500'
                        : 'bg-slate-950/40 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-850'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-white">
                        {u.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-xs text-white leading-tight">
                          {language === 'am' ? u.nameAm : u.name}
                        </div>
                        <div className="text-[11px] font-mono-code text-slate-400">
                          {u.agentCode}
                        </div>
                      </div>
                    </div>

                    <CheckCircle2
                      className={`w-4 h-4 ${
                        isSelected
                          ? activePortal === 'agent'
                            ? 'text-emerald-400'
                            : activePortal === 'manager'
                            ? 'text-blue-400'
                            : 'text-purple-400'
                          : 'text-slate-700'
                      }`}
                    />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Form - Note: NO ROLE IDENTIFICATION DROPDOWN / TAG */}
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Account Selection / Code */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                {portalConfig.accountLabel}
              </label>
              <select
                id="portal-user-select"
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer font-medium"
              >
                {portalUsers.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.agentCode})
                  </option>
                ))}
              </select>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                {t.passwordLabel} *
              </label>
              <div className="relative">
                <input
                  id="portal-password-input"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white outline-none focus:ring-2 focus:ring-emerald-500 font-mono-code"
                />
                <Lock className="w-3.5 h-3.5 text-slate-500 absolute right-3.5 top-3" />
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 bg-rose-950/50 border border-rose-800 rounded-xl text-xs text-rose-300">
                {errorMsg}
              </div>
            )}

            <button
              id="portal-submit-btn"
              type="submit"
              className={`w-full py-3 px-4 rounded-xl text-xs font-bold text-white transition flex items-center justify-center gap-2 shadow-lg cursor-pointer ${portalConfig.submitBtnClass}`}
            >
              <span>{t.loginBtn}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </main>

      {/* Footer Branding */}
      <footer className="relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-6 py-4 text-center text-xs text-slate-500 border-t border-slate-900">
        <p>
          © {new Date().getFullYear()} <strong>Noxora Tech Solutions</strong>. All Rights Reserved. • Intercity Passenger Transport Management System.
        </p>
      </footer>
    </div>
  );
};
