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
import { Cpu } from 'lucide-react';

const AppContent: React.FC = () => {
  const {
    isAuthenticated,
    currentUser,
    activeTab,
    setActiveTab,
    ticketsForPrint,
    setTicketsForPrint,
    language,
  } = useTransport();

  // Permission Guard: if the current user tries to view an unauthorized tab, redirect to permitted home
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

  // If user is not authenticated, render the dedicated multi-role Login Portal
  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-900 selection:bg-emerald-500 selection:text-white">
      {/* Top Navigation Bar */}
      <Navbar />

      {/* Main Content Area */}
      <main className="flex-1 pb-16">
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
