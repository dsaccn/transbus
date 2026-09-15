import React, { useState } from 'react';
import { useTransport } from '../../context/TransportContext';
import { Route, Trip } from '../../types';
import {
  MapPin,
  Plus,
  Edit2,
  Trash2,
  Clock,
  Compass,
  DollarSign,
  CheckCircle2,
  XCircle,
  X,
  AlertCircle,
  Calendar,
  Bus,
  Search,
  Sliders,
  Send,
  ArrowRight,
  ArrowLeftRight,
  Sparkles,
} from 'lucide-react';

export const RouteManagement: React.FC = () => {
  const {
    t,
    language,
    routes,
    trips,
    vehicles,
    addRoute,
    updateRoute,
    deleteRoute,
    addTrip,
    dispatchTrip,
    startBoardingTrip,
  } = useTransport();

  // Active view toggle: 'catalog' | 'scheduler'
  const [activeSection, setActiveSection] = useState<'catalog' | 'scheduler'>('catalog');

  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [showDeployModal, setShowDeployModal] = useState<boolean>(false);
  const [editingRoute, setEditingRoute] = useState<Route | null>(null);
  const [searchDestination, setSearchDestination] = useState<string>('');

  // Route Form State
  const [originEn, setOriginEn] = useState<string>('Addis Ababa');
  const [originAm, setOriginAm] = useState<string>('አዲስ አበባ');
  const [destEn, setDestEn] = useState<string>('');
  const [destAm, setDestAm] = useState<string>('');
  const [distanceKm, setDistanceKm] = useState<number>(300);
  const [estDuration, setEstDuration] = useState<number>(5.0);
  const [baseFare, setBaseFare] = useState<number>(500);
  const [viaTowns, setViaTowns] = useState<string>('');

  // Scheduler Form State
  const todayStr = new Date().toISOString().split('T')[0];
  const [schedRouteId, setSchedRouteId] = useState<string>(routes[0]?.id || '');
  const [schedStartPoint, setSchedStartPoint] = useState<string>(routes[0]?.originNameEn || '');
  const [schedEndPoint, setSchedEndPoint] = useState<string>(routes[0]?.destinationNameEn || '');
  const [schedVehicleId, setSchedVehicleId] = useState<string>(vehicles[0]?.id || '');
  const [schedDate, setSchedDate] = useState<string>(todayStr);
  const [schedTime, setSchedTime] = useState<string>('06:30 AM');
  const [schedGate, setSchedGate] = useState<string>('Gate 01');
  const [schedPrice, setSchedPrice] = useState<number>(routes[0]?.baseFare || 350);

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

  const selectedSchedRoute = routes.find((r) => r.id === schedRouteId) || routes[0];

  const handleSchedStartPointChange = (newStart: string) => {
    setSchedStartPoint(newStart);
    const exactMatch = routes.find(
      (r) => r.originNameEn === newStart && r.destinationNameEn === schedEndPoint
    );
    if (exactMatch) {
      setSchedRouteId(exactMatch.id);
      setSchedPrice(exactMatch.baseFare);
    } else {
      const anyMatch = routes.find((r) => r.originNameEn === newStart);
      if (anyMatch) {
        setSchedEndPoint(anyMatch.destinationNameEn);
        setSchedRouteId(anyMatch.id);
        setSchedPrice(anyMatch.baseFare);
      }
    }
  };

  const handleSchedEndPointChange = (newEnd: string) => {
    setSchedEndPoint(newEnd);
    const exactMatch = routes.find(
      (r) => r.originNameEn === schedStartPoint && r.destinationNameEn === newEnd
    );
    if (exactMatch) {
      setSchedRouteId(exactMatch.id);
      setSchedPrice(exactMatch.baseFare);
    } else {
      const anyMatch = routes.find((r) => r.destinationNameEn === newEnd);
      if (anyMatch) {
        setSchedStartPoint(anyMatch.originNameEn);
        setSchedRouteId(anyMatch.id);
        setSchedPrice(anyMatch.baseFare);
      }
    }
  };

  const handleSchedSwap = () => {
    const nextStart = schedEndPoint;
    const nextEnd = schedStartPoint;
    const directMatch = routes.find(
      (r) => r.originNameEn === nextStart && r.destinationNameEn === nextEnd
    );
    if (directMatch) {
      setSchedStartPoint(nextStart);
      setSchedEndPoint(nextEnd);
      setSchedRouteId(directMatch.id);
      setSchedPrice(directMatch.baseFare);
    } else {
      handleSchedStartPointChange(nextStart);
    }
  };

  const resetForm = () => {
    setOriginEn('Addis Ababa');
    setOriginAm('አዲስ አበባ');
    setDestEn('');
    setDestAm('');
    setDistanceKm(300);
    setEstDuration(5.0);
    setBaseFare(500);
    setViaTowns('');
    setEditingRoute(null);
    setShowAddModal(false);
  };

  const handleRouteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!destEn.trim()) return;

    const stops = viaTowns
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    if (editingRoute) {
      updateRoute(editingRoute.id, {
        originNameEn: originEn.trim(),
        originNameAm: originAm.trim(),
        destinationNameEn: destEn.trim(),
        destinationNameAm: destAm.trim() || destEn.trim(),
        distanceKm,
        estimatedDurationHours: estDuration,
        baseFare,
        viaTownsEn: stops,
        viaTownsAm: stops,
      });
    } else {
      const rand = Math.floor(100 + Math.random() * 900);
      addRoute({
        routeCode: `RT-${destEn.slice(0, 3).toUpperCase()}-${rand}`,
        originStationId: 'stn-addis',
        destinationStationId: `stn-${destEn.toLowerCase()}`,
        originNameEn: originEn.trim(),
        originNameAm: originAm.trim(),
        destinationNameEn: destEn.trim(),
        destinationNameAm: destAm.trim() || destEn.trim(),
        distanceKm,
        estimatedDurationHours: estDuration,
        baseFare,
        viaTownsEn: stops,
        viaTownsAm: stops,
        status: 'active',
      });
    }
    resetForm();
  };

  const openEdit = (r: Route) => {
    setEditingRoute(r);
    setOriginEn(r.originNameEn);
    setOriginAm(r.originNameAm);
    setDestEn(r.destinationNameEn);
    setDestAm(r.destinationNameAm);
    setDistanceKm(r.distanceKm);
    setEstDuration(r.estimatedDurationHours);
    setBaseFare(r.baseFare);
    setViaTowns(r.viaTownsEn.join(', '));
    setShowAddModal(true);
  };

  const handleSchedulerRouteChange = (rId: string) => {
    setSchedRouteId(rId);
    const r = routes.find((x) => x.id === rId);
    if (r) setSchedPrice(r.baseFare);
  };

  const handleDeploySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const vehicle = vehicles.find((v) => v.id === schedVehicleId);
    const route = routes.find((r) => r.id === schedRouteId);
    if (!vehicle || !route) return;

    addTrip({
      routeId: schedRouteId,
      vehicleId: schedVehicleId,
      driverName: vehicle.driverName,
      departureDate: schedDate,
      departureTime: schedTime,
      gateNumber: schedGate,
      pricePerSeat: schedPrice,
      totalSeatsCount: vehicle.totalSeats,
      status: 'scheduled',
    });

    setShowDeployModal(false);
  };

  const filteredRoutes = routes.filter((r) => {
    if (!searchDestination.trim()) return true;
    const q = searchDestination.toLowerCase();
    return (
      r.destinationNameEn.toLowerCase().includes(q) ||
      r.destinationNameAm.toLowerCase().includes(q) ||
      r.originNameEn.toLowerCase().includes(q) ||
      r.originNameAm.toLowerCase().includes(q) ||
      r.routeCode.toLowerCase().includes(q)
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold">
            <Compass className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">{t.routesTitle}</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {language === 'am'
                ? 'የመዳረሻዎች ዝርዝር፣ ይፋዊ የትኬት ዋጋዎች እና የመኪና ስምሪት መርሃግብር'
                : 'Destinations catalog, official seat fares, and vehicle deployment scheduler'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowDeployModal(true)}
            className="px-4 py-2.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-xl transition shadow-md cursor-pointer flex items-center gap-2"
          >
            <Calendar className="w-4 h-4" />
            <span>{language === 'am' ? 'የመኪና ስምሪት መርሃግብር (Scheduler)' : 'Schedule Car Deployment'}</span>
          </button>

          <button
            id="add-route-btn"
            onClick={() => {
              resetForm();
              setShowAddModal(true);
            }}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition shadow-md cursor-pointer flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>{t.addNewRoute}</span>
          </button>
        </div>
      </div>

      {/* Navigation Switch between Catalog and Scheduler */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveSection('catalog')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeSection === 'catalog'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <MapPin className="w-3.5 h-3.5" />
          <span>{language === 'am' ? 'የመዳረሻዎች እና የዋጋ ዝርዝር' : 'Routes & Tariffs Catalog'}</span>
          <span className="text-[10px] bg-slate-800 text-emerald-400 px-1.5 py-0.2 rounded-md">
            {routes.length}
          </span>
        </button>

        <button
          onClick={() => setActiveSection('scheduler')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeSection === 'scheduler'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Calendar className="w-3.5 h-3.5 text-amber-400" />
          <span>{language === 'am' ? 'የመኪና ስምሪት መርሃግብር (Car Deployment Scheduler)' : 'Car Deployment Scheduler'}</span>
          <span className="text-[10px] bg-slate-800 text-amber-300 px-1.5 py-0.2 rounded-md">
            {trips.length}
          </span>
        </button>
      </div>

      {/* VIEW 1: DESTINATIONS & TARIFFS CATALOG */}
      {activeSection === 'catalog' && (
        <div className="space-y-4">
          {/* Search bar */}
          <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-2">
            <Search className="w-4 h-4 text-slate-400 ml-2" />
            <input
              type="text"
              value={searchDestination}
              onChange={(e) => setSearchDestination(e.target.value)}
              placeholder={language === 'am' ? 'መዳረሻ ከተማ ወይም የመስመር ኮድ ፈልግ...' : 'Search destination city or route code...'}
              className="w-full text-xs text-slate-900 bg-transparent outline-none"
            />
            {searchDestination && (
              <button
                onClick={() => setSearchDestination('')}
                className="text-xs text-slate-400 hover:text-slate-600 mr-2"
              >
                ✕
              </button>
            )}
          </div>

          {/* Routes Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredRoutes.map((r) => (
              <div
                key={r.id}
                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between hover:shadow-md transition"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono-code text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      {r.routeCode}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        r.status === 'active'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {r.status}
                    </span>
                  </div>

                  {/* Origin to Destination */}
                  <div className="my-3 pb-3 border-b border-slate-100">
                    <div className="text-[10px] text-slate-400 uppercase font-bold">{t.fromLabel}</div>
                    <div className="font-bold text-slate-800 text-xs">
                      {language === 'am' ? r.originNameAm : r.originNameEn}
                    </div>
                    <div className="text-slate-400 text-xs my-0.5">⬇</div>
                    <div className="text-[10px] text-slate-400 uppercase font-bold">{t.toLabel}</div>
                    <div className="font-black text-emerald-800 text-base">
                      {language === 'am' ? r.destinationNameAm : r.destinationNameEn}
                    </div>
                  </div>

                  {/* Distance & Duration */}
                  <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-200 mb-3">
                    <div>
                      <span className="text-slate-500 block text-[10px] uppercase font-bold">{t.distance}:</span>
                      <span className="font-bold font-mono-code text-slate-900">{r.distanceKm} km</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px] uppercase font-bold">{t.estTime}:</span>
                      <span className="font-bold font-mono-code text-slate-900">~{r.estimatedDurationHours} hrs</span>
                    </div>
                  </div>

                  {/* Via Stops */}
                  {r.viaTownsEn && r.viaTownsEn.length > 0 && (
                    <div className="mb-3">
                      <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">
                        {t.viaStops}:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {r.viaTownsEn.map((stop, i) => (
                          <span
                            key={i}
                            className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md"
                          >
                            {stop}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Price and Actions */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">{t.basePrice}:</span>
                    <span className="font-mono-code font-black text-emerald-700 text-lg">
                      {r.baseFare} <span className="text-xs font-normal">ETB</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEdit(r)}
                      className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                      title="Edit Route & Tariff"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteRoute(r.id)}
                      className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                      title="Delete Route"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW 2: SCHEDULER OF CAR DEPLOYMENT */}
      {activeSection === 'scheduler' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                {language === 'am' ? 'የመኪና ስምሪት መርሃግብር' : 'Scheduled Car Deployments'}
              </h3>
              <p className="text-xs text-slate-500">
                {language === 'am'
                  ? 'ለመስመሮች የተመደቡ መኪናዎች፣ የመነሻ ቀንና ሰዓት፣ በር እና የመቀመጫ ታሪፍ'
                  : 'Vehicles scheduled on routes with departure time, bay number, and seat fares'}
              </p>
            </div>
            <button
              onClick={() => setShowDeployModal(true)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{language === 'am' ? 'አዲስ ስምሪት መድብ' : 'Schedule New Deployment'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {trips.map((tItem) => {
              const r = routes.find((x) => x.id === tItem.routeId);
              const v = vehicles.find((x) => x.id === tItem.vehicleId);

              return (
                <div
                  key={tItem.id}
                  className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="font-mono-code font-bold text-xs bg-slate-900 text-white px-2.5 py-0.5 rounded-lg">
                      {v?.plateNumber}
                    </span>
                    {v?.sideNumber && (
                      <span className="text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded-lg">
                        Side #{v.sideNumber}
                      </span>
                    )}
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        tItem.status === 'boarding'
                          ? 'bg-amber-100 text-amber-800'
                          : tItem.status === 'departed'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {tItem.status}
                    </span>
                  </div>

                  <div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase">Route</div>
                    <div className="font-extrabold text-sm text-slate-900 flex items-center gap-1 mt-0.5">
                      <span>{language === 'am' ? r?.originNameAm : r?.originNameEn}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-800">
                        {language === 'am' ? r?.destinationNameAm : r?.destinationNameEn}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Departure</span>
                      <span className="font-mono-code font-bold text-slate-800">
                        {tItem.departureDate}
                      </span>
                      <div className="font-mono-code text-slate-600 text-[11px]">{tItem.departureTime}</div>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Bay & Fare</span>
                      <span className="font-bold text-slate-800">{tItem.gateNumber}</span>
                      <div className="font-mono-code font-bold text-emerald-700 text-[11px]">
                        {tItem.pricePerSeat} ETB / seat
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between text-xs border-t border-slate-100">
                    <span className="text-slate-500">
                      Seats: <span className="font-mono-code font-bold text-slate-900">{tItem.bookedSeatsCount} / {v?.totalSeats || tItem.totalSeatsCount}</span>
                    </span>
                    {tItem.status === 'scheduled' && (
                      <button
                        onClick={() => startBoardingTrip(tItem.id)}
                        className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-bold text-[11px] cursor-pointer"
                      >
                        Boarding
                      </button>
                    )}
                    {tItem.status === 'boarding' && (
                      <button
                        onClick={() => dispatchTrip(tItem.id)}
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-[11px] cursor-pointer"
                      >
                        Dispatch
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MODAL: Add / Edit Route */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                {editingRoute ? 'Edit Route & Official Tariff' : t.addNewRoute}
              </h3>
              <button
                onClick={resetForm}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRouteSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Origin (EN) *</label>
                  <input
                    type="text"
                    required
                    value={originEn}
                    onChange={(e) => setOriginEn(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">መነሻ (አማርኛ)</label>
                  <input
                    type="text"
                    value={originAm}
                    onChange={(e) => setOriginAm(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Destination (EN) *</label>
                  <input
                    type="text"
                    required
                    value={destEn}
                    onChange={(e) => setDestEn(e.target.value)}
                    placeholder="e.g. Hawassa"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">መዳረሻ (አማርኛ)</label>
                  <input
                    type="text"
                    value={destAm}
                    onChange={(e) => setDestAm(e.target.value)}
                    placeholder="ለምሳሌ፡ ሀዋሳ"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Distance (km)</label>
                  <input
                    type="number"
                    min="10"
                    value={distanceKm}
                    onChange={(e) => setDistanceKm(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 font-mono-code outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Duration (hrs)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={estDuration}
                    onChange={(e) => setEstDuration(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 font-mono-code outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Fare (ETB) *</label>
                  <input
                    type="number"
                    required
                    min="10"
                    value={baseFare}
                    onChange={(e) => setBaseFare(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 font-mono-code font-bold outline-none focus:ring-2 focus:ring-emerald-500 text-emerald-700"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Transit Towns / Stops (comma-separated)
                </label>
                <input
                  type="text"
                  value={viaTowns}
                  onChange={(e) => setViaTowns(e.target.value)}
                  placeholder="Bishoftu, Mojo, Zeway..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={resetForm}
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

      {/* MODAL: Schedule of Car Deployment */}
      {showDeployModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                  <Calendar className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  {language === 'am' ? 'የመኪና ስምሪት መርሃግብር (Car Deployment Scheduler)' : 'Schedule Car Deployment'}
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
                    onClick={handleSchedSwap}
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
                      value={schedStartPoint}
                      onChange={(e) => handleSchedStartPointChange(e.target.value)}
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
                      value={schedEndPoint}
                      onChange={(e) => handleSchedEndPointChange(e.target.value)}
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
                {selectedSchedRoute && (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-2.5 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <div>
                        <span className="font-bold text-slate-900">
                          {language === 'am'
                            ? `${selectedSchedRoute.originNameAm} ➔ ${selectedSchedRoute.destinationNameAm}`
                            : `${selectedSchedRoute.originNameEn} ➔ ${selectedSchedRoute.destinationNameEn}`}
                        </span>
                        <span className="text-[10px] text-emerald-800 ml-2 font-mono-code font-bold">
                          [{selectedSchedRoute.routeCode}]
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 font-bold text-slate-700">
                      <span>{selectedSchedRoute.distanceKm} km</span>
                      <span>•</span>
                      <span>~{selectedSchedRoute.estimatedDurationHours} hrs</span>
                      <span>•</span>
                      <span className="text-emerald-700 font-mono-code">{selectedSchedRoute.baseFare} ETB</span>
                    </div>
                  </div>
                )}

                {/* Direct Route Override */}
                <div>
                  <label className="block font-bold text-slate-500 mb-0.5">
                    {language === 'am' ? 'ወይም ሙሉ መስመር በቀጥታ ይምረጡ' : 'Or select full route directly'}
                  </label>
                  <select
                    value={schedRouteId}
                    onChange={(e) => handleSchedulerRouteChange(e.target.value)}
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

              {/* Select Vehicle with Plate and Side Number */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {language === 'am' ? 'የሚመደበው ተሽከርካሪ (ሰሌዳ እና የጎን ቁጥር) *' : 'Select Vehicle (Plate & Side No) *'}
                </label>
                <select
                  value={schedVehicleId}
                  onChange={(e) => setSchedVehicleId(e.target.value)}
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
                    value={schedDate}
                    onChange={(e) => setSchedDate(e.target.value)}
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
                    value={schedTime}
                    onChange={(e) => setSchedTime(e.target.value)}
                    placeholder="e.g. 06:30 AM"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-mono-code outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Gate & Seat Tariff */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {language === 'am' ? 'መነሻ በር / ፌርማታ *' : 'Gate / Bay *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={schedGate}
                    onChange={(e) => setSchedGate(e.target.value)}
                    placeholder="e.g. Gate 01 or Bay A"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {language === 'am' ? 'የወንበር ታሪፍ (ETB) *' : 'Fare per Seat (ETB) *'}
                  </label>
                  <input
                    type="number"
                    required
                    min={10}
                    value={schedPrice}
                    onChange={(e) => setSchedPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-mono-code font-bold outline-none focus:ring-2 focus:ring-emerald-500 text-emerald-700"
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
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-bold cursor-pointer shadow-md"
                >
                  {language === 'am' ? 'መኪናውን በስምሪት መዝግብ' : 'Deploy & Schedule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
