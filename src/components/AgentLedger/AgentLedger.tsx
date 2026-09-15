import React, { useState } from 'react';
import { useTransport } from '../../context/TransportContext';
import { Ticket, PaymentMethod } from '../../types';
import {
  Wallet,
  Receipt,
  Printer,
  XCircle,
  Clock,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  Smartphone,
  Banknote,
  Building2,
  Users,
  Shield,
  Briefcase,
  UserCheck,
  Edit3,
  Save,
  X,
  Layers,
  CheckSquare,
  Square,
} from 'lucide-react';

export const AgentLedger: React.FC = () => {
  const {
    t,
    language,
    currentUser,
    users,
    tickets,
    cancelTicket,
    updateTicket,
    setTicketForPrint,
    setTicketsForPrint,
  } = useTransport();

  const [paymentFilter, setPaymentFilter] = useState<string>('all');
  const [searchFilter, setSearchFilter] = useState<string>('');
  // Multi-ticket selection for batch print
  const [selectedTicketIds, setSelectedTicketIds] = useState<string[]>([]);
  // Admin Seller Filter: 'all' | 'agents' | 'managers' | specific user id
  const [sellerFilter, setSellerFilter] = useState<string>('all');

  // Admin Ticket Editing Modal State
  const [editingTicket, setEditingTicket] = useState<Ticket | null>(null);
  const [editFormData, setEditFormData] = useState<{
    passengerName: string;
    passengerPhone: string;
    paymentMethod: PaymentMethod;
    status: 'active' | 'boarded' | 'cancelled' | 'refunded';
    agentId: string;
  }>({
    passengerName: '',
    passengerPhone: '',
    paymentMethod: 'cash',
    status: 'active',
    agentId: '',
  });

  const isAdmin = currentUser.role === 'admin';

  const handleOpenEditModal = (tk: Ticket) => {
    setEditingTicket(tk);
    setEditFormData({
      passengerName: tk.passengerName,
      passengerPhone: tk.passengerPhone,
      paymentMethod: tk.paymentMethod,
      status: tk.status,
      agentId: tk.agentId,
    });
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTicket) return;

    const assignedUser = users.find((u) => u.id === editFormData.agentId);

    updateTicket(editingTicket.id, {
      passengerName: editFormData.passengerName,
      passengerPhone: editFormData.passengerPhone,
      paymentMethod: editFormData.paymentMethod,
      status: editFormData.status,
      ...(assignedUser
        ? {
            agentId: assignedUser.id,
            agentName: assignedUser.name,
            agentCode: assignedUser.agentCode,
          }
        : {}),
    });

    setEditingTicket(null);
  };

  // Base tickets determined by role & admin seller filter
  const filteredBySellerTickets = tickets.filter((tk) => {
    if (!isAdmin) {
      // Non-admin sees their own shift sales
      return tk.agentId === currentUser.id || tk.agentCode === currentUser.agentCode;
    }

    // Admin seller filter
    if (sellerFilter === 'all') return true;
    if (sellerFilter === 'agents') {
      const agentUserIds = users.filter((u) => u.role === 'agent').map((u) => u.id);
      const agentCodes = users.filter((u) => u.role === 'agent').map((u) => u.agentCode);
      return agentUserIds.includes(tk.agentId) || agentCodes.includes(tk.agentCode);
    }
    if (sellerFilter === 'managers') {
      const managerUserIds = users.filter((u) => u.role === 'manager').map((u) => u.id);
      const managerCodes = users.filter((u) => u.role === 'manager').map((u) => u.agentCode);
      return managerUserIds.includes(tk.agentId) || managerCodes.includes(tk.agentCode);
    }
    // Specific user ID
    return tk.agentId === sellerFilter;
  });

  const activeTickets = filteredBySellerTickets.filter(
    (tk) => tk.status !== 'cancelled' && tk.status !== 'refunded'
  );

  // Financial Metrics Breakdown
  const totalTicketsIssued = activeTickets.length;

  const cashTotal = activeTickets
    .filter((tk) => tk.paymentMethod === 'cash')
    .reduce((sum, tk) => sum + tk.totalAmount, 0);

  const telebirrTotal = activeTickets
    .filter((tk) => tk.paymentMethod === 'telebirr')
    .reduce((sum, tk) => sum + tk.totalAmount, 0);

  const cbeTotal = activeTickets
    .filter((tk) => tk.paymentMethod === 'cbe' || tk.paymentMethod === 'cbe_birr')
    .reduce((sum, tk) => sum + tk.totalAmount, 0);

  const abyssiniaTotal = activeTickets
    .filter((tk) => tk.paymentMethod === 'abyssinia' || tk.paymentMethod === 'bank_card')
    .reduce((sum, tk) => sum + tk.totalAmount, 0);

  const grandTotal = cashTotal + telebirrTotal + cbeTotal + abyssiniaTotal;

  // Search & Payment filter
  const displayedTickets = filteredBySellerTickets.filter((tk) => {
    if (paymentFilter !== 'all') {
      if (paymentFilter === 'cbe' && tk.paymentMethod !== 'cbe' && tk.paymentMethod !== 'cbe_birr') return false;
      if (paymentFilter === 'abyssinia' && tk.paymentMethod !== 'abyssinia' && tk.paymentMethod !== 'bank_card') return false;
      if (paymentFilter !== 'cbe' && paymentFilter !== 'abyssinia' && tk.paymentMethod !== paymentFilter) return false;
    }
    if (searchFilter) {
      const q = searchFilter.toLowerCase();
      return (
        tk.ticketNumber.toLowerCase().includes(q) ||
        tk.passengerName.toLowerCase().includes(q) ||
        tk.passengerPhone.toLowerCase().includes(q) ||
        tk.vehiclePlateNumber.toLowerCase().includes(q) ||
        tk.agentName.toLowerCase().includes(q) ||
        tk.agentCode.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Batch print handlers
  const handleToggleSelectTicket = (id: string) => {
    setSelectedTicketIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const isAllDisplayedSelected =
    displayedTickets.length > 0 &&
    displayedTickets.every((tk) => selectedTicketIds.includes(tk.id));

  const handleToggleSelectAll = () => {
    if (isAllDisplayedSelected) {
      const displayedIds = new Set(displayedTickets.map((tk) => tk.id));
      setSelectedTicketIds((prev) => prev.filter((id) => !displayedIds.has(id)));
    } else {
      const displayedIds = displayedTickets.map((tk) => tk.id);
      setSelectedTicketIds((prev) => Array.from(new Set([...prev, ...displayedIds])));
    }
  };

  const handleBatchPrint = () => {
    const selectedTickets = tickets.filter((tk) => selectedTicketIds.includes(tk.id));
    if (selectedTickets.length > 0) {
      setTicketsForPrint(selectedTickets);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold">
            <Wallet className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white">{t.agentLedgerTitle}</h2>
              <span className="text-xs font-mono-code bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded border border-emerald-700 font-bold">
                {currentUser.agentCode}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {currentUser.name} ({language === 'am' ? currentUser.nameAm : currentUser.name}) •{' '}
              {isAdmin ? (
                <span className="text-purple-400 font-semibold">Admin Audit Mode</span>
              ) : (
                'Shift Active'
              )}
            </p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[11px] text-slate-400 block uppercase font-bold">
            {t.grandTotalRevenue}:
          </span>
          <span className="text-2xl font-black font-mono-code text-emerald-400">
            {grandTotal.toLocaleString()} <span className="text-xs font-normal">{t.currency}</span>
          </span>
        </div>
      </div>

      {/* Admin Seller Filter Strip (Only shown for Admin) */}
      {isAdmin && (
        <div className="bg-white rounded-2xl p-4 border border-purple-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold shadow-sm">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900 block">
                  {t.sellerFilterLabel}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-purple-100 text-purple-800">
                  {language === 'am' ? 'የአስተዳዳሪ ማጣሪያ' : 'Admin Control'}
                </span>
              </div>
              <span className="text-[11px] text-slate-500">
                {language === 'am'
                  ? 'በወኪሎች (Agents) እና በስራ አስኪያጆች (Managers) መካከል መርጠው የፈረቃ ሽያጭን ይቆጣጠሩ እና ያስተካክሉ'
                  : 'Choose between Agents and Managers to audit, filter, and edit shift sales records'}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {/* Quick Segment Buttons */}
            <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200 text-xs font-bold">
              <button
                type="button"
                onClick={() => setSellerFilter('all')}
                className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                  sellerFilter === 'all'
                    ? 'bg-white text-purple-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {t.allSellers}
              </button>
              <button
                type="button"
                onClick={() => setSellerFilter('agents')}
                className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1 ${
                  sellerFilter === 'agents'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>{t.allAgentsOnly}</span>
              </button>
              <button
                type="button"
                onClick={() => setSellerFilter('managers')}
                className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1 ${
                  sellerFilter === 'managers'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Briefcase className="w-3.5 h-3.5" />
                <span>{t.allManagersOnly}</span>
              </button>
            </div>

            {/* Specific Staff Select */}
            <select
              id="admin-seller-filter-select"
              value={sellerFilter}
              onChange={(e) => setSellerFilter(e.target.value)}
              className="bg-slate-50 border border-purple-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer shadow-sm"
            >
              <option value="all">{language === 'am' ? 'ሁሉንም ተጠቃሚዎች' : 'All Staff Members'}</option>
              <optgroup label={language === 'am' ? 'ወኪሎች (Agents)' : 'Agents'}>
                {users
                  .filter((u) => u.role === 'agent')
                  .map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.agentCode})
                    </option>
                  ))}
              </optgroup>
              <optgroup label={language === 'am' ? 'ስራ አስኪያጆች (Managers)' : 'Managers'}>
                {users
                  .filter((u) => u.role === 'manager')
                  .map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.agentCode})
                    </option>
                  ))}
              </optgroup>
            </select>
          </div>
        </div>
      )}

      {/* Financial Metric Cards (Cash, Telebirr, CBE, Abyssinia) */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {/* Tickets Sold */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-500 block uppercase">
              {t.ticketsSoldToday}
            </span>
            <span className="text-2xl font-black font-mono-code text-slate-900 mt-1 block">
              {totalTicketsIssued}
            </span>
          </div>
          <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
            <Receipt className="w-4 h-4" />
          </div>
        </div>

        {/* Cash in Drawer */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-emerald-700 block uppercase truncate">
              {t.totalCashCollected}
            </span>
            <span className="text-xl font-black font-mono-code text-slate-900 mt-1 block">
              {cashTotal.toLocaleString()} <span className="text-[10px] text-slate-500 font-normal">ETB</span>
            </span>
          </div>
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Banknote className="w-4 h-4" />
          </div>
        </div>

        {/* Telebirr Total */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-sky-700 block uppercase truncate">
              {t.totalTelebirrCollected}
            </span>
            <span className="text-xl font-black font-mono-code text-slate-900 mt-1 block">
              {telebirrTotal.toLocaleString()} <span className="text-[10px] text-slate-500 font-normal">ETB</span>
            </span>
          </div>
          <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
            <Smartphone className="w-4 h-4" />
          </div>
        </div>

        {/* CBE Total */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-purple-700 block uppercase truncate">
              {t.totalCbeCollected}
            </span>
            <span className="text-xl font-black font-mono-code text-slate-900 mt-1 block">
              {cbeTotal.toLocaleString()} <span className="text-[10px] text-slate-500 font-normal">ETB</span>
            </span>
          </div>
          <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Building2 className="w-4 h-4" />
          </div>
        </div>

        {/* Abyssinia Total */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex items-center justify-between col-span-2 lg:col-span-1">
          <div>
            <span className="text-[11px] font-bold text-amber-700 block uppercase truncate">
              {t.totalAbyssiniaCollected}
            </span>
            <span className="text-xl font-black font-mono-code text-slate-900 mt-1 block">
              {abyssiniaTotal.toLocaleString()} <span className="text-[10px] text-slate-500 font-normal">ETB</span>
            </span>
          </div>
          <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Wallet className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Tickets List Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-md overflow-hidden">
        {/* Table Filter Toolbar */}
        <div className="p-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-slate-50">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-900">{t.recentTicketsIssued}</h3>
            <span className="text-xs bg-slate-200 text-slate-700 font-mono-code px-2 py-0.5 rounded-full font-bold">
              {displayedTickets.length}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Search ticket, name, plate, seller..."
                className="pl-8 pr-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none w-48 sm:w-60 font-medium"
              />
            </div>

            {/* Payment Filter */}
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-900 outline-none cursor-pointer font-medium"
            >
              <option value="all">All Payment Methods</option>
              <option value="cash">Cash only</option>
              <option value="telebirr">Telebirr only</option>
              <option value="cbe">CBE only</option>
              <option value="abyssinia">Abyssinia only</option>
            </select>
          </div>
        </div>

        {/* Batch Print Action Banner */}
        {selectedTicketIds.length > 0 && (
          <div className="bg-emerald-950 text-white px-4 py-3 flex flex-wrap items-center justify-between gap-3 border-b border-emerald-800 animate-in fade-in duration-150">
            <div className="flex items-center gap-2.5 text-xs">
              <span className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center justify-center font-bold">
                <Layers className="w-4 h-4" />
              </span>
              <div>
                <span className="font-bold text-white">
                  {selectedTicketIds.length} {t.ticketsSelectedCount || 'tickets selected'}
                </span>
                <span className="text-emerald-300 text-[11px] block sm:inline sm:ml-2">
                  ({language === 'am' ? 'ሁሉንም በአንድ ላይ ለማተም ዝግጁ' : 'Ready to batch print into single document'})
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleBatchPrint}
                className="flex items-center gap-1.5 px-4 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-xs font-bold transition shadow cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>
                  {t.printAllInOne || 'Print All in One'} ({selectedTicketIds.length})
                </span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedTicketIds([])}
                className="px-3 py-1.5 bg-emerald-900/60 hover:bg-emerald-900 text-emerald-200 rounded-xl text-xs font-semibold transition border border-emerald-700 cursor-pointer"
              >
                {t.deselectAllTickets || 'Deselect All'}
              </button>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900 text-white font-bold uppercase text-[10px]">
              <tr>
                <th className="py-3 px-3 w-10 text-center">
                  <button
                    type="button"
                    onClick={handleToggleSelectAll}
                    className="cursor-pointer text-slate-300 hover:text-white transition inline-flex items-center justify-center"
                    title={isAllDisplayedSelected ? (t.deselectAllTickets || 'Deselect All') : (t.selectAllTickets || 'Select All')}
                  >
                    {isAllDisplayedSelected ? (
                      <CheckSquare className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-400" />
                    )}
                  </button>
                </th>
                <th className="py-3 px-3">{t.ticketNumber}</th>
                {isAdmin && <th className="py-3 px-3">{t.sellerLabel}</th>}
                <th className="py-3 px-3">{t.passengerLabel}</th>
                <th className="py-3 px-3">{t.seatNumberLabel}</th>
                <th className="py-3 px-3">{t.plateNumber}</th>
                <th className="py-3 px-3">{t.routeLabel}</th>
                <th className="py-3 px-3">{t.departureTime}</th>
                <th className="py-3 px-3">{t.paymentModeLabel}</th>
                <th className="py-3 px-3">{t.amountPaidLabel}</th>
                <th className="py-3 px-3">{t.currentStatus}</th>
                <th className="py-3 px-4 text-right">{t.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {displayedTickets.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 12 : 11} className="py-8 text-center text-slate-400 italic">
                    {language === 'am'
                      ? 'በዚህ መስፈርት የተገኘ ትኬት የለም'
                      : 'No tickets match your search filters.'}
                  </td>
                </tr>
              ) : (
                displayedTickets.map((tk) => {
                  const isSelected = selectedTicketIds.includes(tk.id);
                  return (
                    <tr
                      key={tk.id}
                      className={`hover:bg-slate-50 transition ${
                        isSelected ? 'bg-emerald-50/70' : ''
                      }`}
                    >
                      <td className="py-3 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleSelectTicket(tk.id)}
                          className="cursor-pointer text-slate-400 hover:text-slate-700 transition inline-flex items-center justify-center"
                          title={isSelected ? 'Deselect' : 'Select for batch print'}
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-300" />
                          )}
                        </button>
                      </td>
                      <td className="py-3 px-3 font-mono-code font-bold text-slate-950">
                        {tk.ticketNumber}
                      </td>
                      {isAdmin && (
                        <td className="py-3 px-3 font-semibold text-slate-800">
                          <div className="text-xs">{tk.agentName}</div>
                          <div className="text-[10px] text-slate-500 font-mono-code">
                            {tk.agentCode}
                          </div>
                        </td>
                      )}
                    <td className="py-3 px-3 font-semibold text-slate-900">
                      <div>{tk.passengerName}</div>
                      <div className="text-[10px] text-slate-500 font-mono-code">{tk.passengerPhone}</div>
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-mono-code font-bold bg-slate-100 text-slate-900 px-2 py-0.5 rounded border border-slate-300">
                        #{tk.seatNumber < 10 ? `0${tk.seatNumber}` : tk.seatNumber}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono-code text-slate-700 font-semibold">
                      {tk.vehiclePlateNumber}
                    </td>
                    <td className="py-3 px-3 font-medium text-slate-800">
                      {language === 'am'
                        ? `${tk.originCityAm} ➔ ${tk.destinationCityAm}`
                        : `${tk.originCityEn} ➔ ${tk.destinationCityEn}`}
                    </td>
                    <td className="py-3 px-3 font-mono-code text-slate-700">
                      {tk.departureDate} <span className="font-bold">{tk.departureTime}</span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-bold text-[10px] uppercase bg-slate-100 px-2 py-0.5 rounded">
                        {tk.paymentMethod}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono-code font-bold text-slate-950">
                      {tk.totalAmount} ETB
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          tk.status === 'boarded'
                            ? 'bg-emerald-100 text-emerald-800'
                            : tk.status === 'active'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {tk.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right space-x-1 whitespace-nowrap">
                      {isAdmin && (
                        <button
                          onClick={() => handleOpenEditModal(tk)}
                          className="px-2.5 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-lg text-xs font-bold transition cursor-pointer"
                          title={language === 'am' ? 'የሽያጭ መረጃ አስተካክል' : 'Edit Sale Record'}
                        >
                          <Edit3 className="w-3.5 h-3.5 inline mr-1" />
                          <span>{language === 'am' ? 'አስተካክል' : 'Edit'}</span>
                        </button>
                      )}
                      <button
                        onClick={() => setTicketForPrint(tk)}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-bold transition cursor-pointer"
                        title={t.reprintTicket}
                      >
                        <Printer className="w-3.5 h-3.5 inline mr-1" />
                        <span>Print</span>
                      </button>
                      {tk.status === 'active' && (
                        <button
                          onClick={() => cancelTicket(tk.id)}
                          className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-xs font-semibold transition cursor-pointer"
                          title={t.cancelTicket}
                        >
                          <XCircle className="w-3.5 h-3.5 inline mr-1" />
                          <span>{t.cancelTicket}</span>
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Admin Edit Shift Sale Modal */}
      {isAdmin && editingTicket && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                  <Edit3 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    {language === 'am' ? 'የፈረቃ ሽያጭ መረጃ ማስተካከያ' : 'Edit Shift Sale Record'}
                  </h3>
                  <span className="text-[11px] font-mono-code text-purple-600 font-bold">
                    {editingTicket.ticketNumber} • {editingTicket.vehiclePlateNumber} (Seat #{editingTicket.seatNumber})
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingTicket(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              {/* Passenger Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {language === 'am' ? 'የተሳፋሪ ስም (አስገዳጅ አይደለም)' : 'Passenger Name (Optional)'}
                </label>
                <input
                  type="text"
                  value={editFormData.passengerName}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, passengerName: e.target.value })
                  }
                  placeholder="e.g. Almaz Bekele"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 outline-none focus:ring-2 focus:ring-purple-500 font-medium"
                />
              </div>

              {/* Passenger Phone */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {language === 'am' ? 'ስልክ ቁጥር (አስገዳጅ አይደለም)' : 'Phone Number (Optional)'}
                </label>
                <input
                  type="text"
                  value={editFormData.passengerPhone}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, passengerPhone: e.target.value })
                  }
                  placeholder="09..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 outline-none focus:ring-2 focus:ring-purple-500 font-mono-code"
                />
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {language === 'am' ? 'የክፍያ ዘዴ (Payment Method)' : 'Payment Method'}
                </label>
                <select
                  value={editFormData.paymentMethod}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      paymentMethod: e.target.value as PaymentMethod,
                    })
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer font-medium"
                >
                  <option value="cash">{language === 'am' ? 'በጥሬ ገንዘብ (Cash)' : 'Cash'}</option>
                  <option value="telebirr">ቴሌብር (Telebirr)</option>
                  <option value="cbe">ሲቢኢ (CBE / Commercial Bank of Ethiopia)</option>
                  <option value="abyssinia">አቢሲንያ (Bank of Abyssinia)</option>
                </select>
              </div>

              {/* Reassign Seller (Agent or Manager) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {language === 'am' ? 'የሸጠው ሰራተኛ (Seller Reassignment)' : 'Assigned Seller (Agent / Manager)'}
                </label>
                <select
                  value={editFormData.agentId}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, agentId: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer font-medium"
                >
                  <optgroup label={language === 'am' ? 'ወኪሎች (Agents)' : 'Agents'}>
                    {users
                      .filter((u) => u.role === 'agent')
                      .map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.name} ({u.agentCode})
                        </option>
                      ))}
                  </optgroup>
                  <optgroup label={language === 'am' ? 'ስራ አስኪያጆች (Managers)' : 'Managers'}>
                    {users
                      .filter((u) => u.role === 'manager')
                      .map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.name} ({u.agentCode})
                        </option>
                      ))}
                  </optgroup>
                </select>
              </div>

              {/* Status */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {language === 'am' ? 'የቲኬት ሁኔታ (Status)' : 'Ticket Status'}
                </label>
                <select
                  value={editFormData.status}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      status: e.target.value as 'active' | 'boarded' | 'cancelled',
                    })
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer font-medium"
                >
                  <option value="active">{language === 'am' ? 'ትክክለኛ (Active)' : 'Active'}</option>
                  <option value="boarded">{language === 'am' ? 'ተሳፍሯል (Boarded / Inactive)' : 'Boarded (Inactive)'}</option>
                  <option value="cancelled">{language === 'am' ? 'የተሰረዘ (Cancelled)' : 'Cancelled'}</option>
                </select>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingTicket(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  {language === 'am' ? 'ተመለስ' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shadow-md shadow-purple-950/20"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{language === 'am' ? 'ለውጦችን መዝግብ' : 'Save Changes'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
