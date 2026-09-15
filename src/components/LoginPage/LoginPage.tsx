import React, { useState, useEffect } from 'react';
import { useTransport } from '../../context/TransportContext';
import { Role, User } from '../../types';
import {
  Shield,
  Briefcase,
  Ticket as TicketIcon,
  Lock,
  ArrowRight,
  Globe,
  CheckCircle2,
  Cpu,
  Check,
  Eye,
  EyeOff,
  AlertTriangle,
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { t, language, setLanguage, users, login } = useTransport();

  const [activePortal, setActivePortal] = useState<Role>('agent');
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Personnel for active portal
  const portalUsers = users.filter((u) => u.role === activePortal && u.active);

  // Sync first user when switching portals
  useEffect(() => {
    if (portalUsers.length > 0) {
      setSelectedUserId(portalUsers[0].id);
    }
    setErrorMsg('');
    setPassword('');
  }, [activePortal]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    const userToLogin = users.find((u) => u.id === selectedUserId);
    if (!userToLogin || userToLogin.role !== activePortal) {
      setErrorMsg(
        language === 'am'
          ? 'ይህ አካውንት ለዚህ መግቢያ በር አልተፈቀደም።'
          : 'Unauthorized account for this portal.'
      );
      return;
    }

    if (!password.trim()) {
      setErrorMsg(language === 'am' ? 'የይለፍ ቃል ያስፈልጋል።' : 'Password is required.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const result = await login(userToLogin, password);

      if (!result.success) {
        setErrorMsg(
          result.error ||
            (language === 'am' ? 'የይለፍ ቃሉ ትክክል አይደለም።' : 'Incorrect password.')
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Visual theming per portal
  const portalConfig = {
    agent: {
      bgGlow: 'bg-emerald-500/10',
      activeTabClass: 'bg-emerald-600 text-white shadow-lg shadow-emerald-950/80',
      submitBtnClass: 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-950/60',
      ringClass: 'ring-emerald-500',
      borderSelected: 'border-emerald-500 ring-1 ring-emerald-500',
      bgSelected: 'bg-emerald-950/50',
      checkColor: 'text-emerald-400',
      focusRing: 'focus:ring-emerald-500',
      icon: TicketIcon,
      badgeText: language === 'am' ? 'የትኬት ወኪል መግቢያ' : 'Ticketing Agent Login',
      pageTitle: language === 'am' ? 'የቲኬት ቆራጭ ወኪል ተርሚናል' : 'Ticketing Agent Terminal',
      pageSubtitle:
        language === 'am'
          ? 'Addis Ababa Central Station Counter & Ticket Issuance Portal'
          : 'Addis Ababa Central Station Counter & Ticket Issuance Portal',
      permittedFeatures:
        language === 'am'
          ? ['Ticket Counter', 'Verify & Scan Ticket', 'My Shift Sales']
          : ['Ticket Counter', 'Verify & Scan Ticket', 'My Shift Sales'],
      accountLabel: language === 'am' ? 'የትኬት ወኪል *' : 'Agent Staff *',
    },
    manager: {
      bgGlow: 'bg-blue-500/10',
      activeTabClass: 'bg-blue-600 text-white shadow-lg shadow-blue-950/80',
      submitBtnClass: 'bg-blue-600 hover:bg-blue-500 shadow-blue-950/60',
      ringClass: 'ring-blue-500',
      borderSelected: 'border-blue-500 ring-1 ring-blue-500',
      bgSelected: 'bg-blue-950/50',
      checkColor: 'text-blue-400',
      focusRing: 'focus:ring-blue-500',
      icon: Briefcase,
      badgeText: language === 'am' ? 'የጣቢያ ስራ አስኪያጅ' : 'Station Manager Login',
      pageTitle: language === 'am' ? 'የጣቢያ ስራ አስኪያጅ ኮንሶል' : 'Station Manager Console',
      pageSubtitle:
        language === 'am'
          ? 'Dispatch Operations, Manifest, Fleet Monitoring'
          : 'Dispatch Operations, Passenger Manifest, Fleet Monitoring',
      permittedFeatures:
        language === 'am'
          ? ['Ticket Counter', 'Dispatch & Manifest', 'Verify Ticket', 'Bus Route Control']
          : ['Ticket Counter', 'Dispatch & Manifest', 'Verify Ticket', 'Bus Route Control'],
      accountLabel: language === 'am' ? 'የስራ አስኪያጅ *' : 'Manager Staff *',
    },
    admin: {
      bgGlow: 'bg-purple-500/10',
      activeTabClass: 'bg-purple-600 text-white shadow-lg shadow-purple-950/80',
      submitBtnClass: 'bg-purple-600 hover:bg-purple-500 shadow-purple-950/60',
      ringClass: 'ring-purple-500',
      borderSelected: 'border-purple-500 ring-1 ring-purple-500',
      bgSelected: 'bg-purple-950/50',
      checkColor: 'text-purple-400',
      focusRing: 'focus:ring-purple-500',
      icon: Shield,
      badgeText: language === 'am' ? 'ሲስተም አስተዳዳሪ' : 'Admin Console',
      pageTitle: language === 'am' ? 'የሲስተም አስተዳዳሪ ኮንሶል' : 'System Administrator Console',
      pageSubtitle:
        language === 'am'
          ? 'Full System Control, Audit, Fleet & Routes'
          : 'Full System Control, Multi-Seller Audit, Fleet & Tariffs',
      permittedFeatures:
        language === 'am'
          ? ['Full System Access', 'Fleet CRUD', 'Routes & Tariffs', 'Shift Sales Audit']
          : ['Full System Access', 'Fleet Management', 'Routes & Tariffs', 'Sales Audit'],
      accountLabel: language === 'am' ? 'አስተዳዳሪ *' : 'Administrator *',
    },
  }[activePortal];

  const CurrentIcon = portalConfig.icon;
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between relative overflow-hidden font-sans">
      {/* Background glows */}
      <div
        className={`absolute -top-40 -left-40 w-96 h-96 ${portalConfig.bgGlow} rounded-full blur-3xl pointer-events-none transition-all duration-500`}
      />
      <div className="absolute top-1/3 -right-40 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-slate-800/20 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
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

        {/* Security badge */}
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-emerald-950/50 border border-emerald-800/50 rounded-lg">
            <Shield className="w-3 h-3 text-emerald-400" />
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
              Secured
            </span>
          </div>
          <button
            onClick={() => setLanguage(language === 'am' ? 'en' : 'am')}
            className="flex items-center gap-2 px-3.5 py-1.5 bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white rounded-xl transition cursor-pointer shadow-sm"
          >
            <Globe className="w-3.5 h-3.5 text-emerald-400" />
            <span>{t.switchLanguage}</span>
          </button>
        </div>
      </header>

      {/* Main form */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-8">
        <div className="max-w-xl w-full bg-slate-900/95 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/70">

          {/* Portal Selector Tabs */}
          <div className="mb-6">
            <div className="text-center mb-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                {language === 'am' ? 'የተለዩ የመግቢያ በሮች' : 'Select Your Designated Login Portal'}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 p-1.5 bg-slate-950/90 border border-slate-800 rounded-2xl">
              {(['agent', 'manager', 'admin'] as Role[]).map((role) => {
                const icons = { agent: TicketIcon, manager: Briefcase, admin: Shield };
                const labels = {
                  agent: language === 'am' ? 'ወኪል' : 'Agent',
                  manager: language === 'am' ? 'ስራ አስኪያጅ' : 'Manager',
                  admin: language === 'am' ? 'አስተዳዳሪ' : 'Admin',
                };
                const activeClasses = {
                  agent: 'bg-emerald-600 text-white shadow-md shadow-emerald-950',
                  manager: 'bg-blue-600 text-white shadow-md shadow-blue-950',
                  admin: 'bg-purple-600 text-white shadow-md shadow-purple-950',
                };
                const RoleIcon = icons[role];
                return (
                  <button
                    key={role}
                    id={`portal-tab-${role}`}
                    type="button"
                    onClick={() => setActivePortal(role)}
                    className={`flex flex-col items-center justify-center py-2.5 px-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                      activePortal === role
                        ? activeClasses[role]
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
                    }`}
                  >
                    <RoleIcon className="w-4 h-4 mb-1" />
                    <span>{labels[role]}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Portal Badge & Title */}
          <div className="text-center mb-5">
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

          {/* Permitted Features */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-3.5 mb-5 text-xs">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-2 tracking-wider">
              {language === 'am' ? 'የተፈቀዱ ሞጁሎች:' : 'Authorized Functional Scope:'}
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

          {/* Personnel Selector */}
          <div className="mb-5">
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              {language === 'am' ? 'ተፈቅዶ ለተሰጣቸው ሰዎች:' : 'Authorized Personnel:'}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {portalUsers.map((u: User) => {
                const isSelected = selectedUserId === u.id;
                return (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => {
                      setSelectedUserId(u.id);
                      setErrorMsg('');
                      setPassword('');
                    }}
                    className={`flex items-center justify-between p-3 rounded-2xl border text-left transition cursor-pointer relative ${
                      isSelected
                        ? `${portalConfig.bgSelected} ${portalConfig.borderSelected} text-white`
                        : 'bg-slate-950/40 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-white">
                        {u.avatar || u.name.charAt(0)}
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
                        isSelected ? portalConfig.checkColor : 'text-slate-700'
                      }`}
                    />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Account dropdown */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                {portalConfig.accountLabel}
              </label>
              <select
                id="portal-user-select"
                value={selectedUserId}
                onChange={(e) => {
                  setSelectedUserId(e.target.value);
                  setErrorMsg('');
                  setPassword('');
                }}
                className={`w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white outline-none focus:ring-2 ${portalConfig.focusRing} cursor-pointer font-medium`}
              >
                {portalUsers.map((u: User) => (
                  <option key={u.id} value={u.id}>
                    {u.name} — {u.agentCode}
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
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setErrorMsg('');
                  }}
                  disabled={isSubmitting}
                  placeholder={
                    language === 'am'
                      ? 'የይለፍ ቃልዎን ያስገቡ'
                      : 'Enter your password'
                  }
                  className={`w-full px-3.5 py-2.5 pr-20 bg-slate-950 border rounded-xl text-xs text-white outline-none focus:ring-2 ${portalConfig.focusRing} font-mono-code disabled:opacity-50 disabled:cursor-not-allowed ${
                    errorMsg ? 'border-rose-700' : 'border-slate-800'
                  }`}
                />
                <div className="absolute right-3 top-2.5 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowPassword((p) => !p)}
                    className="text-slate-500 hover:text-slate-300 transition cursor-pointer"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="w-3.5 h-3.5" />
                    ) : (
                      <Eye className="w-3.5 h-3.5" />
                    )}
                  </button>
                  <Lock className="w-3.5 h-3.5 text-slate-600" />
                </div>
              </div>
              <p className="text-[10px] text-slate-500 mt-1 flex items-center gap-1">
                <Shield className="w-2.5 h-2.5 text-emerald-600" />
                {language === 'am'
                  ? 'ይለፍ ቃሉ በከፍተኛ ምስጠራ (SHA-256) የተጠበቀ ነው'
                  : 'Password is securely verified via SHA-256 cryptographic hashing'}
              </p>
            </div>

            {/* Error message */}
            {errorMsg && (
              <div className="p-3 bg-rose-950/50 border border-rose-800 rounded-xl flex items-start gap-2.5 text-xs text-rose-300">
                <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Submit */}
            <button
              id="portal-submit-btn"
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-3 px-4 rounded-xl text-xs font-bold text-white transition flex items-center justify-center gap-2 shadow-lg cursor-pointer ${portalConfig.submitBtnClass} disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>{language === 'am' ? 'እየተረጋጋ ነው...' : 'Verifying...'}</span>
                </>
              ) : (
                <>
                  <span>{t.loginBtn}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Security notice */}
            <div className="flex items-center justify-center gap-2 pt-1">
              <Shield className="w-3 h-3 text-slate-600" />
              <p className="text-[10px] text-slate-600 text-center">
                {language === 'am'
                  ? 'ሁሉም ግቤቶች ምስጠራ ተደርገው ይቀመጣሉ • ያልተፈቀዱ ሙከራዎች ይመዘገባሉ'
                  : 'All sessions encrypted & monitored • Unauthorized attempts are logged'}
              </p>
            </div>
          </form>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-6 py-4 text-center text-xs text-slate-500 border-t border-slate-900">
        <p>
          © {new Date().getFullYear()} <strong>Noxora Tech Solutions</strong>. All Rights Reserved.
          • Intercity Passenger Transport Management System.
        </p>
      </footer>
    </div>
  );
};
