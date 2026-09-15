import React, { useState } from 'react';
import { useTransport } from '../../context/TransportContext';
import { Trip, Vehicle, Route, Ticket, TripStatus } from '../../types';
import {
  Bus,
  Printer,
  CheckCircle2,
  Clock,
  MapPin,
  Users,
  ShieldCheck,
  FileSpreadsheet,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  Plus,
  X,
  Search,
  Filter,
  Calendar,
  RotateCcw,
  Navigation,
  Check,
  Compass,
  ArrowLeftRight,
} from 'lucide-react';

export const ManagerDispatch: React.FC = () => {
  const {
    t,
    language,
    trips,
    vehicles,
    routes,
    tickets,
    addTrip,
    dispatchTrip,
    startBoardingTrip,
    markTripArrived,
    resetTripStatus,
  } = useTransport();

  const [selectedTripId, setSelectedTripId] = useState<string>(trips[0]?.id || '');
  const [showScheduleModal, setShowScheduleModal] = useState<boolean>(false);
  const [tripToDispatch, setTripToDispatch] = useState<Trip | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Form states for scheduling a new trip
  const [formRouteId, setFormRouteId] = useState<string>(routes[0]?.id || '');
  const [formStartPoint, setFormStartPoint] = useState<string>(routes[0]?.originNameEn || '');
  const [formEndPoint, setFormEndPoint] = useState<string>(routes[0]?.destinationNameEn || '');
  const [formVehicleId, setFormVehicleId] = useState<string>(vehicles[0]?.id || '');
  const [formDepartureDate, setFormDepartureDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [formDepartureTime, setFormDepartureTime] = useState<string>('06:30 AM');
  const [formGateNumber, setFormGateNumber] = useState<string>('Gate 03 (Bay A)');
  const [formInitialStatus, setFormInitialStatus] = useState<TripStatus>('scheduled');

  // Distinct starting routes / origins
  const uniqueOrigins = React.useMemo(() => {
    const map = new Map<string, { en: string; am: string }>();
    routes.forEach((r) => {
      if (!map.has(r.originNameEn)) {
        map.set(r.originNameEn, { en: r.originNameEn, am: r.originNameAm });
      }
    });
    return Array.from(map.values());
  }, [routes]);

  // Distinct ending routes / destinations
  const uniqueDestinations = React.useMemo(() => {
    const map = new Map<string, { en: string; am: string }>();
    routes.forEach((r) => {
      if (!map.has(r.destinationNameEn)) {
        map.set(r.destinationNameEn, { en: r.destinationNameEn, am: r.destinationNameAm });
      }
    });
    return Array.from(map.values());
  }, [routes]);

  const selectedFormRoute = routes.find((r) => r.id === formRouteId) || routes[0];

  const handleSelectRouteDirectly = (rId: string) => {
    setFormRouteId(rId);
    const r = routes.find((x) => x.id === rId);
    if (r) {
      setFormStartPoint(r.originNameEn);
      setFormEndPoint(r.destinationNameEn);
    }
  };

  const handleStartPointChange = (newStart: string) => {
    setFormStartPoint(newStart);
    // Try exact match with current destination
    const exactMatch = routes.find(
      (r) => r.originNameEn === newStart && r.destinationNameEn === formEndPoint
    );
    if (exactMatch) {
      setFormRouteId(exactMatch.id);
    } else {
      // Find any route starting with newStart
      const anyMatch = routes.find((r) => r.originNameEn === newStart);
      if (anyMatch) {
        setFormEndPoint(anyMatch.destinationNameEn);
        setFormRouteId(anyMatch.id);
      }
    }
  };

  const handleEndPointChange = (newEnd: string) => {
    setFormEndPoint(newEnd);
    // Try exact match with current origin
    const exactMatch = routes.find(
      (r) => r.originNameEn === formStartPoint && r.destinationNameEn === newEnd
    );
    if (exactMatch) {
      setFormRouteId(exactMatch.id);
    } else {
      // Find any route ending with newEnd
      const anyMatch = routes.find((r) => r.destinationNameEn === newEnd);
      if (anyMatch) {
        setFormStartPoint(anyMatch.originNameEn);
        setFormRouteId(anyMatch.id);
      }
    }
  };

  const handleSwapEndpoints = () => {
    const nextStart = formEndPoint;
    const nextEnd = formStartPoint;
    const directMatch = routes.find(
      (r) => r.originNameEn === nextStart && r.destinationNameEn === nextEnd
    );
    if (directMatch) {
      setFormStartPoint(nextStart);
      setFormEndPoint(nextEnd);
      setFormRouteId(directMatch.id);
    } else {
      handleStartPointChange(nextStart);
    }
  };

  const activeTrip = trips.find((t) => t.id === selectedTripId) || trips[0];
  const activeVehicle = vehicles.find((v) => v.id === activeTrip?.vehicleId);
  const activeRoute = routes.find((r) => r.id === activeTrip?.routeId);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Filtered trips list
  const filteredTrips = trips.filter((tr) => {
    if (statusFilter !== 'all' && tr.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const v = vehicles.find((veh) => veh.id === tr.vehicleId);
      const r = routes.find((rt) => rt.id === tr.routeId);
      const matchPlate = v?.plateNumber.toLowerCase().includes(q);
      const matchDriver = v?.driverName.toLowerCase().includes(q);
      const matchRoute =
        r?.destinationNameEn.toLowerCase().includes(q) ||
        r?.destinationNameAm.toLowerCase().includes(q) ||
        r?.originNameEn.toLowerCase().includes(q);
      const matchTripCode = tr.tripCode.toLowerCase().includes(q);
      return matchPlate || matchDriver || matchRoute || matchTripCode;
    }
    return true;
  });

  // Get passengers booked on this trip
  const tripPassengers = activeTrip
    ? tickets
        .filter((tk) => tk.tripId === activeTrip.id && tk.status !== 'cancelled' && tk.status !== 'refunded')
        .sort((a, b) => a.seatNumber - b.seatNumber)
    : [];

  const totalCollectedForTrip = tripPassengers.reduce((sum, tk) => sum + tk.totalAmount, 0);
  const occupancyPercentage = activeVehicle
    ? Math.round((tripPassengers.length / activeVehicle.totalSeats) * 100)
    : 0;

  const handlePrintManifest = () => {
    window.print();
  };

  const handleCreateTrip = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formRouteId || !formVehicleId) return;

    const selectedVeh = vehicles.find((v) => v.id === formVehicleId);
    const selectedRoute = routes.find((r) => r.id === formRouteId);

    addTrip({
      routeId: formRouteId,
      vehicleId: formVehicleId,
      driverName: selectedVeh?.driverName || '',
      departureDate: formDepartureDate,
      departureTime: formDepartureTime,
      gateNumber: formGateNumber,
      status: formInitialStatus,
      pricePerSeat: selectedRoute ? selectedRoute.baseFare : 350,
      totalSeatsCount: selectedVeh ? selectedVeh.totalSeats : 22,
    });

    setShowScheduleModal(false);
    showToast(language === 'am' ? 'አዲስ ጉዞ በተሳካ ሁኔታ ተመድቧል' : 'New departure trip scheduled successfully');
  };

  const handleConfirmDispatch = () => {
    if (!tripToDispatch) return;
    dispatchTrip(tripToDispatch.id);
    const v = vehicles.find((veh) => veh.id === tripToDispatch.vehicleId);
    showToast(
      language === 'am'
        ? `ተሽከርካሪ ${v?.plateNumber || ''} በተሳካ ሁኔታ ተሰማርቷል (መንገድ ላይ)!`
        : `Vehicle ${v?.plateNumber || ''} dispatched on journey (In Transit)!`
    );
    setTripToDispatch(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-xl flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2 text-xs font-bold">
            <CheckCircle2 className="w-4 h-4 text-emerald-200" />
            <span>{toastMessage}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-emerald-200 hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold">
            <Bus className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">{t.manifestTitle}</h2>
            <p className="text-xs text-slate-400 mt-0.5">{t.manifestSubtitle}</p>
          </div>
        </div>

        {/* Global Dispatch Stats & Action */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-slate-800 px-3 py-2 rounded-xl border border-slate-700 text-xs flex items-center gap-2">
            <span className="text-slate-400 text-[10px] uppercase font-bold">Active Trips:</span>
            <span className="text-white font-bold font-mono-code">{trips.length}</span>
          </div>

          <button
            id="schedule-new-trip-btn"
            onClick={() => setShowScheduleModal(true)}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition shadow-lg shadow-emerald-900/30 cursor-pointer flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>{t.scheduleNewTrip}</span>
          </button>
        </div>
      </div>

      {/* Filter and Trip Selector Strip */}
      <div className="space-y-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <label className="text-xs font-bold text-slate-800 flex items-center gap-2">
            <Bus className="w-4 h-4 text-slate-500" />
            <span>{t.selectVehicleToDispatch}</span>
            <span className="text-xs bg-slate-100 text-slate-700 font-mono-code px-2 py-0.5 rounded-full">
              {filteredTrips.length}
            </span>
          </label>

          <div className="flex flex-wrap items-center gap-2">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search trip, plate, destination..."
                className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none w-48 sm:w-60"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-900 outline-none cursor-pointer"
            >
              <option value="all">All Trip Statuses</option>
              <option value="scheduled">Scheduled Only</option>
              <option value="boarding">Boarding Only</option>
              <option value="departed">Departed Only</option>
              <option value="arrived">Arrived Only</option>
            </select>
          </div>
        </div>

        {/* Trips Grid */}
        {filteredTrips.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-300 text-slate-500 space-y-3">
            <Bus className="w-8 h-8 text-slate-400 mx-auto" />
            <p className="text-xs">No departure trips matched your search filter.</p>
            <button
              onClick={() => setShowScheduleModal(true)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition cursor-pointer"
            >
              + {t.scheduleNewTrip}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredTrips.map((tr) => {
              const v = vehicles.find((veh) => veh.id === tr.vehicleId);
              const r = routes.find((rt) => rt.id === tr.routeId);
              const passCount = tickets.filter(
                (tk) => tk.tripId === tr.id && tk.status !== 'cancelled'
              ).length;
              const isSelected = selectedTripId === tr.id;

              return (
                <div
                  key={tr.id}
                  id={`dispatch-trip-card-${tr.id}`}
                  onClick={() => setSelectedTripId(tr.id)}
                  className={`p-3.5 rounded-xl border-2 text-left transition cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-slate-900 text-white border-blue-500 shadow-md ring-2 ring-blue-500/20'
                      : 'bg-slate-50 text-slate-800 border-slate-200 hover:border-slate-300 hover:bg-white'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-xs font-mono-code font-bold px-2 py-0.5 rounded ${
                        isSelected ? 'bg-slate-800 text-slate-200' : 'bg-slate-200 text-slate-900'
                      }`}>
                        {v?.plateNumber || 'N/A'}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                          tr.status === 'departed'
                            ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                            : tr.status === 'boarding'
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : tr.status === 'arrived'
                            ? 'bg-slate-500/20 text-slate-400 border border-slate-500/30'
                            : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        }`}
                      >
                        {tr.status}
                      </span>
                    </div>

                    <div className="font-bold text-xs line-clamp-1 mb-1">
                      {language === 'am'
                        ? `${r?.originNameAm} ➔ ${r?.destinationNameAm}`
                        : `${r?.originNameEn} ➔ ${r?.destinationNameEn}`}
                    </div>

                    <div className={`text-[11px] ${isSelected ? 'text-slate-400' : 'text-slate-500'}`}>
                      Driver: <span className="font-semibold">{v?.driverName}</span>
                    </div>
                  </div>

                  <div className="pt-2 mt-2 border-t border-slate-200 dark:border-slate-800 space-y-2">
                    <div className={`flex items-center justify-between text-[11px] ${
                      isSelected ? 'text-slate-400' : 'text-slate-500'
                    }`}>
                      <span>{tr.departureTime} • {tr.gateNumber}</span>
                      <span className={`font-bold font-mono-code ${isSelected ? 'text-emerald-400' : 'text-emerald-700'}`}>
                        {passCount}/{v?.totalSeats || tr.totalSeatsCount} seats
                      </span>
                    </div>

                    {/* Quick Action Button on Card */}
                    <div className="flex items-center gap-1.5 pt-1" onClick={(e) => e.stopPropagation()}>
                      {tr.status === 'scheduled' && (
                        <button
                          type="button"
                          onClick={() => {
                            startBoardingTrip(tr.id);
                            showToast(t.tripBoardingSuccess);
                          }}
                          className="flex-1 py-1 px-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-[10px] rounded-lg transition text-center cursor-pointer flex items-center justify-center gap-1"
                        >
                          <Clock className="w-3 h-3" />
                          <span>Boarding</span>
                        </button>
                      )}

                      {tr.status !== 'departed' && tr.status !== 'arrived' && (
                        <button
                          type="button"
                          onClick={() => setTripToDispatch(tr)}
                          className="flex-1 py-1 px-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] rounded-lg transition text-center cursor-pointer flex items-center justify-center gap-1 shadow-sm"
                        >
                          <Navigation className="w-3 h-3" />
                          <span>Dispatch</span>
                        </button>
                      )}

                      {tr.status === 'departed' && (
                        <button
                          type="button"
                          onClick={() => {
                            markTripArrived(tr.id);
                            showToast(t.tripArrivedSuccess);
                          }}
                          className="flex-1 py-1 px-2 bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold text-[10px] rounded-lg transition text-center cursor-pointer flex items-center justify-center gap-1"
                        >
                          <Check className="w-3 h-3" />
                          <span>Mark Arrived</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Main Manifest Display & Print Sheet */}
      {activeTrip && activeVehicle && activeRoute && (
        <div className="space-y-4">
          {/* Action and Dispatch Controls */}
          <div className="no-print bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="text-xs">
                <span className="text-slate-500 block">Occupancy Rate:</span>
                <div className="flex items-center gap-2">
                  <div className="w-28 bg-slate-100 rounded-full h-3 overflow-hidden border border-slate-200">
                    <div
                      className={`h-full ${
                        occupancyPercentage >= 80 ? 'bg-emerald-500' : 'bg-blue-500'
                      }`}
                      style={{ width: `${Math.min(occupancyPercentage, 100)}%` }}
                    ></div>
                  </div>
                  <span className="font-bold font-mono-code text-slate-900 text-xs">
                    {occupancyPercentage}% ({tripPassengers.length}/{activeVehicle.totalSeats})
                  </span>
                </div>
              </div>

              {/* Status Badge */}
              <div className="hidden sm:flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl border bg-slate-50 border-slate-200">
                <span className="text-slate-500">Status:</span>
                <span className={`uppercase font-mono-code ${
                  activeTrip.status === 'departed'
                    ? 'text-indigo-600'
                    : activeTrip.status === 'boarding'
                    ? 'text-amber-600'
                    : activeTrip.status === 'arrived'
                    ? 'text-slate-600'
                    : 'text-emerald-600'
                }`}>
                  {activeTrip.status}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                id="print-manifest-btn"
                onClick={handlePrintManifest}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-2"
              >
                <Printer className="w-4 h-4" />
                <span>{t.printManifest}</span>
              </button>

              {activeTrip.status === 'scheduled' && (
                <button
                  id="open-boarding-btn"
                  onClick={() => {
                    startBoardingTrip(activeTrip.id);
                    showToast(t.tripBoardingSuccess);
                  }}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black rounded-xl transition cursor-pointer flex items-center gap-2"
                >
                  <Clock className="w-4 h-4" />
                  <span>{t.markBoarding}</span>
                </button>
              )}

              {activeTrip.status !== 'departed' && activeTrip.status !== 'arrived' && (
                <button
                  id="dispatch-trip-btn"
                  onClick={() => setTripToDispatch(activeTrip)}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black rounded-xl transition shadow-md hover:shadow-lg cursor-pointer flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{t.dispatchVehicle}</span>
                </button>
              )}

              {activeTrip.status === 'departed' && (
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-indigo-50 text-indigo-700 border border-indigo-200 font-bold px-3 py-2 rounded-xl flex items-center gap-1.5">
                    <Navigation className="w-3.5 h-3.5 text-indigo-600 animate-pulse" />
                    <span>In Transit on Route</span>
                  </span>
                  <button
                    id="mark-arrived-btn"
                    onClick={() => {
                      markTripArrived(activeTrip.id);
                      showToast(t.tripArrivedSuccess);
                    }}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5"
                  >
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>{t.markArrived}</span>
                  </button>
                  <button
                    onClick={() => {
                      resetTripStatus(activeTrip.id);
                      showToast(language === 'am' ? 'የጉዞው ሁኔታ ወደ ቀጠሮ ተመልሷል' : 'Trip status reset to scheduled');
                    }}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-medium rounded-xl transition cursor-pointer flex items-center gap-1"
                    title="Reset Status"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {activeTrip.status === 'arrived' && (
                <button
                  onClick={() => {
                    resetTripStatus(activeTrip.id);
                    showToast(language === 'am' ? 'የጉዞው ሁኔታ ወደ ቀጠሮ ተመልሷል' : 'Trip status reset to scheduled');
                  }}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition cursor-pointer flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{t.resetToScheduled}</span>
                </button>
              )}
            </div>
          </div>

          {/* Official Passenger Manifest Sheet */}
          <div className="bg-white rounded-2xl p-6 border-2 border-slate-300 shadow-xl space-y-6 print:p-0 print:border-none print:shadow-none print:rounded-none">
            {/* Header */}
            <div className="border-b-2 border-slate-900 pb-4 text-center space-y-1">
              <div className="text-[11px] font-bold tracking-wider text-slate-700 uppercase">
                {t.officialTicketHeader}
              </div>
              <div className="text-base sm:text-lg font-black text-slate-950 uppercase tracking-tight">
                PASSENGER DISPATCH MANIFEST • የተሳፋሪዎች ኦፊሴላዊ ማኒፌስት
              </div>
              <div className="text-xs text-slate-600 font-medium">
                Addis Ababa Central Intercity Bus Terminal • Addis Dispatch Control
              </div>
            </div>

            {/* Trip Specs Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs font-medium">
              <div>
                <span className="text-slate-500 text-[10px] uppercase font-bold block">{t.plateNumberLabel}:</span>
                <span className="font-mono-code font-black text-slate-950 text-sm">{activeVehicle.plateNumber}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] uppercase font-bold block">{t.routeLabel}:</span>
                <span className="font-bold text-slate-900">
                  {language === 'am'
                    ? `${activeRoute.originNameAm} ➔ ${activeRoute.destinationNameAm}`
                    : `${activeRoute.originNameEn} ➔ ${activeRoute.destinationNameEn}`}
                </span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] uppercase font-bold block">{t.departDateLabel} &amp; {t.departTimeLabel}:</span>
                <span className="font-bold text-slate-900 font-mono-code">
                  {activeTrip.departureDate} @ {activeTrip.departureTime}
                </span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] uppercase font-bold block">{t.driverAssigned}:</span>
                <span className="font-bold text-slate-900">
                  {activeVehicle.driverName} ({activeVehicle.driverPhone})
                </span>
              </div>
            </div>

            {/* Passenger Manifest Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-slate-200 rounded-lg overflow-hidden">
                <thead className="bg-slate-900 text-white font-bold uppercase text-[10px]">
                  <tr>
                    <th className="py-2.5 px-3">{t.manifestTableSeat}</th>
                    <th className="py-2.5 px-3">{t.manifestTableName}</th>
                    <th className="py-2.5 px-3">{t.manifestTablePhone}</th>
                    <th className="py-2.5 px-3">{t.manifestTableGender}</th>
                    <th className="py-2.5 px-3">{t.manifestTableTicketNo}</th>
                    <th className="py-2.5 px-3">{t.manifestTableStatus}</th>
                    <th className="py-2.5 px-3 text-right">{t.manifestTableFare}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {tripPassengers.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400 italic">
                        No passengers have booked seats for this trip yet.
                      </td>
                    </tr>
                  ) : (
                    tripPassengers.map((tk) => (
                      <tr key={tk.id} className="hover:bg-slate-50">
                        <td className="py-2 px-3">
                          <span className="font-bold font-mono-code bg-slate-200 text-slate-900 px-2 py-0.5 rounded text-[11px]">
                            #{tk.seatNumber < 10 ? `0${tk.seatNumber}` : tk.seatNumber}
                          </span>
                        </td>
                        <td className="py-2 px-3 font-bold text-slate-900">{tk.passengerName}</td>
                        <td className="py-2 px-3 font-mono-code text-slate-700">{tk.passengerPhone}</td>
                        <td className="py-2 px-3 text-slate-600">
                          {tk.passengerGender === 'female' ? (language === 'am' ? 'ሴት' : 'Female') : (language === 'am' ? 'ወንድ' : 'Male')}
                        </td>
                        <td className="py-2 px-3 font-mono-code text-[11px] text-slate-600">{tk.ticketNumber}</td>
                        <td className="py-2 px-3">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                            tk.status === 'boarded'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {tk.status === 'boarded' ? (language === 'am' ? 'ተሳፍሯል' : 'Boarded') : (language === 'am' ? 'ትኬት ተቆርጧል' : 'Issued')}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-right font-mono-code font-bold text-slate-900">
                          {tk.totalAmount} ETB
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
                <tfoot className="bg-slate-100 font-bold text-xs border-t-2 border-slate-300">
                  <tr>
                    <td colSpan={5} className="py-2.5 px-3 text-right">
                      {t.totalPassengers}: {tripPassengers.length} | Total Trip Revenue:
                    </td>
                    <td colSpan={2} className="py-2.5 px-3 text-right font-mono-code text-emerald-800 text-sm font-black">
                      {totalCollectedForTrip} {t.currency}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Driver Declaration & Signatures */}
            <div className="border border-slate-300 rounded-xl p-3 bg-slate-50 text-xs space-y-3">
              <p className="text-[11px] text-slate-700 italic">
                "{t.driverDeclaration}"
              </p>
              <div className="grid grid-cols-2 gap-8 pt-4">
                <div>
                  <div className="border-b border-slate-400 h-6 mb-1"></div>
                  <div className="font-bold text-slate-800">{t.driverSign} ({activeVehicle.driverName})</div>
                  <div className="text-[10px] text-slate-500 font-mono-code">Lic: {activeVehicle.driverLicenseNo}</div>
                </div>
                <div className="text-right">
                  <div className="border-b border-slate-400 h-6 mb-1"></div>
                  <div className="font-bold text-slate-800">{t.managerSign}</div>
                  <div className="text-[10px] text-slate-500">Addis Ababa Station Dispatch Office</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal for Confirming Vehicle Dispatch */}
      {tripToDispatch && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <Navigation className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  {t.confirmDispatchModalTitle}
                </h3>
              </div>
              <button
                onClick={() => setTripToDispatch(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              {t.confirmDispatchMessage}
            </p>

            {/* Trip Details Summary Card */}
            {(() => {
              const v = vehicles.find((veh) => veh.id === tripToDispatch.vehicleId);
              const r = routes.find((rt) => rt.id === tripToDispatch.routeId);
              const passCount = tickets.filter(
                (tk) => tk.tripId === tripToDispatch.id && tk.status !== 'cancelled'
              ).length;

              return (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2 text-xs">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                    <span className="text-slate-500">Trip Code:</span>
                    <span className="font-mono-code font-bold text-slate-900">{tripToDispatch.tripCode}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Route:</span>
                    <span className="font-bold text-slate-900">
                      {language === 'am'
                        ? `${r?.originNameAm} ➔ ${r?.destinationNameAm}`
                        : `${r?.originNameEn} ➔ ${r?.destinationNameEn}`}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Vehicle Plate:</span>
                    <span className="font-mono-code font-bold text-emerald-700">{v?.plateNumber}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Assigned Driver:</span>
                    <span className="font-semibold text-slate-800">{v?.driverName}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Departure:</span>
                    <span className="font-mono-code font-semibold text-slate-800">
                      {tripToDispatch.departureTime} • {tripToDispatch.gateNumber}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                    <span className="text-slate-700 font-bold">Total Passengers Boarded:</span>
                    <span className="font-mono-code font-black text-emerald-800 text-sm">
                      {passCount} / {v?.totalSeats || tripToDispatch.totalSeatsCount}
                    </span>
                  </div>
                </div>
              );
            })()}

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setTripToDispatch(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer"
              >
                {t.cancel}
              </button>
              <button
                id="confirm-dispatch-action-btn"
                type="button"
                onClick={handleConfirmDispatch}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{t.confirm} &amp; {language === 'am' ? 'አሰማራ' : 'Dispatch'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal for Scheduling New Trip */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Bus className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-bold text-slate-900">
                  {t.scheduleTripModalTitle}
                </h3>
              </div>
              <button
                onClick={() => setShowScheduleModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTrip} className="space-y-4">
              {/* Starting and Ending Route Selection */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Compass className="w-4 h-4 text-emerald-600" />
                    {language === 'am' ? 'የመስመር መነሻ እና መድረሻ ምርጫ (Route Selection)' : 'Route Selection (Origin & Destination)'}
                  </span>
                  <button
                    type="button"
                    onClick={handleSwapEndpoints}
                    title={language === 'am' ? 'መነሻ እና መድረሻ ቀያይር' : 'Swap Origin and Destination'}
                    className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-100 hover:bg-emerald-200 px-2 py-1 rounded-lg flex items-center gap-1 transition cursor-pointer"
                  >
                    <ArrowLeftRight className="w-3 h-3" />
                    <span>{language === 'am' ? 'ቀያይር' : 'Swap'}</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {/* Starting Route Selection */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      {language === 'am' ? 'የመነሻ መስመር (Starting Route / Origin) *' : 'Starting Route (Origin) *'}
                    </label>
                    <select
                      value={formStartPoint}
                      onChange={(e) => handleStartPointChange(e.target.value)}
                      className="w-full px-2.5 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 font-semibold outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
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
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      {language === 'am' ? 'የመድረሻ መስመር (Ending Route / Destination) *' : 'Ending Route (Destination) *'}
                    </label>
                    <select
                      value={formEndPoint}
                      onChange={(e) => handleEndPointChange(e.target.value)}
                      className="w-full px-2.5 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 font-semibold outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
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
                {selectedFormRoute && (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-2.5 text-xs flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <div>
                        <span className="font-bold text-slate-900">
                          {language === 'am'
                            ? `${selectedFormRoute.originNameAm} ➔ ${selectedFormRoute.destinationNameAm}`
                            : `${selectedFormRoute.originNameEn} ➔ ${selectedFormRoute.destinationNameEn}`}
                        </span>
                        <span className="text-[10px] text-emerald-800 ml-2 font-mono-code font-bold">
                          [{selectedFormRoute.routeCode}]
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-[11px] font-bold text-slate-700">
                      <span>{selectedFormRoute.distanceKm} km</span>
                      <span>•</span>
                      <span>~{selectedFormRoute.estimatedDurationHours} hrs</span>
                      <span>•</span>
                      <span className="text-emerald-700 font-mono-code">{selectedFormRoute.baseFare} ETB</span>
                    </div>
                  </div>
                )}

                {/* Direct Full Route Selector */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-0.5">
                    {language === 'am' ? 'ወይም ሙሉ መስመር በቀጥታ ይምረጡ' : 'Or select full route catalog directly'}
                  </label>
                  <select
                    value={formRouteId}
                    onChange={(e) => handleSelectRouteDirectly(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
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

              {/* Vehicle & Driver Picker */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t.selectVehiclePrompt} *
                </label>
                <select
                  required
                  value={formVehicleId}
                  onChange={(e) => setFormVehicleId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                >
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.plateNumber} — {v.model} ({v.totalSeats} seats) • Driver: {v.driverName} [{v.status}]
                    </option>
                  ))}
                </select>
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t.departureDatePrompt} *
                  </label>
                  <input
                    type="date"
                    required
                    value={formDepartureDate}
                    onChange={(e) => setFormDepartureDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t.departureTimePrompt} *
                  </label>
                  <input
                    type="text"
                    required
                    value={formDepartureTime}
                    onChange={(e) => setFormDepartureTime(e.target.value)}
                    placeholder="e.g. 06:30 AM or 02:00 PM"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Quick Time Selector Chips */}
              <div className="flex flex-wrap gap-1.5">
                {['06:00 AM', '06:30 AM', '07:00 AM', '08:30 AM', '11:00 AM', '01:30 PM', '04:00 PM'].map((tm) => (
                  <button
                    key={tm}
                    type="button"
                    onClick={() => setFormDepartureTime(tm)}
                    className={`px-2 py-0.5 rounded text-[10px] font-mono-code border transition cursor-pointer ${
                      formDepartureTime === tm
                        ? 'bg-slate-900 text-white border-slate-900 font-bold'
                        : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                    }`}
                  >
                    {tm}
                  </button>
                ))}
              </div>

              {/* Gate / Bay Designation */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t.selectGatePrompt} *
                  </label>
                  <input
                    type="text"
                    required
                    value={formGateNumber}
                    onChange={(e) => setFormGateNumber(e.target.value)}
                    placeholder="Gate 03 (Bay A)"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Initial Status *
                  </label>
                  <select
                    value={formInitialStatus}
                    onChange={(e) => setFormInitialStatus(e.target.value as TripStatus)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                  >
                    <option value="scheduled">Scheduled (የተያዘ)</option>
                    <option value="boarding">Boarding (በመጫን ላይ)</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowScheduleModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>{t.save}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
