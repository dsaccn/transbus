import React, { useState } from 'react';
import { useTransport } from '../../context/TransportContext';
import { SeatMap } from '../SeatMap/SeatMap';
import { PaymentMethod } from '../../types';
import {
  MapPin,
  Calendar,
  Clock,
  Bus,
  User,
  Phone,
  CreditCard,
  Printer,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Building2,
  Armchair,
  FileText,
  Users,
  Layers,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const TicketCounter: React.FC = () => {
  const {
    t,
    language,
    routes,
    trips,
    vehicles,
    getSeatsForTrip,
    issueTicket,
    issueMultipleTickets,
    setTicketForPrint,
    setTicketsForPrint,
    currentUser,
  } = useTransport();

  // Filter Dropdowns State
  const [selectedOrigin, setSelectedOrigin] = useState<string>('all');
  const [selectedDestination, setSelectedDestination] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState<string>('');

  // Booking Mode: 'single' (1 seat) or 'group' (multiple seats / family booking)
  const [bookingMode, setBookingMode] = useState<'single' | 'group'>('single');

  // Extract unique origins and destinations
  const uniqueOrigins = Array.from(new Set(routes.map((r) => r.originNameEn)));
  const uniqueDestinations = Array.from(new Set(routes.map((r) => r.destinationNameEn)));

  // Filter routes matching dropdowns
  const matchingRouteIds = new Set(
    routes
      .filter((r) => {
        if (selectedOrigin !== 'all' && r.originNameEn !== selectedOrigin) return false;
        if (selectedDestination !== 'all' && r.destinationNameEn !== selectedDestination) return false;
        return true;
      })
      .map((r) => r.id)
  );

  // Filtered trips
  const availableTrips = trips.filter((tr) => {
    if (!matchingRouteIds.has(tr.routeId)) return false;
    if (selectedDate && tr.departureDate !== selectedDate) return false;
    return tr.status === 'scheduled' || tr.status === 'boarding';
  });

  const [selectedTripId, setSelectedTripId] = useState<string>(
    availableTrips[0]?.id || ''
  );
  const [selectedSeatNumber, setSelectedSeatNumber] = useState<number | null>(null);
  const [selectedSeatNumbers, setSelectedSeatNumbers] = useState<number[]>([]);

  // Sync selected trip if filter drops it
  React.useEffect(() => {
    if (availableTrips.length === 0) {
      setSelectedTripId('');
      setSelectedSeatNumber(null);
      setSelectedSeatNumbers([]);
    } else if (!availableTrips.find((t) => t.id === selectedTripId)) {
      setSelectedTripId(availableTrips[0]?.id || '');
      setSelectedSeatNumber(null);
      setSelectedSeatNumbers([]);
    }
  }, [selectedOrigin, selectedDestination, selectedDate, availableTrips.length]);

  // Passenger Form State (Name & Phone & ID are optional)
  const [passengerName, setPassengerName] = useState<string>('');
  const [passengerPhone, setPassengerPhone] = useState<string>('');
  const [passengerGender, setPassengerGender] = useState<'male' | 'female' | 'other'>('male');
  const [passengerIdNumber, setPassengerIdNumber] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [formError, setFormError] = useState<string>('');

  // Selected Trip & Vehicle data
  const currentTrip = trips.find((t) => t.id === selectedTripId);
  const currentRoute = routes.find((r) => r.id === currentTrip?.routeId);
  const currentVehicle = vehicles.find((v) => v.id === currentTrip?.vehicleId);
  const tripSeats = currentTrip ? getSeatsForTrip(currentTrip.id) : [];

  // Active selected count and seats list
  const activeSeats =
    bookingMode === 'group'
      ? selectedSeatNumbers
      : selectedSeatNumber
      ? [selectedSeatNumber]
      : [];
  const activeSeatCount = activeSeats.length;

  // Calculate pricing
  const baseFare = currentTrip?.pricePerSeat || currentRoute?.baseFare || 0;
  const serviceFee = 15;
  const singleSeatTotal = baseFare + serviceFee;
  const totalAmount = singleSeatTotal * (activeSeatCount > 0 ? activeSeatCount : 1);

  const handleSelectSeat = (seatNo: number) => {
    setFormError('');
    if (bookingMode === 'single') {
      setSelectedSeatNumber(seatNo);
      setSelectedSeatNumbers([seatNo]);
    } else {
      // Group mode toggle
      setSelectedSeatNumbers((prev) =>
        prev.includes(seatNo)
          ? prev.filter((s) => s !== seatNo)
          : [...prev, seatNo].sort((a, b) => a - b)
      );
      setSelectedSeatNumber(seatNo);
    }
  };

  const handleModeChange = (mode: 'single' | 'group') => {
    setBookingMode(mode);
    setFormError('');
    if (mode === 'single') {
      if (selectedSeatNumbers.length > 0) {
        setSelectedSeatNumber(selectedSeatNumbers[0]);
        setSelectedSeatNumbers([selectedSeatNumbers[0]]);
      }
    } else {
      if (selectedSeatNumber && !selectedSeatNumbers.includes(selectedSeatNumber)) {
        setSelectedSeatNumbers([selectedSeatNumber]);
      }
    }
  };

  const resetForm = () => {
    setSelectedSeatNumber(null);
    setSelectedSeatNumbers([]);
    setPassengerName('');
    setPassengerPhone('');
    setPassengerIdNumber('');
    setPaymentMethod('cash');
    setFormError('');
  };

  const handleIssueTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!selectedTripId || !currentTrip) {
      setFormError(
        language === 'am'
          ? 'እባክዎ መጀመሪያ ተሽከርካሪ ይምረጡ'
          : 'Please select a vehicle trip first'
      );
      return;
    }

    if (bookingMode === 'single') {
      if (!selectedSeatNumber) {
        setFormError(
          language === 'am'
            ? 'እባክዎ የተሳፋሪውን መቀመጫ ወንበር ይምረጡ'
            : 'Please click and select an available seat from the layout'
        );
        return;
      }

      setIsSubmitting(true);
      try {
        const issued = await issueTicket({
          tripId: selectedTripId,
          seatNumber: selectedSeatNumber,
          passengerName: passengerName.trim(),
          passengerPhone: passengerPhone.trim(),
          passengerGender,
          passengerIdNumber: passengerIdNumber.trim() || undefined,
          paymentMethod,
        });

        // Trigger celebratory confetti
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.6 },
        });

        // Open printable ticket modal (single or batch)
        setTicketsForPrint([issued]);
        resetForm();
      } catch (err: any) {
        setFormError(err.message || 'Failed to issue ticket');
      } finally {
        setIsSubmitting(false);
      }
    } else {
      // Group / Multi-Seat Mode
      if (selectedSeatNumbers.length === 0) {
        setFormError(
          language === 'am'
            ? 'እባክዎ ቢያንስ አንድ ወይም ከዚያ በላይ መቀመጫዎችን ይምረጡ'
            : 'Please click and select at least one or more seats for the group/family'
        );
        return;
      }

      setIsSubmitting(true);
      try {
        const groupName = passengerName.trim();
        const ticketsData = selectedSeatNumbers.map((seatNum) => ({
          tripId: selectedTripId,
          seatNumber: seatNum,
          passengerName: groupName
            ? selectedSeatNumbers.length > 1
              ? `${groupName} (Seat #${seatNum})`
              : groupName
            : language === 'am'
            ? `ተሳፋሪ (ወንበር #${seatNum})`
            : `Passenger (Seat #${seatNum})`,
          passengerPhone: passengerPhone.trim(),
          passengerGender,
          passengerIdNumber: passengerIdNumber.trim() || undefined,
          paymentMethod,
        }));

        const issuedList = await issueMultipleTickets(ticketsData);

        // Trigger celebratory confetti
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.6 },
        });

        // Open printable ticket modal with all issued tickets ready to print in one document
        setTicketsForPrint(issuedList);
        resetForm();
      } catch (err: any) {
        setFormError(err.message || 'Failed to issue tickets');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const hasActiveTrips = availableTrips.length > 0 && !!currentTrip && !!currentVehicle;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold">
            <Bus className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white">{t.tabTicketCounter}</h2>
              <span className="text-xs font-mono-code bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded border border-emerald-700 font-bold">
                {currentUser.agentCode}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {currentUser.name} ({language === 'am' ? currentUser.nameAm : currentUser.name}) • {t.addisMainTerminal}
            </p>
          </div>
        </div>

        {/* Quick Stats or Reset Button */}
        <div className="flex items-center gap-3">
          {selectedSeatNumber && (
            <button
              onClick={resetForm}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition cursor-pointer border border-slate-700"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{language === 'am' ? 'አዲስ ምርጫ' : 'Reset Form'}</span>
            </button>
          )}
        </div>
      </div>

      {/* STEP 1: New Design - Starting and Ending Destination Dropdowns */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-md space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold">
              1
            </span>
            <h3 className="text-sm font-bold text-slate-900">{t.step1Title}</h3>
          </div>

          <span className="text-xs text-slate-500 font-medium">
            {language === 'am'
              ? 'መነሻ እና መዳረሻ ከተማን በመምረጥ የታሪፍ ዋጋ እና የጉዞ ሰዓት ይመልከቱ'
              : 'Select starting and ending points to view price and departure schedules'}
          </span>
        </div>

        {/* Dropdowns Row: Starting (Origin) + Ending (Destination) + Travel Date */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
          {/* Starting Dropdown */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-emerald-600" />
              <span>{t.startingDestination || 'Starting Point (Origin)'}</span>
            </label>
            <select
              value={selectedOrigin}
              onChange={(e) => setSelectedOrigin(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-semibold outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs cursor-pointer"
            >
              <option value="all">
                {language === 'am' ? 'ሁሉም መነሻዎች (All Origins)' : 'All Starting Points'}
              </option>
              {uniqueOrigins.map((origin) => (
                <option key={origin} value={origin}>
                  📍 {origin}
                </option>
              ))}
            </select>
          </div>

          {/* Ending Dropdown */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
              <ArrowRight className="w-3.5 h-3.5 text-sky-600" />
              <span>{t.endingDestination || 'Ending Destination'}</span>
            </label>
            <select
              value={selectedDestination}
              onChange={(e) => setSelectedDestination(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-semibold outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs cursor-pointer"
            >
              <option value="all">
                {language === 'am' ? 'ሁሉም መዳረሻዎች (All Destinations)' : 'All Destinations'}
              </option>
              {uniqueDestinations.map((dest) => (
                <option key={dest} value={dest}>
                  🏁 {dest}
                </option>
              ))}
            </select>
          </div>

          {/* Travel / Departure Date */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-amber-500" />
              <span>{t.deportedDate || 'Departure Date'}</span>
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-semibold outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs cursor-pointer"
            />
          </div>
        </div>

        {/* Selected Route & Departure Live Price / Schedule Banner */}
        {currentTrip && currentRoute && (
          <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 text-white rounded-2xl p-4 border border-slate-800 shadow-md flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center font-bold">
                <Bus className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-white">
                    {language === 'am'
                      ? `${currentRoute.originNameAm} ➔ ${currentRoute.destinationNameAm}`
                      : `${currentRoute.originNameEn} ➔ ${currentRoute.destinationNameEn}`}
                  </span>
                  {currentVehicle?.sideNumber && (
                    <span className="text-[10px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30 px-2 py-0.5 rounded-full">
                      {language === 'am' ? 'የጎን' : 'Side'} #{currentVehicle.sideNumber}
                    </span>
                  )}
                  <span className="font-mono-code text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded">
                    {currentVehicle?.plateNumber}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
                  <span>Gate {currentTrip.gateNumber}</span>
                  <span>•</span>
                  <span>Trip {currentTrip.tripCode}</span>
                </p>
              </div>
            </div>

            {/* Price and Deported Date/Time Highlight */}
            <div className="flex items-center gap-6">
              {/* Deported Date & Time */}
              <div className="text-right">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">
                  {t.deportedDateTime || 'Departure Date & Time'}
                </span>
                <div className="flex items-center gap-1.5 text-xs text-amber-300 font-mono-code font-bold mt-0.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>{currentTrip.departureDate}</span>
                  <Clock className="w-3.5 h-3.5 text-slate-400 ml-1" />
                  <span>{currentTrip.departureTime}</span>
                </div>
              </div>

              {/* Price / Tariff */}
              <div className="text-right pl-4 border-l border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">
                  {t.routePriceTariff || 'Tariff / Price'}
                </span>
                <div className="font-mono-code font-black text-lg text-emerald-400 mt-0.5">
                  {currentTrip.pricePerSeat} <span className="text-xs font-normal text-slate-300">ETB</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Trips / Vehicles List */}
        {availableTrips.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200 text-slate-500 space-y-2">
            <AlertCircle className="w-8 h-8 text-amber-500 mx-auto" />
            <p className="font-semibold text-sm text-slate-800">{t.noTripsFound}</p>
            <p className="text-xs text-slate-500">
              {language === 'am'
                ? 'ለተመረጠው መነሻ ወይም መዳረሻ ከተማ ዝግጁ ተሽከርካሪ አልተገኘም። እባክዎ ምርጫዎን ያስተካክሉ።'
                : 'No vehicles or scheduled departures available for this starting and ending selection.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {availableTrips.map((trip) => {
              const route = routes.find((r) => r.id === trip.routeId);
              const vehicle = vehicles.find((v) => v.id === trip.vehicleId);
              const isSelected = selectedTripId === trip.id;
              const availableSeats = (vehicle?.totalSeats || trip.totalSeatsCount) - trip.bookedSeatsCount;

              return (
                <button
                  key={trip.id}
                  type="button"
                  onClick={() => {
                    setSelectedTripId(trip.id);
                    setSelectedSeatNumber(null);
                  }}
                  className={`p-4 rounded-2xl border text-left transition relative cursor-pointer ${
                    isSelected
                      ? 'bg-slate-900 text-white border-slate-900 shadow-xl ring-2 ring-emerald-500'
                      : 'bg-slate-50 hover:bg-slate-100/80 border-slate-200 text-slate-900'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase font-mono-code ${
                        isSelected
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {trip.gateNumber}
                    </span>
                    <span
                      className={`text-[10px] font-mono-code font-bold ${
                        isSelected ? 'text-slate-400' : 'text-slate-500'
                      }`}
                    >
                      {trip.tripCode}
                    </span>
                  </div>

                  {/* Route Starting & Ending */}
                  <div className="font-black text-sm mb-1 flex items-center gap-1.5">
                    <span>
                      {language === 'am'
                        ? `${route?.originNameAm} ➔ ${route?.destinationNameAm}`
                        : `${route?.originNameEn} ➔ ${route?.destinationNameEn}`}
                    </span>
                  </div>

                  {/* Deported Date & Time & Vehicle Plate / Side */}
                  <div
                    className={`flex items-center justify-between text-xs mb-3 pt-1 border-t ${
                      isSelected
                        ? 'text-slate-400 border-slate-800'
                        : 'text-slate-500 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-mono-code text-[11px]">
                      <Calendar className="w-3 h-3 text-amber-400" />
                      <span className="font-semibold text-amber-300">{trip.departureDate}</span>
                      <Clock className="w-3 h-3 text-amber-400 ml-1" />
                      <span className="font-bold text-amber-300">{trip.departureTime}</span>
                    </div>
                    <div className="flex items-center gap-1 font-mono-code font-bold text-xs">
                      <span
                        className={`px-2 py-0.5 rounded ${
                          isSelected ? 'bg-slate-800 text-slate-200' : 'bg-slate-200 text-slate-900'
                        }`}
                      >
                        {vehicle?.plateNumber}
                      </span>
                      {vehicle?.sideNumber && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber-500/20 text-amber-300 border border-amber-400/30">
                          #{vehicle.sideNumber}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Seats and Fare Footnote */}
                  <div
                    className={`flex items-center justify-between text-xs pt-2 border-t ${
                      isSelected ? 'border-slate-800' : 'border-slate-200'
                    }`}
                  >
                    <div>
                      <span className="text-[10px] block opacity-70">{t.availableSeats}:</span>
                      <span
                        className={`font-black text-sm ${
                          availableSeats <= 3 ? 'text-rose-400' : 'text-emerald-400'
                        }`}
                      >
                        {availableSeats} / {vehicle?.totalSeats || trip.totalSeatsCount}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] block opacity-70">{t.farePerSeat}:</span>
                      <span className="font-black text-base font-mono-code text-emerald-400">
                        {trip.pricePerSeat} <span className="text-xs font-normal">{t.currency}</span>
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* STEP 2 & STEP 3: Split Layout (Interactive Seat Map + Passenger Details Form) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Section 2: Vehicle Seat Layout (7 cols) */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold">
                2
              </span>
              <span>{t.seatPickerTitle}</span>
            </h3>

            {/* Mode Switcher: Single vs Group / Family */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => handleModeChange('single')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                  bookingMode === 'single'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <User className="w-3 h-3" />
                <span>{t.singleSeatMode || 'Single Seat'}</span>
              </button>
              <button
                type="button"
                onClick={() => handleModeChange('group')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                  bookingMode === 'group'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Users className="w-3 h-3" />
                <span>{t.groupSeatMode || 'Multiple Seats (Group)'}</span>
                {selectedSeatNumbers.length > 0 && (
                  <span className="bg-emerald-800 text-white text-[10px] px-1.5 py-0.2 rounded-full font-mono-code font-bold">
                    {selectedSeatNumbers.length}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* If no active trips or no vehicle, show empty state for Section 2 */}
          {!hasActiveTrips || !currentVehicle ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-sm text-slate-500 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
                <Armchair className="w-6 h-6" />
              </div>
              <div className="font-bold text-sm text-slate-700">{t.seatPickerTitle}</div>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                {t.noTripsPromptSeat}
              </p>
            </div>
          ) : (
            <SeatMap
              vehicle={currentVehicle}
              seats={tripSeats}
              selectedSeatNumber={bookingMode === 'single' ? selectedSeatNumber : null}
              selectedSeatNumbers={activeSeats}
              onSelectSeat={handleSelectSeat}
            />
          )}
        </div>

        {/* Section 3: Passenger Booking Form (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-lg space-y-4">
          <div className="flex flex-wrap items-center justify-between pb-3 border-b border-slate-100 gap-2">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold">
                3
              </span>
              <span>{t.passengerInfoTitle}</span>
            </h3>

            {bookingMode === 'single' && selectedSeatNumber && (
              <span className="bg-emerald-100 text-emerald-900 border border-emerald-300 font-mono-code font-bold text-xs px-2.5 py-1 rounded-lg">
                Seat #{selectedSeatNumber < 10 ? `0${selectedSeatNumber}` : selectedSeatNumber}
              </span>
            )}

            {bookingMode === 'group' && selectedSeatNumbers.length > 0 && (
              <div className="flex flex-wrap items-center gap-1">
                <span className="bg-emerald-600 text-white font-mono-code font-bold text-xs px-2 py-0.5 rounded-lg">
                  {selectedSeatNumbers.length} {language === 'am' ? 'ወንበሮች' : 'Seats'}:
                </span>
                <span className="text-xs font-mono-code font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                  {selectedSeatNumbers.map((s) => `#${s < 10 ? `0${s}` : s}`).join(', ')}
                </span>
              </div>
            )}
          </div>

          {/* If no available vehicle/trips, show empty state for Section 3 as requested */}
          {!hasActiveTrips ? (
            <div className="p-10 text-center bg-slate-50 rounded-xl border border-slate-200 text-slate-500 space-y-2">
              <div className="w-10 h-10 rounded-xl bg-slate-200 text-slate-400 mx-auto flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <p className="text-xs font-semibold text-slate-600">
                {t.noTripsPromptForm}
              </p>
            </div>
          ) : (
            <>
              {formError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <form onSubmit={handleIssueTicket} className="space-y-4">
                {/* Passenger Name (Optional) */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span>
                        {bookingMode === 'group'
                          ? (language === 'am' ? 'የቤተሰብ / የቡድን ስም ወይም መሪ' : 'Group / Family / Contact Name')
                          : t.fullName}
                      </span>
                    </span>
                    <span className="text-[10px] text-slate-400 font-normal">Optional</span>
                  </label>
                  <input
                    id="passenger-name-input"
                    type="text"
                    value={passengerName}
                    onChange={(e) => setPassengerName(e.target.value)}
                    placeholder={
                      bookingMode === 'group'
                        ? (language === 'am' ? 'ምሳሌ፦ የአቶ አበበ ቤተሰብ' : 'e.g. Abebe Family / Tour Group')
                        : t.fullNamePlaceholder
                    }
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition font-medium"
                  />
                </div>

                {/* Phone Number & Gender (Phone is optional) */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span>{t.phoneNumber}</span>
                      </span>
                      <span className="text-[10px] text-slate-400 font-normal">Optional</span>
                    </label>
                    <input
                      id="passenger-phone-input"
                      type="tel"
                      value={passengerPhone}
                      onChange={(e) => setPassengerPhone(e.target.value)}
                      placeholder={t.phonePlaceholder}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition font-mono-code"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {t.gender}
                    </label>
                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        type="button"
                        onClick={() => setPassengerGender('male')}
                        className={`py-1.5 text-xs font-bold rounded-xl border transition cursor-pointer ${
                          passengerGender === 'male'
                            ? 'bg-slate-900 text-white border-slate-900'
                            : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
                        }`}
                      >
                        👨 {t.male}
                      </button>
                      <button
                        type="button"
                        onClick={() => setPassengerGender('female')}
                        className={`py-1.5 text-xs font-bold rounded-xl border transition cursor-pointer ${
                          passengerGender === 'female'
                            ? 'bg-slate-900 text-white border-slate-900'
                            : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
                        }`}
                      >
                        👩 {t.female}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Optional ID */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                    <span>{t.idNumber}</span>
                    <span className="text-[10px] text-slate-400 font-normal">Optional</span>
                  </label>
                  <input
                    id="passenger-id-input"
                    type="text"
                    value={passengerIdNumber}
                    onChange={(e) => setPassengerIdNumber(e.target.value)}
                    placeholder="ID / Passport / Kebele..."
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>

                {/* Payment Method Selector (Updated: Cash, Telebirr, CBE, Abyssinia) */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
                    <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                    <span>{t.paymentMethod}</span>
                  </label>

                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'cash', label: t.payCash, icon: '💵', color: 'border-emerald-500 bg-emerald-50 text-emerald-950' },
                      { id: 'telebirr', label: t.payTelebirr, icon: '📱', color: 'border-sky-500 bg-sky-50 text-sky-950' },
                      { id: 'cbe', label: t.payCbe, icon: '🏦', color: 'border-purple-500 bg-purple-50 text-purple-950' },
                      { id: 'abyssinia', label: t.payAbyssinia, icon: '🏛️', color: 'border-amber-500 bg-amber-50 text-amber-950' },
                    ].map((pm) => (
                      <button
                        key={pm.id}
                        type="button"
                        onClick={() => setPaymentMethod(pm.id as PaymentMethod)}
                        className={`p-2.5 rounded-xl border text-xs font-bold flex items-center gap-2 transition cursor-pointer text-left ${
                          paymentMethod === pm.id
                            ? `${pm.color} ring-2 ring-emerald-500`
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <span className="text-base">{pm.icon}</span>
                        <span className="truncate">{pm.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price Breakdown Summary */}
                <div className="bg-slate-900 text-white p-4 rounded-2xl space-y-2 text-xs">
                  <div className="flex items-center justify-between text-slate-400">
                    <span>
                      {t.baseFareAmount}
                      {activeSeatCount > 1 && ` (${activeSeatCount} × ${baseFare})`}
                    </span>
                    <span className="font-mono-code font-bold text-slate-200">
                      {baseFare * (activeSeatCount || 1)} {t.currency}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400">
                    <span>
                      {t.serviceFee}
                      {activeSeatCount > 1 && ` (${activeSeatCount} × ${serviceFee})`}
                    </span>
                    <span className="font-mono-code font-bold text-slate-200">
                      {serviceFee * (activeSeatCount || 1)} {t.currency}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-sm">
                    <div>
                      <span className="font-bold text-emerald-400">{t.totalPayable}</span>
                      {activeSeatCount > 1 && (
                        <span className="text-[10px] text-slate-400 block">
                          ({activeSeatCount} {language === 'am' ? 'ትኬቶች በአንድ ላይ' : 'tickets batch'})
                        </span>
                      )}
                    </div>
                    <span className="font-black font-mono-code text-xl text-white">
                      {totalAmount} <span className="text-xs font-normal text-slate-400">{t.currency}</span>
                    </span>
                  </div>
                </div>

                {/* Submit / Issue Button */}
                <button
                  id="issue-ticket-btn"
                  type="submit"
                  disabled={isSubmitting || activeSeatCount === 0}
                  className={`w-full py-3 px-4 rounded-xl text-xs font-bold text-white transition flex items-center justify-center gap-2 shadow-lg cursor-pointer ${
                    activeSeatCount === 0
                      ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                      : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-950/40'
                  }`}
                >
                  {isSubmitting ? (
                    <span>{t.issuing}</span>
                  ) : (
                    <>
                      <Printer className="w-4 h-4" />
                      <span>
                        {bookingMode === 'single'
                          ? selectedSeatNumber
                            ? `${t.issueTicketBtn} (Seat #${selectedSeatNumber})`
                            : t.selectASeatPrompt
                          : selectedSeatNumbers.length > 0
                          ? `${t.issueAndPrintAll || 'Issue & Print All'} (${selectedSeatNumbers.length}) ${t.ticketsLabel || 'Tickets'}`
                          : t.selectASeatPrompt}
                      </span>
                    </>
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
