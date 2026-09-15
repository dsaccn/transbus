import React, { useState } from 'react';
import { Copy, Check, Code2, Database, Sparkles } from 'lucide-react';

const EF_CORE_SNIPPET = `// ============================================================================
// 1. BusControlVm Class (Required for Query 1)
// ============================================================================
public class BusControlVm
{
    public string PlateNumber { get; set; } = string.Empty;
    public BusStatus Status { get; set; }
    public int TotalTrips { get; set; }
    public int DistinctRoutesTaken { get; set; }
    public int CompletedCount { get; set; }
    public int CancelledCount { get; set; }
    public DateTime? LastActiveDate { get; set; }
}

// ============================================================================
// Query 1: Per-Bus Control Stats
// ============================================================================
// For every bus, project into BusControlVm:
// plate number, status, total trips, distinct routes taken (unique RouteId count),
// completed count, cancelled count, and last active date (max DepartureTime).
var perBusStats = await context.Buses
    .Select(b => new BusControlVm
    {
        PlateNumber = b.PlateNumber,
        Status = b.Status,
        TotalTrips = b.Trips.Count(),
        DistinctRoutesTaken = b.Trips.Select(t => t.RouteId).Distinct().Count(),
        CompletedCount = b.Trips.Count(t => t.Status == TripStatus.Completed),
        CancelledCount = b.Trips.Count(t => t.Status == TripStatus.Cancelled),
        LastActiveDate = b.Trips.Max(t => (DateTime?)t.DepartureTime)
    })
    .ToListAsync();

// ============================================================================
// Query 2: Calendar Feed
// ============================================================================
// Take a start and end DateTime, return all trips in that range as calendar events:
// id, title formatted as "{PlateNumber} — {RouteName}", start (DepartureTime),
// end (ArrivalTime), and a color by status (cancelled=red, completed=green, otherwise blue).
var calendarFeed = await context.Trips
    .Where(t => t.DepartureTime >= start && t.DepartureTime <= end)
    .Select(t => new
    {
        Id = t.Id,
        Title = $"{t.Bus.PlateNumber} — {t.Route.Name}",
        Start = t.DepartureTime,
        End = t.ArrivalTime,
        Color = t.Status == TripStatus.Cancelled ? "red"
              : t.Status == TripStatus.Completed ? "green"
              : "blue"
    })
    .ToListAsync();

// ============================================================================
// Query 3: Single-Bus Drill-Down
// ============================================================================
// Take a busId, return all its trips ordered by newest departure first:
// route name, departure, arrival, driver, status, seats sold (ticket count),
// and seats left (Capacity minus ticket count).
var singleBusDrillDown = await context.Trips
    .Where(t => t.BusId == busId)
    .OrderByDescending(t => t.DepartureTime)
    .Select(t => new
    {
        RouteName = t.Route.Name,
        Departure = t.DepartureTime,
        Arrival = t.ArrivalTime,
        Driver = t.DriverName,
        Status = t.Status,
        SeatsSold = t.Tickets.Count(),
        SeatsLeft = t.Bus.Capacity - t.Tickets.Count()
    })
    .ToListAsync();`;

export const EfCoreQueriesView: React.FC = () => {
  const [copied, setCopied] = useState<boolean>(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(EF_CORE_SNIPPET);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center font-bold">
            <Code2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white">
                EF Core LINQ Queries (DbContext Logic)
              </h3>
              <span className="text-[10px] bg-purple-950 text-purple-300 border border-purple-800 font-mono-code px-2 py-0.5 rounded font-bold">
                ASYNC EF CORE 6/7/8+
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Clean async LINQ queries using ToListAsync against DbContext entities: Bus, Route, Trip, Ticket
            </p>
          </div>
        </div>

        <button
          onClick={handleCopy}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-md"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
          <span>{copied ? 'Copied to Clipboard!' : 'Copy C# LINQ Queries'}</span>
        </button>
      </div>

      <div className="bg-slate-950 rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
        <div className="bg-slate-900/90 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-purple-400" />
            <span className="font-mono-code font-semibold text-slate-200">BusRouteControlQueries.cs</span>
          </div>
          <span className="text-[11px] text-slate-400 font-mono-code">DbContext LINQ Projections</span>
        </div>
        <pre className="p-5 text-xs text-slate-200 font-mono-code overflow-x-auto leading-relaxed selection:bg-purple-800 selection:text-white">
          <code>{EF_CORE_SNIPPET}</code>
        </pre>
      </div>
    </div>
  );
};
