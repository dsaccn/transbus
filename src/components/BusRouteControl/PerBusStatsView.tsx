import React, { useState, useMemo } from 'react';
import { Vehicle, Trip, Route, Language } from '../../types';
import {
  Bus,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Compass,
  ArrowRight,
  Filter,
  Activity,
  Calendar,
  Layers,
} from 'lucide-react';

export interface BusControlVm {
  busId: string;
  plateNumber: string;
  sideNumber?: string;
  status: 'Active' | 'Maintenance' | 'Idle';
  totalTrips: number;
  distinctRoutesTaken: number;
  completedCount: number;
  cancelledCount: number;
  lastActiveDate: string | null;
  capacity: number;
}

interface Props {
  vehicles: Vehicle[];
  trips: Trip[];
  routes: Route[];
  language: Language;
  onSelectBusForDrillDown: (busId: string) => void;
  onSelectBusForCalendar?: (busId: string) => void;
}

export const PerBusStatsView: React.FC<Props> = ({
  vehicles,
  trips,
  routes,
  language,
  onSelectBusForDrillDown,
  onSelectBusForCalendar,
}) => {
  const [searchPlate, setSearchPlate] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Compute BusControlVm projection equivalent to Query 1
  const busStatsList: BusControlVm[] = useMemo(() => {
    return vehicles.map((v) => {
      const busTrips = trips.filter((t) => t.vehicleId === v.id);

      // Status mapping to Active/Maintenance/Idle
      let mappedStatus: 'Active' | 'Maintenance' | 'Idle' = 'Idle';
      if (v.status === 'maintenance') {
        mappedStatus = 'Maintenance';
      } else if (v.status === 'ready' || v.status === 'boarding' || v.status === 'in_transit') {
        mappedStatus = 'Active';
      } else {
        mappedStatus = 'Idle';
      }

      const totalTrips = busTrips.length;

      // Unique route IDs count
      const distinctRoutesTaken = new Set(busTrips.map((t) => t.routeId)).size;

      // Completed count (arrived / completed)
      const completedCount = busTrips.filter((t) => t.status === 'arrived').length;

      // Cancelled count
      const cancelledCount = busTrips.filter((t) => t.status === 'cancelled').length;

      // Last active date (max departureDate & time)
      let lastActiveDate: string | null = null;
      if (busTrips.length > 0) {
        // Sort descending by departure date and time
        const sorted = [...busTrips].sort((a, b) => {
          const dtA = `${a.departureDate} ${a.departureTime}`;
          const dtB = `${b.departureDate} ${b.departureTime}`;
          return dtB.localeCompare(dtA);
        });
        lastActiveDate = `${sorted[0].departureDate} ${sorted[0].departureTime}`;
      }

      return {
        busId: v.id,
        plateNumber: v.plateNumber,
        sideNumber: v.sideNumber,
        status: mappedStatus,
        totalTrips,
        distinctRoutesTaken,
        completedCount,
        cancelledCount,
        lastActiveDate,
        capacity: v.totalSeats,
      };
    });
  }, [vehicles, trips]);

  const filteredStats = useMemo(() => {
    return busStatsList.filter((item) => {
      if (statusFilter !== 'all' && item.status.toLowerCase() !== statusFilter.toLowerCase()) {
        return false;
      }
      if (searchPlate.trim()) {
        const q = searchPlate.trim().toLowerCase();
        const matchPlate = item.plateNumber.toLowerCase().includes(q);
        const matchSide = item.sideNumber?.toLowerCase().includes(q);
        if (!matchPlate && !matchSide) return false;
      }
      return true;
    });
  }, [busStatsList, searchPlate, statusFilter]);

  // Aggregate stats
  const totalBuses = busStatsList.length;
  const activeBuses = busStatsList.filter((b) => b.status === 'Active').length;
  const totalCompleted = busStatsList.reduce((acc, b) => acc + b.completedCount, 0);
  const totalCancelled = busStatsList.reduce((acc, b) => acc + b.cancelledCount, 0);

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Summary metric banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-slate-400 block text-[10px] font-bold uppercase">
            {language === 'am' ? 'አጠቃላይ አውቶቡሶች' : 'Total Fleet (Buses)'}
          </span>
          <span className="text-2xl font-black font-mono-code text-slate-900 mt-1 block">
            {totalBuses}
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-emerald-200 shadow-xs bg-emerald-50/30">
          <span className="text-emerald-700 block text-[10px] font-bold uppercase">
            {language === 'am' ? 'ንቁ አውቶቡሶች (Active)' : 'Active Status'}
          </span>
          <span className="text-2xl font-black font-mono-code text-emerald-700 mt-1 block">
            {activeBuses}
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-blue-200 shadow-xs bg-blue-50/30">
          <span className="text-blue-700 block text-[10px] font-bold uppercase">
            {language === 'am' ? 'የተጠናቀቁ ጉዞዎች' : 'Completed Trips'}
          </span>
          <span className="text-2xl font-black font-mono-code text-blue-700 mt-1 block">
            {totalCompleted}
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-rose-200 shadow-xs bg-rose-50/30">
          <span className="text-rose-700 block text-[10px] font-bold uppercase">
            {language === 'am' ? 'የተሰረዙ ጉዞዎች' : 'Cancelled Trips'}
          </span>
          <span className="text-2xl font-black font-mono-code text-rose-700 mt-1 block">
            {totalCancelled}
          </span>
        </div>
      </div>

      {/* Control bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          <div className="relative min-w-[240px] flex-1 sm:flex-initial">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchPlate}
              onChange={(e) => setSearchPlate(e.target.value)}
              placeholder={language === 'am' ? 'በሰሌዳ ወይም በጎን ቁጥር ፈልግ...' : 'Search by Plate Number or Side No...'}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-semibold outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
            >
              <option value="all">{language === 'am' ? 'ሁሉም ሁኔታዎች' : 'All Statuses'}</option>
              <option value="active">{language === 'am' ? 'ንቁ (Active)' : 'Active'}</option>
              <option value="maintenance">{language === 'am' ? 'ጥገና (Maintenance)' : 'Maintenance'}</option>
              <option value="idle">{language === 'am' ? 'ዝግጁ/እረፍት (Idle)' : 'Idle'}</option>
            </select>
          </div>
        </div>

        <div className="text-xs text-slate-500 font-medium">
          {language === 'am' ? 'የተገኙ' : 'Showing'}:{' '}
          <span className="font-bold text-slate-900 font-mono-code">{filteredStats.length}</span>{' '}
          {language === 'am' ? 'አውቶቡሶች' : 'buses'}
        </div>
      </div>

      {/* Table: Projected BusControlVm */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">{language === 'am' ? 'የሰሌዳ ቁጥር (Plate)' : 'Plate Number'}</th>
                <th className="py-3 px-4">{language === 'am' ? 'ሁኔታ (Status)' : 'Status'}</th>
                <th className="py-3 px-4 text-center">{language === 'am' ? 'አጠቃላይ ጉዞዎች (Total Trips)' : 'Total Trips'}</th>
                <th className="py-3 px-4 text-center">{language === 'am' ? 'የተለያዩ መስመሮች (Distinct Routes)' : 'Distinct Routes'}</th>
                <th className="py-3 px-4 text-center text-emerald-700">{language === 'am' ? 'የተጠናቀቁ (Completed)' : 'Completed'}</th>
                <th className="py-3 px-4 text-center text-rose-700">{language === 'am' ? 'የተሰረዙ (Cancelled)' : 'Cancelled'}</th>
                <th className="py-3 px-4">{language === 'am' ? 'የመጨረሻ እንቅስቃሴ (Last Active)' : 'Last Active Date'}</th>
                <th className="py-3 px-4 text-right">{language === 'am' ? 'ድርጊት' : 'Action'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStats.map((item) => (
                <tr key={item.busId} className="hover:bg-slate-50/80 transition">
                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
                        <Bus className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-mono-code font-bold block">{item.plateNumber}</span>
                        {item.sideNumber && (
                          <span className="text-[10px] text-slate-400 font-semibold">Side: {item.sideNumber}</span>
                        )}
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md ${
                        item.status === 'Active'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : item.status === 'Maintenance'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          item.status === 'Active'
                            ? 'bg-emerald-500 animate-pulse'
                            : item.status === 'Maintenance'
                            ? 'bg-amber-500'
                            : 'bg-slate-400'
                        }`}
                      />
                      {item.status}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-center font-mono-code font-bold text-slate-800">
                    {item.totalTrips}
                  </td>

                  <td className="py-3.5 px-4 text-center">
                    <span className="inline-flex items-center gap-1 font-mono-code font-bold text-purple-700 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-md">
                      <Compass className="w-3 h-3" />
                      {item.distinctRoutesTaken}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-center font-mono-code font-bold text-emerald-700">
                    {item.completedCount}
                  </td>

                  <td className="py-3.5 px-4 text-center font-mono-code font-bold text-rose-600">
                    {item.cancelledCount}
                  </td>

                  <td className="py-3.5 px-4 text-slate-600">
                    {item.lastActiveDate ? (
                      <div className="flex items-center gap-1.5 font-mono-code text-[11px] text-slate-700">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{item.lastActiveDate}</span>
                      </div>
                    ) : (
                      <span className="text-[11px] text-slate-400 italic">No trips recorded</span>
                    )}
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {onSelectBusForCalendar && (
                        <button
                          onClick={() => onSelectBusForCalendar(item.busId)}
                          title={language === 'am' ? 'የአውቶቡስ የቀን መቁጠሪያ እይ' : 'View Bus Calendar'}
                          className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-600 hover:text-white text-emerald-700 rounded-lg font-bold text-[11px] transition inline-flex items-center gap-1 cursor-pointer border border-emerald-200"
                        >
                          <Calendar className="w-3 h-3" />
                          <span>{language === 'am' ? 'ቀን መቁጠሪያ' : 'Calendar'}</span>
                        </button>
                      )}
                      <button
                        onClick={() => onSelectBusForDrillDown(item.busId)}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-800 hover:text-white text-slate-700 rounded-lg font-bold text-[11px] transition inline-flex items-center gap-1 cursor-pointer"
                      >
                        <span>{language === 'am' ? 'ዝርዝር እይ' : 'Drill-Down'}</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredStats.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    {language === 'am' ? 'ምንም አውቶቡስ አልተገኘም' : 'No matching buses found.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
