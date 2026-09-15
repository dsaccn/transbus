import React, { useState, useMemo } from 'react';
import { Vehicle, Trip, Route, Language } from '../../types';
import {
  Bus,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Clock,
  Users,
  CheckCircle2,
  AlertCircle,
  Plus,
  LayoutGrid,
  List,
  Compass,
  ArrowRight,
  ShieldCheck,
  Tag,
} from 'lucide-react';

interface Props {
  vehicles: Vehicle[];
  trips: Trip[];
  routes: Route[];
  language: Language;
  selectedBusId?: string;
  onSelectBusId?: (busId: string) => void;
  onDeployForVehicle?: (vehicleId: string, defaultDate?: string) => void;
}

export const VehicleRouteCalendarView: React.FC<Props> = ({
  vehicles,
  trips,
  routes,
  language,
  selectedBusId: propSelectedBusId,
  onSelectBusId: propOnSelectBusId,
  onDeployForVehicle,
}) => {
  // Internal or external selected vehicle state
  const [internalBusId, setInternalBusId] = useState<string>(
    propSelectedBusId || vehicles[0]?.id || ''
  );
  const activeBusId = propSelectedBusId || internalBusId;
  const currentVehicleIndex = vehicles.findIndex((v) => v.id === activeBusId);
  const activeBus =
    vehicles.find((v) => v.id === activeBusId) || vehicles[0];

  const handleSelectBus = (newId: string) => {
    setInternalBusId(newId);
    if (propOnSelectBusId) {
      propOnSelectBusId(newId);
    }
  };

  const handlePrevBus = () => {
    if (vehicles.length === 0) return;
    const nextIdx =
      currentVehicleIndex <= 0 ? vehicles.length - 1 : currentVehicleIndex - 1;
    handleSelectBus(vehicles[nextIdx].id);
  };

  const handleNextBus = () => {
    if (vehicles.length === 0) return;
    const nextIdx =
      currentVehicleIndex >= vehicles.length - 1 ? 0 : currentVehicleIndex + 1;
    handleSelectBus(vehicles[nextIdx].id);
  };

  // Calendar Month State (Year & Month: 0-indexed month)
  const today = new Date();
  const [currentYear, setCurrentYear] = useState<number>(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState<number>(today.getMonth());
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Selected date clicked in calendar
  const todayIso = today.toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState<string>(todayIso);

  // Month navigation
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const handleGoToday = () => {
    const now = new Date();
    setCurrentYear(now.getFullYear());
    setCurrentMonth(now.getMonth());
    setSelectedDate(now.toISOString().split('T')[0]);
  };

  // Filter trips for the active vehicle
  const busTrips = useMemo(() => {
    if (!activeBus) return [];
    return trips.filter((t) => t.vehicleId === activeBus.id);
  }, [trips, activeBus]);

  // Group trips by departureDate (YYYY-MM-DD)
  const tripsByDate = useMemo(() => {
    const map = new Map<string, Trip[]>();
    busTrips.forEach((t) => {
      const arr = map.get(t.departureDate) || [];
      arr.push(t);
      map.set(t.departureDate, arr);
    });
    return map;
  }, [busTrips]);

  // Monthly stats for the active vehicle in currentMonth & currentYear
  const monthPrefix = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;

  const currentMonthTrips = useMemo(() => {
    return busTrips.filter((t) => t.departureDate.startsWith(monthPrefix));
  }, [busTrips, monthPrefix]);

  const uniqueRoutesThisMonth = useMemo(() => {
    const routeIds = new Set(currentMonthTrips.map((t) => t.routeId));
    return routeIds.size;
  }, [currentMonthTrips]);

  const totalPassengersThisMonth = useMemo(() => {
    return currentMonthTrips.reduce((sum, t) => sum + (t.bookedSeatsCount || 0), 0);
  }, [currentMonthTrips]);

  const completedTripsCount = useMemo(() => {
    return currentMonthTrips.filter((t) => t.status === 'arrived').length;
  }, [currentMonthTrips]);

  const scheduledTripsCount = useMemo(() => {
    return currentMonthTrips.filter((t) => t.status !== 'arrived' && t.status !== 'cancelled').length;
  }, [currentMonthTrips]);

  // Calendar Day Grid Computation
  const calendarDays = useMemo(() => {
    // First day of current month
    const firstDay = new Date(currentYear, currentMonth, 1);
    // Day of week for first day (0 = Sunday)
    const startDayOfWeek = firstDay.getDay();

    // Total days in current month
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    const days: Array<{
      dayNumber: number | null;
      dateStr: string | null;
      isToday: boolean;
      isSelected: boolean;
      trips: Trip[];
    }> = [];

    // Leading blanks
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push({
        dayNumber: null,
        dateStr: null,
        isToday: false,
        isSelected: false,
        trips: [],
      });
    }

    // Actual days of the month
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(
        d
      ).padStart(2, '0')}`;
      const dayTrips = tripsByDate.get(dateStr) || [];
      const isToday = dateStr === todayIso;
      const isSelected = dateStr === selectedDate;

      days.push({
        dayNumber: d,
        dateStr,
        isToday,
        isSelected,
        trips: dayTrips,
      });
    }

    return days;
  }, [currentYear, currentMonth, tripsByDate, todayIso, selectedDate]);

  // Helper for Month Name
  const monthNamesEn = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  const monthNamesAm = [
    'ጥር (January)',
    'የካቲት (February)',
    'መጋቢት (March)',
    'ሚያዝያ (April)',
    'ግንቦት (May)',
    'ሰኔ (June)',
    'ሐምሌ (July)',
    'ነሐሴ (August)',
    'መስከረም (September)',
    'ጥቅምት (October)',
    'ኅዳር (November)',
    'ታኅሣሥ (December)',
  ];

  const dayHeaders = [
    { en: 'Sun', am: 'እሁድ' },
    { en: 'Mon', am: 'ሰኞ' },
    { en: 'Tue', am: 'ማክሰኞ' },
    { en: 'Wed', am: 'ረቡዕ' },
    { en: 'Thu', am: 'ሐሙስ' },
    { en: 'Fri', am: 'ዓርብ' },
    { en: 'Sat', am: 'ቅዳሜ' },
  ];

  // Trips for the selected day
  const selectedDayTrips = tripsByDate.get(selectedDate) || [];

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* 1. Vehicle Selection Bar (Prominent & Simple) */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
            <Bus className="w-5 h-5" />
          </div>

          <div className="space-y-1">
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              {language === 'am' ? 'የሚመረጠው አውቶቡስ (Select Bus)' : 'Select Bus to View Calendar'}
            </label>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handlePrevBus}
                title="Previous Bus"
                className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <select
                value={activeBus?.id || ''}
                onChange={(e) => handleSelectBus(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer min-w-[280px]"
              >
                {vehicles.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.plateNumber} {v.sideNumber ? `(Side #${v.sideNumber})` : ''} - {v.model} ({v.totalSeats} seats) • {v.driverName}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={handleNextBus}
                title="Next Bus"
                className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Selected Bus Info Badges */}
        {activeBus && (
          <div className="flex flex-wrap items-center gap-2.5 text-xs">
            <div className="bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Plate Number</span>
              <span className="font-mono-code font-bold text-slate-900">{activeBus.plateNumber}</span>
            </div>

            {activeBus.sideNumber && (
              <div className="bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Side No.</span>
                <span className="font-mono-code font-bold text-emerald-700">#{activeBus.sideNumber}</span>
              </div>
            )}

            <div className="bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Capacity</span>
              <span className="font-mono-code font-bold text-slate-900">{activeBus.totalSeats} Seats</span>
            </div>

            <div className="bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Driver</span>
              <span className="font-semibold text-slate-800">{activeBus.driverName}</span>
            </div>

            {onDeployForVehicle && (
              <button
                onClick={() => onDeployForVehicle(activeBus.id, selectedDate)}
                className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{language === 'am' ? 'ለዚህ መኪና ጉዞ መዝግብ' : 'Deploy This Bus'}</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* 2. Monthly Summary Numbers for this Selected Vehicle */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-slate-400 block text-[10px] font-bold uppercase">
            {language === 'am' ? 'በዚህ ወር የተመዘገቡ ጉዞዎች' : 'Trips This Month'}
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black font-mono-code text-slate-900">
              {currentMonthTrips.length}
            </span>
            <span className="text-xs text-slate-500 font-semibold">trips</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-purple-200 shadow-xs bg-purple-50/20">
          <span className="text-purple-700 block text-[10px] font-bold uppercase">
            {language === 'am' ? 'የተያዙ መስመሮች' : 'Distinct Routes Covered'}
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black font-mono-code text-purple-700">
              {uniqueRoutesThisMonth}
            </span>
            <span className="text-xs text-purple-600 font-semibold">routes</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-emerald-200 shadow-xs bg-emerald-50/20">
          <span className="text-emerald-700 block text-[10px] font-bold uppercase">
            {language === 'am' ? 'የተሳፋሪዎች ቁጥር' : 'Passengers Booked'}
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black font-mono-code text-emerald-700">
              {totalPassengersThisMonth}
            </span>
            <span className="text-xs text-emerald-600 font-semibold">passengers</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-blue-200 shadow-xs bg-blue-50/20">
          <span className="text-blue-700 block text-[10px] font-bold uppercase">
            {language === 'am' ? 'የተጠናቀቁ / ዝግጁ' : 'Completed / Scheduled'}
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black font-mono-code text-blue-700">
              {completedTripsCount} / {scheduledTripsCount}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Calendar Controls & Month Header */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        {/* Month Navigation */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <button
              onClick={handlePrevMonth}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNextMonth}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-emerald-600" />
            <h3 className="text-base font-black text-slate-900 tracking-tight">
              {language === 'am' ? monthNamesAm[currentMonth] : monthNamesEn[currentMonth]}{' '}
              {currentYear}
            </h3>
          </div>

          <button
            onClick={handleGoToday}
            className="px-2.5 py-1 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg cursor-pointer transition"
          >
            {language === 'am' ? 'ዛሬ (Today)' : 'Today'}
          </button>
        </div>

        {/* View Mode Toggle: Grid vs Agenda List */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs">
          <button
            onClick={() => setViewMode('grid')}
            className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 cursor-pointer ${
              viewMode === 'grid'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>{language === 'am' ? 'የቀን መቁጠሪያ ሰንጠረዥ' : 'Month Grid'}</span>
          </button>

          <button
            onClick={() => setViewMode('list')}
            className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 cursor-pointer ${
              viewMode === 'list'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <List className="w-3.5 h-3.5" />
            <span>{language === 'am' ? 'ዝርዝር እይታ' : 'Schedule List'}</span>
          </button>
        </div>
      </div>

      {/* 4A. VIEW MODE: Monthly Calendar Grid */}
      {viewMode === 'grid' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          {/* Day of week headers */}
          <div className="grid grid-cols-7 bg-slate-50 border-b border-slate-200 text-center py-2.5 text-xs font-bold text-slate-600 uppercase tracking-wider text-[11px]">
            {dayHeaders.map((dh, i) => (
              <div key={i} className="px-1">
                <span>{language === 'am' ? dh.am : dh.en}</span>
              </div>
            ))}
          </div>

          {/* Calendar Day Grid */}
          <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-slate-100 bg-slate-100">
            {calendarDays.map((cd, index) => {
              if (cd.dayNumber === null) {
                return (
                  <div
                    key={`blank-${index}`}
                    className="min-h-[110px] bg-slate-50/50 p-2"
                  />
                );
              }

              const hasTrips = cd.trips.length > 0;
              const isSelected = cd.dateStr === selectedDate;

              return (
                <div
                  key={cd.dateStr}
                  onClick={() => cd.dateStr && setSelectedDate(cd.dateStr)}
                  className={`min-h-[110px] p-2 bg-white flex flex-col justify-between transition cursor-pointer relative ${
                    isSelected
                      ? 'ring-2 ring-emerald-500 bg-emerald-50/20 z-10'
                      : 'hover:bg-slate-50'
                  }`}
                >
                  {/* Day header: Day number & count pill */}
                  <div className="flex items-center justify-between mb-1.5">
                    <span
                      className={`text-xs font-bold font-mono-code w-6 h-6 flex items-center justify-center rounded-full ${
                        cd.isToday
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : isSelected
                          ? 'bg-slate-900 text-white'
                          : 'text-slate-800'
                      }`}
                    >
                      {cd.dayNumber}
                    </span>

                    {hasTrips && (
                      <span className="text-[10px] font-bold font-mono-code px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-200">
                        {cd.trips.length}{' '}
                        {cd.trips.length === 1
                          ? language === 'am'
                            ? 'ጉዞ'
                            : 'trip'
                          : language === 'am'
                          ? 'ጉዞዎች'
                          : 'trips'}
                      </span>
                    )}
                  </div>

                  {/* Day trips preview */}
                  <div className="space-y-1 flex-1 overflow-hidden">
                    {cd.trips.slice(0, 2).map((t) => {
                      const r = routes.find((route) => route.id === t.routeId);
                      const routeTitle = r
                        ? language === 'am'
                          ? `${r.originNameAm} ➔ ${r.destinationNameAm}`
                          : `${r.originNameEn} ➔ ${r.destinationNameEn}`
                        : 'Route';

                      const isCompleted = t.status === 'arrived';
                      const isCancelled = t.status === 'cancelled';

                      return (
                        <div
                          key={t.id}
                          className={`px-1.5 py-1 rounded text-[10px] leading-tight border font-medium truncate ${
                            isCompleted
                              ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                              : isCancelled
                              ? 'bg-rose-50 text-rose-800 border-rose-200'
                              : 'bg-blue-50 text-blue-900 border-blue-200'
                          }`}
                          title={`${routeTitle} (${t.departureTime})`}
                        >
                          <div className="font-bold truncate">{routeTitle}</div>
                          <div className="text-[9px] text-slate-500 font-mono-code flex items-center justify-between">
                            <span>{t.departureTime}</span>
                            <span>{t.bookedSeatsCount || 0} seats</span>
                          </div>
                        </div>
                      );
                    })}

                    {cd.trips.length > 2 && (
                      <span className="text-[9px] font-bold text-slate-500 block text-center">
                        +{cd.trips.length - 2} more
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4B. VIEW MODE: Agenda List (Clean Chronological List) */}
      {viewMode === 'list' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 space-y-3">
          <div className="text-xs font-bold text-slate-700 flex items-center justify-between">
            <span>
              {language === 'am'
                ? `ለአውቶቡስ ${activeBus?.plateNumber || ''} የተመዘገቡ ቀናት`
                : `Scheduled Days for Bus ${activeBus?.plateNumber || ''} (${monthNamesEn[currentMonth]} ${currentYear})`}
            </span>
            <span className="text-slate-500 font-normal">
              {currentMonthTrips.length} total scheduled trips
            </span>
          </div>

          <div className="space-y-2">
            {currentMonthTrips.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                {language === 'am'
                  ? 'በዚህ ወር ለዚህ አውቶቡስ የተመደበ ምንም ጉዞ የለም'
                  : 'No trips scheduled for this vehicle in this month.'}
              </div>
            ) : (
              currentMonthTrips.map((t) => {
                const r = routes.find((route) => route.id === t.routeId);
                const routeTitle = r
                  ? language === 'am'
                    ? `${r.originNameAm} ➔ ${r.destinationNameAm}`
                    : `${r.originNameEn} ➔ ${r.destinationNameEn}`
                  : 'Unknown Route';

                return (
                  <div
                    key={t.id}
                    onClick={() => setSelectedDate(t.departureDate)}
                    className={`p-3 rounded-xl border flex flex-wrap items-center justify-between gap-3 cursor-pointer transition hover:shadow-xs ${
                      t.departureDate === selectedDate
                        ? 'border-emerald-500 bg-emerald-50/40'
                        : 'border-slate-200 bg-slate-50/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-center px-3 py-1.5 bg-white rounded-lg border border-slate-200">
                        <span className="text-[10px] text-slate-400 block font-bold uppercase">
                          Date
                        </span>
                        <span className="font-mono-code font-bold text-xs text-slate-900">
                          {t.departureDate}
                        </span>
                      </div>

                      <div>
                        <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{routeTitle}</span>
                          <span className="text-[10px] font-mono-code text-slate-400">
                            [{r?.routeCode || ''}]
                          </span>
                        </h4>
                        <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-0.5">
                          <span className="flex items-center gap-1 font-mono-code">
                            <Clock className="w-3 h-3 text-slate-400" />
                            {t.departureTime}
                          </span>
                          <span>•</span>
                          <span>Gate: {t.gateNumber || 'Gate 01'}</span>
                          <span>•</span>
                          <span className="text-emerald-700 font-bold font-mono-code">
                            {t.pricePerSeat} ETB
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="text-xs font-bold font-mono-code text-slate-800 block">
                          {t.bookedSeatsCount || 0} / {activeBus?.totalSeats || 22} seats
                        </span>
                        <span className="text-[10px] text-slate-400 block">
                          {Math.round(
                            ((t.bookedSeatsCount || 0) / (activeBus?.totalSeats || 22)) * 100
                          )}
                          % full
                        </span>
                      </div>

                      <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded capitalize ${
                          t.status === 'arrived'
                            ? 'bg-emerald-100 text-emerald-800'
                            : t.status === 'cancelled'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {t.status}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* 5. Selected Day Breakdown Card */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-emerald-600" />
            <h4 className="text-xs font-bold text-slate-900">
              {language === 'am' ? 'የተመረጠው ቀን ዝርዝር (Selected Date):' : 'Day Details:'}{' '}
              <span className="text-emerald-700 font-mono-code">{selectedDate}</span>
            </h4>
            <span className="text-[10px] font-mono-code bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
              {selectedDayTrips.length}{' '}
              {selectedDayTrips.length === 1 ? 'Route / Trip' : 'Routes / Trips'} for{' '}
              {activeBus?.plateNumber}
            </span>
          </div>

          {onDeployForVehicle && (
            <button
              onClick={() => onDeployForVehicle(activeBus.id, selectedDate)}
              className="px-2.5 py-1 text-xs font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg flex items-center gap-1 cursor-pointer transition border border-emerald-200"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>
                {language === 'am' ? 'በዚህ ቀን አዲስ ጉዞ መድብ' : `Deploy Bus on ${selectedDate}`}
              </span>
            </button>
          )}
        </div>

        {selectedDayTrips.length === 0 ? (
          <div className="py-5 text-center text-slate-400 text-xs">
            {language === 'am'
              ? `በ ${selectedDate} ላይ ለዚህ አውቶቡስ ምንም የተመዘገበ ጉዞ የለም።`
              : `No routes scheduled for ${activeBus?.plateNumber || 'this bus'} on ${selectedDate}.`}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {selectedDayTrips.map((trip) => {
              const r = routes.find((route) => route.id === trip.routeId);
              const routeName = r
                ? language === 'am'
                  ? `${r.originNameAm} ➔ ${r.destinationNameAm}`
                  : `${r.originNameEn} ➔ ${r.destinationNameEn}`
                : 'Unknown Route';

              return (
                <div
                  key={trip.id}
                  className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-white hover:border-emerald-300 transition shadow-2xs space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 font-bold text-slate-900 text-xs">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{routeName}</span>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded capitalize ${
                        trip.status === 'arrived'
                          ? 'bg-emerald-100 text-emerald-800'
                          : trip.status === 'cancelled'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {trip.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-[11px] text-slate-600 bg-white p-2 rounded-lg border border-slate-100 font-medium">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Departure</span>
                      <span className="font-mono-code font-bold text-slate-900">
                        {trip.departureTime}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Gate</span>
                      <span className="font-semibold text-slate-800">
                        {trip.gateNumber || 'Gate 01'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Fare</span>
                      <span className="font-mono-code font-bold text-emerald-700">
                        {trip.pricePerSeat} ETB
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">
                      Passengers:{' '}
                      <strong className="text-slate-900 font-mono-code">
                        {trip.bookedSeatsCount || 0} / {activeBus?.totalSeats || 22}
                      </strong>{' '}
                      seats
                    </span>
                    <span className="text-slate-400 font-mono-code text-[10px]">
                      Trip: {trip.tripCode}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
