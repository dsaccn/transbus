import React, { useState, useMemo } from 'react';
import { Trip, Vehicle, Route, Language } from '../../types';
import {
  Calendar,
  Clock,
  MapPin,
  Bus,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Filter,
  Tag,
} from 'lucide-react';

export interface CalendarEventVm {
  id: string;
  title: string;
  start: string; // DepartureTime
  end: string | null; // ArrivalTime nullable
  color: 'red' | 'green' | 'blue';
  statusRaw: string;
  driverName?: string;
  gateNumber?: string;
  plateNumber: string;
  routeName: string;
  date: string;
}

interface Props {
  trips: Trip[];
  vehicles: Vehicle[];
  routes: Route[];
  language: Language;
}

export const CalendarFeedView: React.FC<Props> = ({
  trips,
  vehicles,
  routes,
  language,
}) => {
  const today = new Date().toISOString().split('T')[0];
  const nextMonthObj = new Date();
  nextMonthObj.setDate(nextMonthObj.getDate() + 30);
  const nextMonth = nextMonthObj.toISOString().split('T')[0];

  const [startDate, setStartDate] = useState<string>(today);
  const [endDate, setEndDate] = useState<string>(nextMonth);
  const [colorFilter, setColorFilter] = useState<'all' | 'red' | 'green' | 'blue'>('all');

  // Projection equivalent to Query 2
  const calendarEvents: CalendarEventVm[] = useMemo(() => {
    return trips
      .filter((t) => {
        if (startDate && t.departureDate < startDate) return false;
        if (endDate && t.departureDate > endDate) return false;
        return true;
      })
      .map((t) => {
        const veh = vehicles.find((v) => v.id === t.vehicleId);
        const route = routes.find((r) => r.id === t.routeId);
        const plate = veh ? veh.plateNumber : 'UNKNOWN BUS';
        const routeName = route
          ? language === 'am'
            ? `${route.originNameAm} ➔ ${route.destinationNameAm}`
            : `${route.originNameEn} ➔ ${route.destinationNameEn}`
          : 'UNKNOWN ROUTE';

        // Title formatted strictly as: "{PlateNumber} — {RouteName}"
        const title = `${plate} — ${routeName}`;

        // Arrival calculation based on estimatedDurationHours or arrival status
        let arrivalTime: string | null = null;
        if (route) {
          // If arrived, we show actual arrival or departure + duration
          const [timePart, meridiem] = t.departureTime.split(' ');
          const [hourStr, minStr] = timePart.split(':');
          let hour = parseInt(hourStr, 10);
          if (meridiem === 'PM' && hour < 12) hour += 12;
          if (meridiem === 'AM' && hour === 12) hour = 0;
          const arrivalHour = (hour + Math.floor(route.estimatedDurationHours)) % 24;
          const arrivalMeridiem = arrivalHour >= 12 ? 'PM' : 'AM';
          const displayHour = arrivalHour % 12 === 0 ? 12 : arrivalHour % 12;
          arrivalTime = `${String(displayHour).padStart(2, '0')}:${minStr} ${arrivalMeridiem}`;
        }

        // Color by status: cancelled=red, completed=green, otherwise blue
        let color: 'red' | 'green' | 'blue' = 'blue';
        if (t.status === 'cancelled') {
          color = 'red';
        } else if (t.status === 'arrived') {
          color = 'green';
        } else {
          color = 'blue';
        }

        return {
          id: t.id,
          title,
          start: `${t.departureDate} ${t.departureTime}`,
          end: arrivalTime ? `${t.departureDate} ${arrivalTime}` : null,
          color,
          statusRaw: t.status,
          driverName: veh?.driverName,
          gateNumber: t.gateNumber,
          plateNumber: plate,
          routeName,
          date: t.departureDate,
        };
      })
      .sort((a, b) => a.start.localeCompare(b.start));
  }, [trips, vehicles, routes, startDate, endDate, language]);

  const filteredEvents = useMemo(() => {
    if (colorFilter === 'all') return calendarEvents;
    return calendarEvents.filter((ev) => ev.color === colorFilter);
  }, [calendarEvents, colorFilter]);

  const redCount = calendarEvents.filter((e) => e.color === 'red').length;
  const greenCount = calendarEvents.filter((e) => e.color === 'green').length;
  const blueCount = calendarEvents.filter((e) => e.color === 'blue').length;

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Date Range & Color Filter Control */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-bold text-slate-800">
              {language === 'am' ? 'የቀን ክልል (Date Range)' : 'DateTime Range Filter'}:
            </span>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-semibold outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <span className="text-xs text-slate-400 font-bold">➔</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-semibold outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                setStartDate(today);
                setEndDate(today);
              }}
              className="px-2.5 py-1 text-[11px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg cursor-pointer transition"
            >
              {language === 'am' ? 'ዛሬ' : 'Today'}
            </button>
            <button
              onClick={() => {
                const end7 = new Date();
                end7.setDate(end7.getDate() + 7);
                setStartDate(today);
                setEndDate(end7.toISOString().split('T')[0]);
              }}
              className="px-2.5 py-1 text-[11px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg cursor-pointer transition"
            >
              {language === 'am' ? 'ቀጣይ 7 ቀናት' : 'Next 7 Days'}
            </button>
          </div>
        </div>

        {/* Legend / Filter by Status Color */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setColorFilter('all')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
              colorFilter === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All ({calendarEvents.length})
          </button>
          <button
            onClick={() => setColorFilter('green')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
              colorFilter === 'green'
                ? 'bg-emerald-600 text-white'
                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Completed ({greenCount})</span>
          </button>
          <button
            onClick={() => setColorFilter('blue')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
              colorFilter === 'blue'
                ? 'bg-blue-600 text-white'
                : 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            <span>Active/Sched ({blueCount})</span>
          </button>
          <button
            onClick={() => setColorFilter('red')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
              colorFilter === 'red'
                ? 'bg-rose-600 text-white'
                : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            <span>Cancelled ({redCount})</span>
          </button>
        </div>
      </div>

      {/* Calendar Feed Events Stream */}
      <div className="space-y-2.5">
        {filteredEvents.map((ev) => {
          const colorStyles =
            ev.color === 'red'
              ? 'bg-rose-50/80 border-rose-200 text-rose-900'
              : ev.color === 'green'
              ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
              : 'bg-blue-50/80 border-blue-200 text-blue-900';

          const badgeStyles =
            ev.color === 'red'
              ? 'bg-rose-600 text-white'
              : ev.color === 'green'
              ? 'bg-emerald-600 text-white'
              : 'bg-blue-600 text-white';

          return (
            <div
              key={ev.id}
              className={`p-4 rounded-2xl border ${colorStyles} shadow-xs transition hover:shadow-md flex flex-wrap items-center justify-between gap-3`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] uppercase font-mono-code font-bold px-2 py-0.5 rounded ${badgeStyles}`}>
                    {ev.color.toUpperCase()} • {ev.statusRaw}
                  </span>
                  <span className="text-xs font-mono-code text-slate-500">ID: {ev.id}</span>
                </div>

                {/* The required title format: "{PlateNumber} — {RouteName}" */}
                <h4 className="text-sm font-black text-slate-900 tracking-tight">
                  {ev.title}
                </h4>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 font-medium">
                  <div className="flex items-center gap-1 font-mono-code">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Start (Departure): <strong className="text-slate-900">{ev.start}</strong></span>
                  </div>

                  {ev.end && (
                    <div className="flex items-center gap-1 font-mono-code">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>End (Arrival): <strong className="text-slate-900">{ev.end}</strong></span>
                    </div>
                  )}

                  {ev.driverName && (
                    <span className="text-slate-500">
                      Driver: <strong className="text-slate-700">{ev.driverName}</strong>
                    </span>
                  )}

                  {ev.gateNumber && (
                    <span className="text-slate-500">
                      Gate: <strong className="text-slate-700">{ev.gateNumber}</strong>
                    </span>
                  )}
                </div>
              </div>

              <div className="text-right">
                <span className="text-[11px] font-mono-code text-slate-500 font-semibold block">
                  Date: {ev.date}
                </span>
                <span className="text-xs font-bold font-mono-code text-slate-800">
                  {ev.plateNumber}
                </span>
              </div>
            </div>
          );
        })}

        {filteredEvents.length === 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-400">
            {language === 'am'
              ? 'በዚህ የቀን ክልል ውስጥ ምንም የተመዘገበ ጉዞ የለም'
              : 'No calendar events found in this date range.'}
          </div>
        )}
      </div>
    </div>
  );
};
