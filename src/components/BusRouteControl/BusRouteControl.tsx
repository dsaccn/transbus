import React, { useState } from 'react';
import { useTransport } from '../../context/TransportContext';
import { Trip, TripStatus } from '../../types';
import {
  Bus,
  Calendar,
  Clock,
  MapPin,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  Play,
  RotateCcw,
  Send,
  Flag,
  User,
  Phone,
  Armchair,
  Plus,
  Sliders,
  Sparkles,
  ArrowRight,
  Shield,
  X,
  Compass,
  ArrowLeftRight,
  Code2,
  Database,
  Layers,
} from 'lucide-react';
import { PerBusStatsView } from './PerBusStatsView';
import { CalendarFeedView } from './CalendarFeedView';
import { SingleBusDrillDownView } from './SingleBusDrillDownView';
import { EfCoreQueriesView } from './EfCoreQueriesView';
import { VehicleRouteCalendarView } from './VehicleRouteCalendarView';

export const BusRouteControl: React.FC = () => {
  const {
    t,
    language,
    trips,
    routes,
    vehicles,
    tickets,
    addTrip,
    updateTrip,
    dispatchTrip,
    startBoardingTrip,
    markTripArrived,
    resetTripStatus,
  } = useTransport();

  // Control View Tab State: 'live_ops' | 'vehicle_calendar' | 'bus_stats' | 'calendar_feed' | 'drill_down' | 'ef_core'
  const [activeControlTab, setActiveControlTab] = useState<
    'live_ops' | 'vehicle_calendar' | 'bus_stats' | 'calendar_feed' | 'drill_down' | 'ef_core'
  >('live_ops');
  const [drillDownBusId, setDrillDownBusId] = useState<string>(vehicles[0]?.id || '');

  // Filters: Date & Bus Number (Plate or Side No)
  const todayStr = new Date().toISOString().split('T')[0];
  const tomorrowDateObj = new Date();
  tomorrowDateObj.setDate(tomorrowDateObj.getDate() + 1);
  const tomorrowStr = tomorrowDateObj.toISOString().split('T')[0];

  const [dateFilter, setDateFilter] = useState<string>('');
  const [busNumberFilter, setBusNumberFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Modal State for New Car Deployment
  const [showDeployModal, setShowDeployModal] = useState<boolean>(false);
  const [selectedRouteId, setSelectedRouteId] = useState<string>(routes[0]?.id || '');
  const [deployStartPoint, setDeployStartPoint] = useState<string>(routes[0]?.originNameEn || '');
  const [deployEndPoint, setDeployEndPoint] = useState<string>(routes[0]?.destinationNameEn || '');
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>(vehicles[0]?.id || '');
  const [departureDate, setDepartureDate] = useState<string>(todayStr);
  const [departureTime, setDepartureTime] = useState<string>('06:30 AM');
  const [gateNumber, setGateNumber] = useState<string>('Gate 01');
  const [pricePerSeat, setPricePerSeat] = useState<number>(routes[0]?.baseFare || 350);

  // Distinct starting routes / origins for deploy modal
  const uniqueOrigins = React.useMemo(() => {
    const map = new Map<string, { en: string; am: string }>();
    routes.forEach((r) => {
      if (!map.has(r.originNameEn)) {
        map.set(r.originNameEn, { en: r.originNameEn, am: r.originNameAm });
      }
    });
    return Array.from(map.values());
  }, [routes]);

  // Distinct ending routes / destinations for deploy modal
  const uniqueDestinations = React.useMemo(() => {
    const map = new Map<string, { en: string; am: string }>();
    routes.forEach((r) => {
      if (!map.has(r.destinationNameEn)) {
        map.set(r.destinationNameEn, { en: r.destinationNameEn, am: r.destinationNameAm });
      }
    });
    return Array.from(map.values());
  }, [routes]);

  const selectedDeployRoute = routes.find((r) => r.id === selectedRouteId) || routes[0];

  const handleDeployStartPointChange = (newStart: string) => {
    setDeployStartPoint(newStart);
    const exactMatch = routes.find(
      (r) => r.originNameEn === newStart && r.destinationNameEn === deployEndPoint
    );
    if (exactMatch) {
      handleRouteChange(exactMatch.id);
    } else {
      const anyMatch = routes.find((r) => r.originNameEn === newStart);
      if (anyMatch) {
        setDeployEndPoint(anyMatch.destinationNameEn);
        handleRouteChange(anyMatch.id);
      }
    }
  };

  const handleDeployEndPointChange = (newEnd: string) => {
    setDeployEndPoint(newEnd);
    const exactMatch = routes.find(
      (r) => r.originNameEn === deployStartPoint && r.destinationNameEn === newEnd
    );
    if (exactMatch) {
      handleRouteChange(exactMatch.id);
    } else {
      const anyMatch = routes.find((r) => r.destinationNameEn === newEnd);
      if (anyMatch) {
        setDeployStartPoint(anyMatch.originNameEn);
        handleRouteChange(anyMatch.id);
      }
    }
  };

  const handleDeploySwap = () => {
    const nextStart = deployEndPoint;
    const nextEnd = deployStartPoint;
    const directMatch = routes.find(
      (r) => r.originNameEn === nextStart && r.destinationNameEn === nextEnd
    );
    if (directMatch) {
      setDeployStartPoint(nextStart);
      setDeployEndPoint(nextEnd);
      handleRouteChange(directMatch.id);
    } else {
      handleDeployStartPointChange(nextStart);
    }
  };

  // Edit / Reschedule Modal State
  const [editingTrip, setEditingTrip] = useState<Trip | null>(null);
  const [editDate, setEditDate] = useState<string>('');
  const [editTime, setEditTime] = useState<string>('');
  const [editGate, setEditGate] = useState<string>('');
  const [editStatus, setEditStatus] = useState<TripStatus>('scheduled');

  // Sync price when route changes in deploy modal
  const handleRouteChange = (rId: string) => {
    setSelectedRouteId(rId);
    const r = routes.find((x) => x.id === rId);
    if (r) setPricePerSeat(r.baseFare);
  };

  const handleDeploySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const vehicle = vehicles.find((v) => v.id === selectedVehicleId);
    const route = routes.find((r) => r.id === selectedRouteId);
    if (!vehicle || !route) return;

    addTrip({
      routeId: selectedRouteId,
      vehicleId: selectedVehicleId,
      driverName: vehicle.driverName,
      departureDate,
      departureTime,
      gateNumber,
      pricePerSeat,
      totalSeatsCount: vehicle.totalSeats,
      status: 'scheduled',
    });

    setShowDeployModal(false);
  };

  const openRescheduleModal = (trip: Trip) => {
    setEditingTrip(trip);
    setEditDate(trip.departureDate);
    setEditTime(trip.departureTime);
    setEditGate(trip.gateNumber);
    setEditStatus(trip.status);
  };

  const handleUpdateTrip = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTrip) return;

    updateTrip(editingTrip.id, {
      departureDate: editDate,
      departureTime: editTime,
      gateNumber: editGate,
      status: editStatus,
    });

    setEditingTrip(null);
  };

  // Filtered trips by Date and Bus Number (Plate or Side No) and Status
  const filteredTrips = trips.filter((trip) => {
    // Date filter
    if (dateFilter && trip.departureDate !== dateFilter) {
      return false;
    }

    // Bus Number (Plate or Side No) filter
    if (busNumberFilter.trim()) {
      const q = busNumberFilter.trim().toLowerCase();
      const veh = vehicles.find((v) => v.id === trip.vehicleId);
      const matchesPlate = veh?.plateNumber.toLowerCase().includes(q);
      const matchesSide = veh?.sideNumber?.toLowerCase().includes(q);
      const matchesTrip = trip.tripCode.toLowerCase().includes(q);
      const matchesDriver = veh?.driverName.toLowerCase().includes(q);
      if (!matchesPlate && !matchesSide && !matchesTrip && !matchesDriver) {
        return false;
      }
    }

    // Status filter
    if (statusFilter !== 'all' && trip.status !== statusFilter) {
      return false;
    }

    return true;
  });

  // Summary Metrics
  const totalBuses = filteredTrips.length;
  const boardingCount = filteredTrips.filter((t) => t.status === 'boarding').length;
  const inTransitCount = filteredTrips.filter((t) => t.status === 'departed').length;
  const scheduledCount = filteredTrips.filter((t) => t.status === 'scheduled').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold">
            <Sliders className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white">
                {language === 'am' ? 'የአውቶቡስ እና መስመር መቆጣጠሪያ' : 'Bus Route Control Center'}
              </h2>
              <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-700 font-mono-code px-2 py-0.5 rounded font-bold">
                LIVE DISPATCH
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {language === 'am'
                ? 'እያንዳንዱን አውቶቡስ እና የተመደቡበትን መስመር በቀን እና በሰሌዳ/በጎን ቁጥር ይቆጣጠሩ'
                : 'Monitor and control every bus and their assigned routes filtered by date and number'}
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowDeployModal(true)}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition shadow-md flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{language === 'am' ? 'መኪና ወደ መስመር መድብ' : 'Deploy / Schedule Bus'}</span>
        </button>
      </div>

      {/* Navigation Tabs for Bus Route Control */}
      <div className="flex items-center gap-1.5 p-1.5 bg-slate-100 rounded-2xl border border-slate-200 overflow-x-auto">
        <button
          onClick={() => setActiveControlTab('live_ops')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeControlTab === 'live_ops'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
          }`}
        >
          <Sliders className="w-3.5 h-3.5 text-emerald-600" />
          <span>{language === 'am' ? 'የቀጥታ ጉዞዎች ቁጥጥር' : 'Live Trip Operations'}</span>
        </button>

        <button
          onClick={() => setActiveControlTab('vehicle_calendar')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeControlTab === 'vehicle_calendar'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
          }`}
        >
          <Calendar className="w-3.5 h-3.5 text-emerald-600" />
          <span>{language === 'am' ? 'የአውቶቡስ የቀን መቁጠሪያ' : 'Vehicle Route Calendar'}</span>
          <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-bold">
            1 Bus
          </span>
        </button>

        <button
          onClick={() => setActiveControlTab('bus_stats')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeControlTab === 'bus_stats'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
          }`}
        >
          <Bus className="w-3.5 h-3.5 text-purple-600" />
          <span>{language === 'am' ? 'የአውቶቡሶች ስታቲስቲክስ' : 'Per-Bus Control Stats'}</span>
          <span className="text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.2 rounded font-mono-code font-bold">
            Q1
          </span>
        </button>

        <button
          onClick={() => setActiveControlTab('calendar_feed')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeControlTab === 'calendar_feed'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
          }`}
        >
          <Calendar className="w-3.5 h-3.5 text-blue-600" />
          <span>{language === 'am' ? 'የቀን መቁጠሪያ ዝርዝር' : 'Calendar Feed'}</span>
          <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.2 rounded font-mono-code font-bold">
            Q2
          </span>
        </button>

        <button
          onClick={() => setActiveControlTab('drill_down')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeControlTab === 'drill_down'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
          }`}
        >
          <MapPin className="w-3.5 h-3.5 text-amber-600" />
          <span>{language === 'am' ? 'ነጠላ አውቶቡስ ዝርዝር' : 'Single-Bus Drill-Down'}</span>
          <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.2 rounded font-mono-code font-bold">
            Q3
          </span>
        </button>

        <button
          onClick={() => setActiveControlTab('ef_core')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeControlTab === 'ef_core'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
          }`}
        >
          <Code2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>EF Core LINQ (C#)</span>
        </button>
      </div>

      {/* Render Active View */}
      {activeControlTab === 'vehicle_calendar' && (
        <VehicleRouteCalendarView
          vehicles={vehicles}
          trips={trips}
          routes={routes}
          language={language}
          selectedBusId={drillDownBusId}
          onSelectBusId={setDrillDownBusId}
          onDeployForVehicle={(busId, defaultDate) => {
            setSelectedVehicleId(busId);
            if (defaultDate) setDepartureDate(defaultDate);
            setShowDeployModal(true);
          }}
        />
      )}

      {activeControlTab === 'bus_stats' && (
        <PerBusStatsView
          vehicles={vehicles}
          trips={trips}
          routes={routes}
          language={language}
          onSelectBusForDrillDown={(busId) => {
            setDrillDownBusId(busId);
            setActiveControlTab('drill_down');
          }}
          onSelectBusForCalendar={(busId) => {
            setDrillDownBusId(busId);
            setActiveControlTab('vehicle_calendar');
          }}
        />
      )}

      {activeControlTab === 'calendar_feed' && (
        <CalendarFeedView
          trips={trips}
          vehicles={vehicles}
          routes={routes}
          language={language}
        />
      )}

      {activeControlTab === 'drill_down' && (
        <SingleBusDrillDownView
          selectedBusId={drillDownBusId}
          onSelectBusId={setDrillDownBusId}
          onOpenCalendar={(busId) => {
            setDrillDownBusId(busId);
            setActiveControlTab('vehicle_calendar');
          }}
          vehicles={vehicles}
          trips={trips}
          routes={routes}
          tickets={tickets}
          language={language}
        />
      )}

      {activeControlTab === 'ef_core' && <EfCoreQueriesView />}

      {activeControlTab === 'live_ops' && (
        <>
          {/* KPI Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-slate-400 block text-[10px] font-bold uppercase">
            {language === 'am' ? 'አጠቃላይ የተመደቡ አውቶቡሶች' : 'Total Assigned Buses'}
          </span>
          <span className="text-2xl font-black font-mono-code text-slate-900 mt-1 block">
            {totalBuses}
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-emerald-200 shadow-xs bg-emerald-50/30">
          <span className="text-emerald-700 block text-[10px] font-bold uppercase">
            {language === 'am' ? 'በመጫን ላይ ያሉ (Boarding)' : 'Boarding at Bays'}
          </span>
          <span className="text-2xl font-black font-mono-code text-emerald-700 mt-1 block">
            {boardingCount}
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-blue-200 shadow-xs bg-blue-50/30">
          <span className="text-blue-700 block text-[10px] font-bold uppercase">
            {language === 'am' ? 'መንገድ ላይ ያሉ (In-Transit)' : 'In-Transit on Route'}
          </span>
          <span className="text-2xl font-black font-mono-code text-blue-700 mt-1 block">
            {inTransitCount}
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-amber-200 shadow-xs bg-amber-50/30">
          <span className="text-amber-700 block text-[10px] font-bold uppercase">
            {language === 'am' ? 'የተያዙ / ዝግጁ (Scheduled)' : 'Scheduled / Ready'}
          </span>
          <span className="text-2xl font-black font-mono-code text-amber-700 mt-1 block">
            {scheduledCount}
          </span>
        </div>
      </div>

      {/* PRIMARY CONTROLS: Filter by Date & Bus Number (Plate or Side No) */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-900">
              {language === 'am' ? 'የአውቶቡስ እና የመስመር አጣሪ' : 'Bus & Route Filter Controls'}
            </h3>
          </div>

          {(dateFilter || busNumberFilter || statusFilter !== 'all') && (
            <button
              onClick={() => {
                setDateFilter('');
                setBusNumberFilter('');
                setStatusFilter('all');
              }}
              className="text-xs text-rose-600 hover:text-rose-700 font-bold flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{language === 'am' ? 'አጣሪዎችን አጽዳ' : 'Clear Filters'}</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
          {/* 1. Filter by Bus Number (Plate or Side Number) */}
          <div className="md:col-span-5">
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1">
                <Bus className="w-3.5 h-3.5 text-emerald-600" />
                <span>{language === 'am' ? 'በሰሌዳ / በጎን ቁጥር ፈልግ' : 'Search by Plate or Side Number'}</span>
              </span>
              <span className="text-[10px] text-slate-400 font-normal">Plate / Side # / Code</span>
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={busNumberFilter}
                onChange={(e) => setBusNumberFilter(e.target.value)}
                placeholder="e.g. 3-38492, Side #14, or TRP-882"
                className="w-full pl-10 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 font-mono-code outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
              />
            </div>
          </div>

          {/* 2. Filter by Date */}
          <div className="md:col-span-4">
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-amber-500" />
              <span>{language === 'am' ? 'በቀን አጣራ' : 'Filter by Departure Date'}</span>
            </label>
            <div className="flex gap-1.5">
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="flex-1 px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 font-semibold outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
              />
              <button
                type="button"
                onClick={() => setDateFilter(todayStr)}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer ${
                  dateFilter === todayStr
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
                }`}
              >
                {language === 'am' ? 'ዛሬ' : 'Today'}
              </button>
              <button
                type="button"
                onClick={() => setDateFilter(tomorrowStr)}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer ${
                  dateFilter === tomorrowStr
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
                }`}
              >
                {language === 'am' ? 'ነገ' : 'Tmrw'}
              </button>
            </div>
          </div>

          {/* 3. Status Filter */}
          <div className="md:col-span-3">
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
              <Flag className="w-3.5 h-3.5 text-sky-500" />
              <span>{language === 'am' ? 'ሁኔታ' : 'Status Filter'}</span>
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 font-semibold outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
            >
              <option value="all">{language === 'am' ? 'ሁሉም ሁኔታዎች (All)' : 'All Statuses'}</option>
              <option value="scheduled">{language === 'am' ? 'የተያዘ (Scheduled)' : 'Scheduled'}</option>
              <option value="boarding">{language === 'am' ? 'በመጫን ላይ (Boarding)' : 'Boarding'}</option>
              <option value="departed">{language === 'am' ? 'መንገድ ላይ (In-Transit)' : 'In-Transit'}</option>
              <option value="arrived">{language === 'am' ? 'የደረሰ (Arrived)' : 'Arrived'}</option>
              <option value="cancelled">{language === 'am' ? 'የተሰረዘ (Cancelled)' : 'Cancelled'}</option>
            </select>
          </div>
        </div>
      </div>

      {/* BUS & ROUTE CONTROL CARDS LIST */}
      <div className="space-y-3">
        {filteredTrips.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 border border-slate-200 text-center space-y-2">
            <AlertCircle className="w-10 h-10 text-amber-500 mx-auto" />
            <h4 className="text-sm font-bold text-slate-800">
              {language === 'am' ? 'ምንም ተሽከርካሪ አልተገኘም' : 'No matching buses or routes found'}
            </h4>
            <p className="text-xs text-slate-500">
              {language === 'am'
                ? 'ለተመረጠው ቀን ወይም የሰሌዳ/የጎን ቁጥር የተመደበ አውቶቡስ የለም።'
                : 'Try adjusting the date, plate number, or side number filter.'}
            </p>
          </div>
        ) : (
          filteredTrips.map((trip) => {
            const vehicle = vehicles.find((v) => v.id === trip.vehicleId);
            const route = routes.find((r) => r.id === trip.routeId);
            const booked = trip.bookedSeatsCount;
            const total = vehicle?.totalSeats || trip.totalSeatsCount;
            const occupancyPct = Math.round((booked / total) * 100);

            return (
              <div
                key={trip.id}
                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition space-y-4"
              >
                {/* Row 1: Bus Identification & Route Header */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="flex flex-wrap items-center gap-2.5">
                    {/* Plate Number */}
                    <span className="font-mono-code font-black text-sm bg-slate-900 text-white px-3 py-1 rounded-xl shadow-xs">
                      {vehicle?.plateNumber}
                    </span>

                    {/* Side Number Badge */}
                    {vehicle?.sideNumber && (
                      <span className="text-xs font-black bg-amber-100 text-amber-900 border border-amber-300 px-2.5 py-1 rounded-xl">
                        {language === 'am' ? 'የጎን' : 'Side'} #{vehicle.sideNumber}
                      </span>
                    )}

                    {/* Vehicle Model */}
                    <span className="text-xs font-semibold text-slate-600">
                      {vehicle?.model}
                    </span>

                    {/* Trip Code */}
                    <span className="text-xs font-mono-code font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                      {trip.tripCode}
                    </span>
                  </div>

                  {/* Status Badge */}
                  <span
                    className={`text-xs font-black px-3 py-1 rounded-full uppercase flex items-center gap-1.5 ${
                      trip.status === 'boarding'
                        ? 'bg-amber-100 text-amber-900 border border-amber-300 animate-pulse'
                        : trip.status === 'departed'
                        ? 'bg-blue-100 text-blue-900 border border-blue-300'
                        : trip.status === 'arrived'
                        ? 'bg-purple-100 text-purple-900 border border-purple-300'
                        : trip.status === 'cancelled'
                        ? 'bg-rose-100 text-rose-900 border border-rose-300'
                        : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${
                        trip.status === 'boarding'
                          ? 'bg-amber-500'
                          : trip.status === 'departed'
                          ? 'bg-blue-500'
                          : trip.status === 'arrived'
                          ? 'bg-purple-500'
                          : trip.status === 'cancelled'
                          ? 'bg-rose-500'
                          : 'bg-emerald-500'
                      }`}
                    />
                    <span>{trip.status}</span>
                  </span>
                </div>

                {/* Row 2: Route, Departure Info, Driver, and Occupancy */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                  {/* Assigned Route */}
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
                      {language === 'am' ? 'የተመደበበት መስመር' : 'Assigned Route'}
                    </span>
                    <div className="font-extrabold text-sm text-slate-900 flex items-center gap-1.5">
                      <span>{language === 'am' ? route?.originNameAm : route?.originNameEn}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-800">
                        {language === 'am' ? route?.destinationNameAm : route?.destinationNameEn}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1 font-mono-code">
                      Tariff: <span className="font-bold text-slate-800">{trip.pricePerSeat} ETB</span>
                    </div>
                  </div>

                  {/* Departure Date, Time & Gate */}
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
                      {language === 'am' ? 'የመነሻ ቀን እና ሰዓት' : 'Departure Schedule'}
                    </span>
                    <div className="flex items-center gap-2 font-mono-code text-xs text-slate-900 font-bold">
                      <Calendar className="w-3.5 h-3.5 text-amber-500" />
                      <span>{trip.departureDate}</span>
                      <Clock className="w-3.5 h-3.5 text-amber-500 ml-1" />
                      <span>{trip.departureTime}</span>
                    </div>
                    <div className="mt-1 text-[11px] font-bold text-slate-600">
                      Bay: <span className="text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-300 font-mono-code">{trip.gateNumber}</span>
                    </div>
                  </div>

                  {/* Driver Name & Contact */}
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
                      {language === 'am' ? 'ሹፌር እና ስልክ' : 'Driver & Contact'}
                    </span>
                    <div className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span>{vehicle?.driverName || trip.driverName}</span>
                    </div>
                    <div className="font-mono-code text-[11px] text-slate-600 mt-1 flex items-center gap-1.5">
                      <Phone className="w-3 h-3 text-emerald-600" />
                      <span>{vehicle?.driverPhone || '0911 00 00 00'}</span>
                    </div>
                  </div>

                  {/* Seat Occupancy & Capacity */}
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <div className="flex items-center justify-between text-[10px] text-slate-500 uppercase font-bold mb-1">
                      <span>{language === 'am' ? 'የወንበር ሙሌት' : 'Seat Bookings'}</span>
                      <span className="text-slate-900 font-mono-code font-bold">
                        {booked} / {total} ({occupancyPct}%)
                      </span>
                    </div>
                    {/* Progress bar */}
                    <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden my-1">
                      <div
                        className={`h-full transition-all duration-300 ${
                          occupancyPct >= 90
                            ? 'bg-rose-500'
                            : occupancyPct >= 50
                            ? 'bg-amber-500'
                            : 'bg-emerald-500'
                        }`}
                        style={{ width: `${Math.min(100, occupancyPct)}%` }}
                      />
                    </div>
                    <div className="text-[10px] text-slate-500">
                      {total - booked} {language === 'am' ? 'ክፍት ወንበሮች ቀርተዋል' : 'seats remaining'}
                    </div>
                  </div>
                </div>

                {/* Row 3: Direct Live Controls for the Bus and Route */}
                <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100">
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Start Boarding button */}
                    {trip.status === 'scheduled' && (
                      <button
                        onClick={() => startBoardingTrip(trip.id)}
                        className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <Play className="w-3.5 h-3.5" />
                        <span>{language === 'am' ? 'መጫን ጀምር (Start Boarding)' : 'Call Boarding'}</span>
                      </button>
                    )}

                    {/* Dispatch button */}
                    {trip.status === 'boarding' && (
                      <button
                        onClick={() => dispatchTrip(trip.id)}
                        className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>{language === 'am' ? 'ስምሪት ስጥ / ይነሳ (Dispatch Bus)' : 'Dispatch / Depart'}</span>
                      </button>
                    )}

                    {/* Mark Arrived button */}
                    {trip.status === 'departed' && (
                      <button
                        onClick={() => markTripArrived(trip.id)}
                        className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{language === 'am' ? 'ደርሷል (Mark Arrived)' : 'Mark Arrived'}</span>
                      </button>
                    )}

                    {/* Reset status button */}
                    {(trip.status === 'departed' || trip.status === 'arrived' || trip.status === 'cancelled') && (
                      <button
                        onClick={() => resetTripStatus(trip.id)}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition cursor-pointer"
                      >
                        {language === 'am' ? 'ወደ መጀመሪያው መልስ' : 'Reset to Scheduled'}
                      </button>
                    )}
                  </div>

                  {/* Reschedule / Edit button */}
                  <button
                    onClick={() => openRescheduleModal(trip)}
                    className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Sliders className="w-3.5 h-3.5 text-slate-500" />
                    <span>{language === 'am' ? 'ቀን / ሰዓት / በር ቀይር' : 'Reschedule / Edit'}</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
        </>
      )}

      {/* MODAL 1: Schedule / Deploy Car to Route */}
      {showDeployModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  <Bus className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  {language === 'am' ? 'አውቶቡስ ወደ መስመር መመደቢያ' : 'Deploy & Schedule Bus to Route'}
                </h3>
              </div>
              <button
                onClick={() => setShowDeployModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleDeploySubmit} className="space-y-4 text-xs">
              {/* Starting and Ending Route Selection */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 flex items-center gap-1.5">
                    <Compass className="w-4 h-4 text-emerald-600" />
                    {language === 'am' ? 'የመስመር መነሻ እና መድረሻ ምርጫ' : 'Route Selection (Origin & Destination)'}
                  </span>
                  <button
                    type="button"
                    onClick={handleDeploySwap}
                    title={language === 'am' ? 'መነሻ እና መድረሻ ቀያይር' : 'Swap Origin and Destination'}
                    className="font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-100 hover:bg-emerald-200 px-2 py-1 rounded-lg flex items-center gap-1 transition cursor-pointer"
                  >
                    <ArrowLeftRight className="w-3 h-3" />
                    <span>{language === 'am' ? 'ቀያይር' : 'Swap'}</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {/* Starting Route Selection */}
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      {language === 'am' ? 'የመነሻ መስመር (Starting Route / Origin) *' : 'Starting Route (Origin) *'}
                    </label>
                    <select
                      value={deployStartPoint}
                      onChange={(e) => handleDeployStartPointChange(e.target.value)}
                      className="w-full px-2.5 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 font-semibold outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                    >
                      {uniqueOrigins.map((orig) => (
                        <option key={orig.en} value={orig.en}>
                          {language === 'am' ? orig.am : orig.en}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Ending Route Selection */}
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      {language === 'am' ? 'የመድረሻ መስመር (Ending Route / Destination) *' : 'Ending Route (Destination) *'}
                    </label>
                    <select
                      value={deployEndPoint}
                      onChange={(e) => handleDeployEndPointChange(e.target.value)}
                      className="w-full px-2.5 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 font-semibold outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                    >
                      {uniqueDestinations.map((dest) => (
                        <option key={dest.en} value={dest.en}>
                          {language === 'am' ? dest.am : dest.en}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Selected Route Info Card */}
                {selectedDeployRoute && (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-2.5 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <div>
                        <span className="font-bold text-slate-900">
                          {language === 'am'
                            ? `${selectedDeployRoute.originNameAm} ➔ ${selectedDeployRoute.destinationNameAm}`
                            : `${selectedDeployRoute.originNameEn} ➔ ${selectedDeployRoute.destinationNameEn}`}
                        </span>
                        <span className="text-[10px] text-emerald-800 ml-2 font-mono-code font-bold">
                          [{selectedDeployRoute.routeCode}]
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 font-bold text-slate-700">
                      <span>{selectedDeployRoute.distanceKm} km</span>
                      <span>•</span>
                      <span>~{selectedDeployRoute.estimatedDurationHours} hrs</span>
                      <span>•</span>
                      <span className="text-emerald-700 font-mono-code">{selectedDeployRoute.baseFare} ETB</span>
                    </div>
                  </div>
                )}

                {/* Direct Route Override */}
                <div>
                  <label className="block font-bold text-slate-500 mb-0.5">
                    {language === 'am' ? 'ወይም ሙሉ መስመር በቀጥታ ይምረጡ' : 'Or select full route directly'}
                  </label>
                  <select
                    value={selectedRouteId}
                    onChange={(e) => handleRouteChange(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                  >
                    {routes.map((r) => (
                      <option key={r.id} value={r.id}>
                        {language === 'am'
                          ? `${r.originNameAm} ➔ ${r.destinationNameAm} (${r.baseFare} ETB • ${r.distanceKm} km)`
                          : `${r.originNameEn} ➔ ${r.destinationNameEn} (${r.baseFare} ETB • ${r.distanceKm} km)`}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Select Vehicle */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {language === 'am' ? 'የሚመደበው ተሽከርካሪ (ሰሌዳ እና የጎን ቁጥር) *' : 'Select Vehicle (Plate & Side No) *'}
                </label>
                <select
                  value={selectedVehicleId}
                  onChange={(e) => setSelectedVehicleId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-semibold outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                >
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.plateNumber}{' '}
                      {v.sideNumber ? `(Side #${v.sideNumber})` : ''} - {v.model} ({v.totalSeats} seats) - Driver: {v.driverName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Departure Date and Time */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {language === 'am' ? 'የመነሻ ቀን *' : 'Departure Date *'}
                  </label>
                  <input
                    type="date"
                    required
                    value={departureDate}
                    onChange={(e) => setDepartureDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-semibold outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {language === 'am' ? 'የመነሻ ሰዓት *' : 'Departure Time *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={departureTime}
                    onChange={(e) => setDepartureTime(e.target.value)}
                    placeholder="e.g. 06:30 AM"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-mono-code outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Gate & Price */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {language === 'am' ? 'መነሻ በር / ፌርማታ *' : 'Gate / Bay *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={gateNumber}
                    onChange={(e) => setGateNumber(e.target.value)}
                    placeholder="e.g. Gate 02 or Bay A"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {language === 'am' ? 'የወንበር ዋጋ (ETB) *' : 'Price per Seat (ETB) *'}
                  </label>
                  <input
                    type="number"
                    required
                    min={10}
                    value={pricePerSeat}
                    onChange={(e) => setPricePerSeat(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-mono-code font-bold outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowDeployModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold cursor-pointer"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold cursor-pointer shadow-md"
                >
                  {language === 'am' ? 'ስምሪት አረጋግጥ' : 'Deploy Bus'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Reschedule / Edit Trip Controls */}
      {editingTrip && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                {language === 'am' ? 'የአውቶቡስ ጉዞ መቆጣጠሪያ' : 'Manage Bus Schedule & Gate'}
              </h3>
              <button
                onClick={() => setEditingTrip(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateTrip} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {language === 'am' ? 'የመነሻ ቀን' : 'Departure Date'}
                </label>
                <input
                  type="date"
                  required
                  value={editDate}
                  onChange={(e) => setEditDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-semibold outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {language === 'am' ? 'የመነሻ ሰዓት' : 'Departure Time'}
                </label>
                <input
                  type="text"
                  required
                  value={editTime}
                  onChange={(e) => setEditTime(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-mono-code outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {language === 'am' ? 'መነሻ በር / ፌርማታ' : 'Gate / Bay'}
                </label>
                <input
                  type="text"
                  required
                  value={editGate}
                  onChange={(e) => setEditGate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {language === 'am' ? 'ሁኔታ' : 'Trip Status'}
                </label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as TripStatus)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                >
                  <option value="scheduled">Scheduled</option>
                  <option value="boarding">Boarding</option>
                  <option value="departed">Departed / In-Transit</option>
                  <option value="arrived">Arrived</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingTrip(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold cursor-pointer"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold cursor-pointer"
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
