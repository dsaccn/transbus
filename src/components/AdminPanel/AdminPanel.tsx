import React, { useState } from 'react';
import { useTransport } from '../../context/TransportContext';
import { User, Role } from '../../types';
import {
  Shield,
  TrendingUp,
  Users,
  Bus,
  DollarSign,
  Plus,
  CheckCircle2,
  XCircle,
  CreditCard,
  Smartphone,
  Banknote,
  Award,
  Calendar,
  X,
} from 'lucide-react';

export const AdminPanel: React.FC = () => {
  const { t, language, users, addUser, updateUser, tickets, routes, trips, vehicles } = useTransport();

  const [showAddUserModal, setShowAddUserModal] = useState<boolean>(false);
  const [name, setName] = useState<string>('');
  const [nameAm, setNameAm] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  const [role, setRole] = useState<Role>('agent');
  const [agentCode, setAgentCode] = useState<string>('');
  const [phone, setPhone] = useState<string>('');

  const activeTickets = tickets.filter((t) => t.status !== 'cancelled' && t.status !== 'refunded');

  // Analytics Metrics
  const totalRevenue = activeTickets.reduce((sum, t) => sum + t.totalAmount, 0);
  const totalTickets = activeTickets.length;
  const totalTripsDispatched = trips.filter((tr) => tr.status === 'departed').length;

  const totalSeatsAcrossFleet = vehicles.reduce((sum, v) => sum + v.totalSeats, 0);
  const averageOccupancy = totalSeatsAcrossFleet > 0
    ? Math.round((totalTickets / totalSeatsAcrossFleet) * 100)
    : 72;

  // Payment Breakdown
  const cashRev = activeTickets.filter((t) => t.paymentMethod === 'cash').reduce((sum, t) => sum + t.totalAmount, 0);
  const telebirrRev = activeTickets.filter((t) => t.paymentMethod === 'telebirr').reduce((sum, t) => sum + t.totalAmount, 0);
  const cbeBirrRev = activeTickets.filter((t) => t.paymentMethod === 'cbe_birr').reduce((sum, t) => sum + t.totalAmount, 0);
  const cardRev = activeTickets.filter((t) => t.paymentMethod === 'bank_card').reduce((sum, t) => sum + t.totalAmount, 0);

  // Top Routes
  const routeSales: { [routeId: string]: { count: number; total: number } } = {};
  activeTickets.forEach((tk) => {
    if (!routeSales[tk.routeId]) {
      routeSales[tk.routeId] = { count: 0, total: 0 };
    }
    routeSales[tk.routeId].count += 1;
    routeSales[tk.routeId].total += tk.totalAmount;
  });

  const rankedRoutes = routes
    .map((r) => ({
      route: r,
      stats: routeSales[r.id] || { count: 0, total: 0 },
    }))
    .sort((a, b) => b.stats.total - a.stats.total);

  // Agent Performance
  const agentStats = users.map((u) => {
    const uTickets = activeTickets.filter((tk) => tk.agentId === u.id || tk.agentCode === u.agentCode);
    const uTotal = uTickets.reduce((sum, tk) => sum + tk.totalAmount, 0);
    return {
      user: u,
      ticketCount: uTickets.length,
      revenue: uTotal,
    };
  });

  const resetUserForm = () => {
    setName('');
    setNameAm('');
    setUsername('');
    setRole('agent');
    setAgentCode('');
    setPhone('');
    setShowAddUserModal(false);
  };

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !agentCode.trim()) return;

    addUser({
      name: name.trim(),
      nameAm: nameAm.trim() || name.trim(),
      username: username.trim() || agentCode.toLowerCase(),
      role,
      agentCode: agentCode.trim().toUpperCase(),
      stationId: 'stn-addis-main',
      phone: phone.trim() || '0911 00 00 00',
      active: true,
      avatar: role === 'agent' ? '🎫' : role === 'manager' ? '👩‍💼' : '👨‍💼',
    });

    resetUserForm();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center font-bold">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">{t.adminDashboardTitle}</h2>
            <p className="text-xs text-slate-400 mt-0.5">{t.adminSubtitle}</p>
          </div>
        </div>

        <button
          id="register-agent-btn"
          onClick={() => setShowAddUserModal(true)}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition shadow-md cursor-pointer flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>{t.addNewAgent}</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Today Total Revenue */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
          <span className="text-xs font-bold text-slate-500 uppercase">{t.todayTotalRevenue}</span>
          <div className="my-2">
            <span className="text-3xl font-black font-mono-code text-slate-900">
              {totalRevenue.toLocaleString()}
            </span>
            <span className="text-xs text-emerald-700 font-bold ml-1">{t.currency}</span>
          </div>
          <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> +18.4% vs yesterday
          </span>
        </div>

        {/* Total Dispatched Trips */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
          <span className="text-xs font-bold text-slate-500 uppercase">{t.totalTripsDeparted}</span>
          <div className="my-2">
            <span className="text-3xl font-black font-mono-code text-slate-900">
              {totalTripsDispatched}
            </span>
            <span className="text-xs text-slate-500 ml-1">/ {trips.length} scheduled</span>
          </div>
          <span className="text-[11px] text-slate-500">{vehicles.length} registered vehicles</span>
        </div>

        {/* Fleet Occupancy */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
          <span className="text-xs font-bold text-slate-500 uppercase">{t.averageOccupancy}</span>
          <div className="my-2">
            <span className="text-3xl font-black font-mono-code text-emerald-700">
              {averageOccupancy}%
            </span>
          </div>
          <span className="text-[11px] text-slate-500">{totalTickets} seats booked today</span>
        </div>

        {/* Active Agents */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
          <span className="text-xs font-bold text-slate-500 uppercase">{t.activeAgentsCount}</span>
          <div className="my-2">
            <span className="text-3xl font-black font-mono-code text-purple-700">
              {users.filter((u) => u.active).length}
            </span>
            <span className="text-xs text-slate-500 ml-1">on shift</span>
          </div>
          <span className="text-[11px] text-purple-600 font-medium">All terminals synced</span>
        </div>
      </div>

      {/* Analytics Breakdown: Payment Channels & Top Routes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment Channels Breakdown */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900">
            {language === 'am' ? 'የገቢ ክፍያ መንገዶች ክፍፍል (Payment Methods)' : 'Revenue by Payment Method'}
          </h3>

          <div className="space-y-3 text-xs">
            {/* Telebirr */}
            <div>
              <div className="flex justify-between font-semibold mb-1">
                <span className="flex items-center gap-1.5 text-sky-800">
                  <Smartphone className="w-4 h-4 text-sky-600" />
                  Telebirr (ቴሌብር)
                </span>
                <span className="font-mono-code font-bold text-slate-900">
                  {telebirrRev.toLocaleString()} ETB ({totalRevenue > 0 ? Math.round((telebirrRev / totalRevenue) * 100) : 0}%)
                </span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-sky-500 h-full rounded-full"
                  style={{ width: `${totalRevenue > 0 ? (telebirrRev / totalRevenue) * 100 : 0}%` }}
                ></div>
              </div>
            </div>

            {/* Cash */}
            <div>
              <div className="flex justify-between font-semibold mb-1">
                <span className="flex items-center gap-1.5 text-emerald-800">
                  <Banknote className="w-4 h-4 text-emerald-600" />
                  Cash in Hand (ጥሬ ገንዘብ)
                </span>
                <span className="font-mono-code font-bold text-slate-900">
                  {cashRev.toLocaleString()} ETB ({totalRevenue > 0 ? Math.round((cashRev / totalRevenue) * 100) : 0}%)
                </span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full"
                  style={{ width: `${totalRevenue > 0 ? (cashRev / totalRevenue) * 100 : 0}%` }}
                ></div>
              </div>
            </div>

            {/* CBE Birr */}
            <div>
              <div className="flex justify-between font-semibold mb-1">
                <span className="flex items-center gap-1.5 text-purple-800">
                  <CreditCard className="w-4 h-4 text-purple-600" />
                  CBE Birr (ሲቢኢ ብር)
                </span>
                <span className="font-mono-code font-bold text-slate-900">
                  {cbeBirrRev.toLocaleString()} ETB ({totalRevenue > 0 ? Math.round((cbeBirrRev / totalRevenue) * 100) : 0}%)
                </span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-purple-500 h-full rounded-full"
                  style={{ width: `${totalRevenue > 0 ? (cbeBirrRev / totalRevenue) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Top Performing Routes */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900">{t.topRoutesByRevenue}</h3>

          <div className="space-y-3">
            {rankedRoutes.slice(0, 4).map((item, idx) => (
              <div
                key={item.route.id}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs"
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center text-[10px]">
                    #{idx + 1}
                  </span>
                  <div>
                    <div className="font-bold text-slate-900">
                      {language === 'am'
                        ? `${item.route.originNameAm} ➔ ${item.route.destinationNameAm}`
                        : `${item.route.originNameEn} ➔ ${item.route.destinationNameEn}`}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      {item.stats.count} tickets sold • Tariff: {item.route.baseFare} ETB
                    </div>
                  </div>
                </div>

                <div className="text-right font-mono-code font-black text-emerald-800 text-sm">
                  {item.stats.total.toLocaleString()} ETB
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Staff & Agent Management Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-md overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="text-sm font-bold text-slate-900">{t.manageAgentsTitle}</h3>
            <p className="text-xs text-slate-500">
              {language === 'am' ? 'የጣቢያ ሰራተኞች እና የትኬት ቆራጮች የሽያጭ አፈጻጸም' : 'Staff roster & cashier sales totals'}
            </p>
          </div>

          <button
            onClick={() => setShowAddUserModal(true)}
            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg cursor-pointer"
          >
            + {t.addNewAgent}
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900 text-white font-bold uppercase text-[10px]">
              <tr>
                <th className="py-3 px-4">{t.agentIdBadge}</th>
                <th className="py-3 px-4">{t.agentName}</th>
                <th className="py-3 px-3">{t.roleTag}</th>
                <th className="py-3 px-3">{t.phoneLabel}</th>
                <th className="py-3 px-3">{t.ticketsSoldToday}</th>
                <th className="py-3 px-4 text-right">{t.totalSales}</th>
                <th className="py-3 px-4 text-center">{t.currentStatus}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {agentStats.map((item) => (
                <tr key={item.user.id} className="hover:bg-slate-50 transition">
                  <td className="py-3 px-4 font-mono-code font-bold text-slate-900">
                    <span className="bg-slate-100 border border-slate-300 px-2 py-0.5 rounded">
                      {item.user.agentCode}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-900">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{item.user.avatar}</span>
                      <div>
                        <div>{item.user.name}</div>
                        <div className="text-[10px] text-slate-500">{item.user.nameAm}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        item.user.role === 'admin'
                          ? 'bg-purple-100 text-purple-800'
                          : item.user.role === 'manager'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {item.user.role}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-mono-code text-slate-600">{item.user.phone}</td>
                  <td className="py-3 px-3 font-bold font-mono-code text-slate-900">
                    {item.ticketCount}
                  </td>
                  <td className="py-3 px-4 text-right font-mono-code font-black text-emerald-700 text-sm">
                    {item.revenue.toLocaleString()} ETB
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => updateUser(item.user.id, { active: !item.user.active })}
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full transition cursor-pointer ${
                        item.user.active
                          ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {item.user.active ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">{t.addNewAgent}</h3>
              <button
                onClick={resetUserForm}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddUser} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Full Name (EN) *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Almaz Bekele"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">ስም (አማርኛ)</label>
                  <input
                    type="text"
                    value={nameAm}
                    onChange={(e) => setNameAm(e.target.value)}
                    placeholder="አልማዝ በቀለ"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500 font-ethiopic"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Agent ID Code *</label>
                  <input
                    type="text"
                    required
                    value={agentCode}
                    onChange={(e) => setAgentCode(e.target.value)}
                    placeholder="AGT-108"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 font-mono-code outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">System Role *</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as Role)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                  >
                    <option value="agent">Ticketing Agent</option>
                    <option value="manager">Station Manager</option>
                    <option value="admin">System Admin</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0911 23 45 67"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 font-mono-code outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={resetUserForm}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold cursor-pointer"
                >
                  {t.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
