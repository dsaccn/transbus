/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { TransportProvider, useTransport } from './context/TransportContext';
import { Navbar } from './components/Navbar';
import { LoginPage } from './components/LoginPage/LoginPage';
import { TicketCounter } from './components/TicketCounter/TicketCounter';
import { ManagerDispatch } from './components/ManagerDispatch/ManagerDispatch';
import { TicketVerifier } from './components/TicketVerifier/TicketVerifier';
import { AgentLedger } from './components/AgentLedger/AgentLedger';
import { FleetManagement } from './components/FleetManagement/FleetManagement';
import { RouteManagement } from './components/RouteManagement/RouteManagement';
import { BusRouteControl } from './components/BusRouteControl/BusRouteControl';
import { AdminPanel } from './components/AdminPanel/AdminPanel';
import { TicketModal } from './components/TicketModal';
import { Cpu, Timer, LogOut, ShieldAlert } from 'lucide-react';
import { useInactivityLogout } from './security/useInactivityLogout';

const AppContent: React.FC = () => {
  const {
    isAuthenticated,
    currentUser,
    activeTab,
    setActiveTab,
    ticketsForPrint,
    setTicketsForPrint,
    language,
    logout,
  } = useTransport();

  // Inactivity auto-logout (1 hour)
  const { showWarning, secondsRemaining } = useInactivityLogout({
    isAuthenticated,
    onLogout: logout,
  });

  // Permission Guard: redirect to permitted tab if unauthorized
  useEffect(() => {
    if (!isAuthenticated) return;

    const isTabPermitted = () => {
      if (currentUser.role === 'agent') {
        return ['ticketCounter', 'verifyTicket', 'agentLedger'].includes(activeTab);
      }
      if (currentUser.role === 'manager') {
        return [
          'ticketCounter',
          'dispatchManifest',
          'verifyTicket',
          'agentLedger',
          'busRouteControl',
          'fleet',
        ].includes(activeTab);
      }
      return true; // Admin has full access
    };

    if (!isTabPermitted()) {
      setActiveTab('ticketCounter');
    }
  }, [isAuthenticated, currentUser?.role, activeTab, setActiveTab]);

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-900 selection:bg-emerald-500 selection:text-white">
      {/* Inactivity Warning Banner */}
      {showWarning && (
        <div className="fixed top-0 left-0 right-0 z-[999] bg-amber-600 border-b border-amber-500 px-4 py-3 flex items-center justify-between shadow-lg animate-pulse">
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-100 flex-shrink-0" />
            <div>
              <p className="text-xs font-bold text-amber-50">
                {language === 'am' ? 'የሴሽን ማስጠንቀቂያ — ንቁ ካልሆኑ ይወጣሉ' : 'Session Expiring — Inactivity Detected'}
              </p>
              <p className="text-[11px] text-amber-200">
                {language === 'am'
                  ? `ምንም እርምጃ ካልወሰዱ ይህ ሴሽን ይዘጋል`
                  : `You will be automatically logged out due to inactivity`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-amber-700/50 px-3 py-1.5 rounded-lg">
              <Timer className="w-4 h-4 text-amber-200" />
              <span className="font-mono-code font-bold text-amber-100 text-sm">
                {secondsRemaining}s
              </span>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-800 hover:bg-amber-900 text-amber-100 rounded-lg text-xs font-bold transition cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout Now</span>
            </button>
          </div>
        </div>
      )}

      {/* Top Navigation Bar */}
      <Navbar />

      {/* Main Content Area */}
      <main className={`flex-1 pb-16 ${showWarning ? 'pt-14' : ''}`}>
        {activeTab === 'ticketCounter' && <TicketCounter />}
        {activeTab === 'dispatchManifest' && currentUser.role !== 'agent' && <ManagerDispatch />}
        {activeTab === 'verifyTicket' && <TicketVerifier />}
        {activeTab === 'agentLedger' && <AgentLedger />}
        {activeTab === 'busRouteControl' && currentUser.role !== 'agent' && <BusRouteControl />}
        {activeTab === 'fleet' && currentUser.role !== 'agent' && <FleetManagement />}
        {activeTab === 'routes' && currentUser.role === 'admin' && <RouteManagement />}
        {activeTab === 'adminSettings' && currentUser.role === 'admin' && <AdminPanel />}
      </main>

      {/* Global Printable Ticket Modal */}
      <TicketModal
        tickets={ticketsForPrint}
        onClose={() => setTicketsForPrint(null)}
        onNewBooking={() => {
          setTicketsForPrint(null);
          setActiveTab('ticketCounter');
        }}
      />

      {/* Footer */}
      <footer className="no-print bg-slate-900 text-slate-400 text-xs py-6 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-emerald-400">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-slate-200 flex items-center gap-1.5">
                <span>Noxora Tech Solutions</span>
                <span className="text-[10px] text-emerald-400 font-mono-code bg-emerald-950 px-1.5 py-0.2 rounded border border-emerald-800 font-bold">
                  PRO
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {language === 'am'
                  ? 'የከተሞች አቋራጭ የትራንስፖርት እና ዲጂታል ትኬት አስተዳደር ሲስተም'
                  : 'Intercity Passenger Transport & Digital Seat Ticketing Management System'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-slate-400 font-mono-code">
            <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Terminal Gateway Active
            </span>
            <span>•</span>
            <span>ETB / Birr Payment Engine</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <TransportProvider>
      <AppContent />
    </TransportProvider>
  );
}
