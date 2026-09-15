import React, { useMemo } from 'react';
import { Vehicle, Trip, Route, Ticket, Language } from '../../types';
import {
  Bus,
  Clock,
  MapPin,
  Users,
  Armchair,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ChevronDown,
  TrendingUp,
  Calendar,
} from 'lucide-react';

export interface SingleBusTripDrillDownVm {
  tripId: string;
  routeName: string;
  departure: string;
  arrival: string | null;
  driver: string;
  status: string;
  seatsSold: number;
  seatsLeft: number;
  capacity: number;
  pricePerSeat: number;
}

interface Props {
  selectedBusId: string;
  onSelectBusId: (busId: string) => void;
  onOpenCalendar?: (busId: string) => void;
  vehicles: Vehicle[];
  trips: Trip[];
  routes: Route[];
  tickets: Ticket[];
  language: Language;
}

export const SingleBusDrillDownView: React.FC<Props> = ({
  selectedBusId,
  onSelectBusId,
  onOpenCalendar,
  vehicles,
  trips,
  routes,
  tickets,
  language,
}) => {
  const activeBus = vehicles.find((v) => v.id === selectedBusId) || vehicles[0];

  // Projection equivalent to Query 3:
  // Take a busId, return all its trips ordered by newest departure first:
  // route name, departure, arrival, driver, status, seats sold (ticket count),
  // and seats left (Capacity minus ticket count).
  const drillDownTrips: SingleBusTripDrillDownVm[] = useMemo(() => {
    if (!activeBus) return [];

    const busTrips = trips.filter((t) => t.vehicleId === activeBus.id);

    // Sort descending by newest departure first
    const sorted = [...busTrips].sort((a, b) => {
      const dtA = `${a.departureDate} ${a.departureTime}`;
      const dtB = `${b.departureDate} ${b.departureTime}`;
      return dtB.localeCompare(dtA);
    });

    return sorted.map((t) => {
      const r = routes.find((route) => route.id === t.routeId);
      const routeName = r
        ? language === 'am'
          ? `${r.originNameAm} ➔ ${r.destinationNameAm}`
          : `${r.originNameEn} ➔ ${r.destinationNameEn}`
        : 'Unknown Route';

      // Ticket count for this trip (seats sold)
      const tripTickets = tickets.filter(
        (tk) => tk.tripId === t.id && tk.status !== 'cancelled' && tk.status !== 'refunded'
      );
      const seatsSold = tripTickets.length > 0 ? tripTickets.length : t.bookedSeatsCount;

      // Seats left = Capacity minus ticket count
      const busCapacity = activeBus.totalSeats;
      const seatsLeft = Math.max(0, busCapacity - seatsSold);

      // Arrival calculation
      let arrival: string | null = null;
      if (r) {
        const [timePart, meridiem] = t.departureTime.split(' ');
        const [hourStr, minStr] = timePart.split(':');
        let hour = parseInt(hourStr, 10);
        if (meridiem === 'PM' && hour < 12) hour += 12;
        if (meridiem === 'AM' && hour === 12) hour = 0;
        const arrivalHour = (hour + Math.floor(r.estimatedDurationHours)) % 24;
        const arrivalMeridiem = arrivalHour >= 12 ? 'PM' : 'AM';
        const displayHour = arrivalHour % 12 === 0 ? 12 : arrivalHour % 12;
        arrival = `${t.departureDate} ${String(displayHour).padStart(2, '0')}:${minStr} ${arrivalMeridiem}`;
      }

      return {
        tripId: t.id,
        routeName,
        departure: `${t.departureDate} ${t.departureTime}`,
        arrival,
        driver: activeBus.driverName,
        status: t.status,
        seatsSold,
        seatsLeft,
        capacity: busCapacity,
        pricePerSeat: t.pricePerSeat,
      };
    });
  }, [activeBus, trips, routes, tickets, language]);

  const totalSeatsSoldAllTime = drillDownTrips.reduce((sum, t) => sum + t.seatsSold, 0);

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Bus Selector Header */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            {language === 'am' ? 'አውቶቡስ ይምረጡ (Select Bus for Drill-Down)' : 'Select Bus (BusId)'}
          </label>
          <div className="flex items-center gap-2">
            <select
              value={activeBus?.id || ''}
              onChange={(e) => onSelectBusId(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
            >
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.plateNumber} {v.sideNumber ? `(Side #${v.sideNumber})` : ''} - {v.model} ({v.totalSeats} seats) • {v.driverName}
                </option>
              ))}
            </select>
          </div>
        </div>

        {activeBus && (
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <div className="bg-slate-50 px-3 py-2 rounded-xl border border-slate-200">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Capacity</span>
              <span className="font-mono-code font-bold text-slate-900">{activeBus.totalSeats} seats</span>
            </div>

            <div className="bg-slate-50 px-3 py-2 rounded-xl border border-slate-200">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Assigned Driver</span>
              <span className="font-bold text-slate-900">{activeBus.driverName}</span>
            </div>

            <div className="bg-slate-50 px-3 py-2 rounded-xl border border-slate-200">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Recorded Trips</span>
              <span className="font-mono-code font-bold text-slate-900">{drillDownTrips.length}</span>
            </div>

            <div className="bg-emerald-50 px-3 py-2 rounded-xl border border-emerald-200">
              <span className="text-emerald-700 block text-[10px] uppercase font-bold">Seats Sold</span>
              <span className="font-mono-code font-bold text-emerald-800">{totalSeatsSoldAllTime}</span>
            </div>

            {onOpenCalendar && (
              <button
                onClick={() => onOpenCalendar(activeBus.id)}
                className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-xs"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>{language === 'am' ? 'የቀን መቁጠሪያ እይ' : 'View Bus Calendar'}</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Drill-down Trips Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="bg-slate-50/70 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bus className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-bold text-slate-800">
              {language === 'am'
                ? `የአውቶቡስ ${activeBus?.plateNumber || ''} የጉዞ ታሪክ (በአዲስ የመነሻ ሰዓት ቅደም ተከተል)`
                : `Trips for Bus ${activeBus?.plateNumber || ''} (Ordered Newest Departure First)`}
            </span>
          </div>
          <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-mono-code font-bold">
            OrderByDescending(DepartureTime)
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">{language === 'am' ? 'የመስመር ስም (Route Name)' : 'Route Name'}</th>
                <th className="py-3 px-4">{language === 'am' ? 'የመነሻ ሰዓት (Departure)' : 'Departure'}</th>
                <th className="py-3 px-4">{language === 'am' ? 'የመድረሻ ሰዓት (Arrival)' : 'Arrival'}</th>
                <th className="py-3 px-4">{language === 'am' ? 'ሾፌር (Driver)' : 'Driver'}</th>
                <th className="py-3 px-4">{language === 'am' ? 'ሁኔታ (Status)' : 'Status'}</th>
                <th className="py-3 px-4 text-center text-emerald-700">{language === 'am' ? 'የተሸጡ ወንበሮች (Seats Sold)' : 'Seats Sold'}</th>
                <th className="py-3 px-4 text-center text-blue-700">{language === 'am' ? 'የቀሩ ወንበሮች (Seats Left)' : 'Seats Left'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {drillDownTrips.map((trip) => {
                const occupancy = Math.round((trip.seatsSold / trip.capacity) * 100);

                return (
                  <tr key={trip.tripId} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{trip.routeName}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-mono-code text-slate-800 font-semibold">
                      {trip.departure}
                    </td>

                    <td className="py-3.5 px-4 font-mono-code text-slate-600">
                      {trip.arrival || <span className="text-slate-400 italic">In-Transit</span>}
                    </td>

                    <td className="py-3.5 px-4 text-slate-700 font-medium">
                      {trip.driver}
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block text-[11px] font-bold px-2 py-0.5 rounded capitalize ${
                          trip.status === 'arrived'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : trip.status === 'cancelled'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : trip.status === 'departed'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {trip.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span className="font-mono-code font-black text-emerald-700 text-sm">
                        {trip.seatsSold}
                      </span>
                      <span className="text-[10px] text-slate-400 block font-semibold">
                        ({occupancy}% full)
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span className="font-mono-code font-black text-blue-700 text-sm">
                        {trip.seatsLeft}
                      </span>
                      <span className="text-[10px] text-slate-400 block font-semibold">
                        of {trip.capacity} cap
                      </span>
                    </td>
                  </tr>
                );
              })}

              {drillDownTrips.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    {language === 'am'
                      ? 'ለዚህ አውቶቡስ ምንም የተመዘገበ ጉዞ የለም'
                      : 'No trips recorded for this bus yet.'}
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
