import React from 'react';
import { useTransport } from '../../context/TransportContext';
import { Seat, Vehicle } from '../../types';
import { User, Check, Disc, AlertCircle, Sparkles } from 'lucide-react';

interface SeatMapProps {
  vehicle: Vehicle;
  seats: Seat[];
  selectedSeatNumber?: number | null;
  selectedSeatNumbers?: number[];
  onSelectSeat: (seatNumber: number) => void;
  readOnly?: boolean;
}

export const SeatMap: React.FC<SeatMapProps> = ({
  vehicle,
  seats,
  selectedSeatNumber,
  selectedSeatNumbers,
  onSelectSeat,
  readOnly = false,
}) => {
  const { t, language } = useTransport();

  const bookedCount = seats.filter((s) => s.status === 'booked').length;
  const availableCount = seats.filter((s) => s.status === 'available').length;

  const isSeatSelected = (seatNum: number) => {
    if (selectedSeatNumbers && selectedSeatNumbers.length > 0) {
      return selectedSeatNumbers.includes(seatNum);
    }
    return selectedSeatNumber === seatNum;
  };

  // Helper for seat color styles
  const getSeatStyles = (seat: Seat) => {
    const isSelected = isSeatSelected(seat.seatNumber);

    if (isSelected) {
      return 'bg-emerald-600 text-white border-2 border-emerald-400 shadow-lg shadow-emerald-600/30 scale-105 ring-2 ring-emerald-300 ring-offset-2';
    }

    switch (seat.status) {
      case 'available':
        return 'bg-white text-slate-800 border-2 border-slate-300 hover:border-emerald-500 hover:bg-emerald-50 hover:text-emerald-900 cursor-pointer shadow-sm';
      case 'booked':
        return 'bg-slate-200 text-slate-500 border-2 border-slate-300 cursor-not-allowed opacity-90';
      case 'reserved':
        return 'bg-amber-100 text-amber-900 border-2 border-amber-300 cursor-not-allowed';
      default:
        return 'bg-slate-100 text-slate-400 border border-slate-200';
    }
  };

  // Group seats by row for responsive grid rendering
  const maxRow = Math.max(...seats.map((s) => s.row), 0);
  const rows: { [row: number]: Seat[] } = {};
  for (let r = 0; r <= maxRow; r++) {
    rows[r] = seats.filter((s) => s.row === r).sort((a, b) => a.col - b.col);
  }

  return (
    <div className="bg-slate-900/90 text-white border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono-code px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold">
              {vehicle.plateNumber}
            </span>
            <h3 className="text-sm font-bold text-white">{vehicle.model}</h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            {vehicle.totalSeats} {language === 'am' ? 'የተሽከርካሪ መቀመጫዎች' : 'Total Vehicle Seats'}
          </p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-3.5 h-3.5 rounded bg-white border border-slate-300"></div>
            <span className="text-slate-300">{t.seatAvailable} ({availableCount})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3.5 h-3.5 rounded bg-emerald-600 border border-emerald-400"></div>
            <span className="text-emerald-300">{t.seatSelected}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3.5 h-3.5 rounded bg-slate-300 border border-slate-400"></div>
            <span className="text-slate-400">{t.seatBooked} ({bookedCount})</span>
          </div>
        </div>
      </div>

      {/* Visual Bus Frame */}
      <div className="max-w-md mx-auto bg-slate-950 p-4 sm:p-6 rounded-3xl border-2 border-slate-700 shadow-inner relative">
        {/* Front Windshield & Driver Area */}
        <div className="relative mb-6">
          <div className="h-10 bg-slate-800/90 rounded-t-2xl border border-slate-700 flex items-center justify-center text-[11px] font-bold text-slate-300 tracking-wider uppercase">
            <span>{t.frontSide}</span>
          </div>

          {/* Driver seat and Entrance Door indicators */}
          <div className="flex items-center justify-between px-4 pt-3 pb-1 border-b border-dashed border-slate-800 text-xs">
            {/* Driver */}
            <div className="flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
              <div className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400">
                <Disc className="w-4 h-4 animate-spin-slow" />
              </div>
              <div>
                <div className="text-[10px] text-slate-500 uppercase font-bold">{t.driverCabin}</div>
                <div className="text-xs font-semibold text-slate-300">{vehicle.driverName.split(' ')[0]}</div>
              </div>
            </div>

            {/* Entrance Door */}
            <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-950/50 px-2.5 py-1 rounded border border-emerald-800/60">
              <span>{t.entranceDoor}</span>
              <span>🚪</span>
            </div>
          </div>
        </div>

        {/* Dynamic Seats Layout Canvas */}
        <div className="space-y-3 py-2">
          {Object.keys(rows).map((rowKey) => {
            const r = parseInt(rowKey);
            const rowSeats = rows[r];

            return (
              <div key={`row-${r}`} className="flex items-center justify-center gap-2 sm:gap-3">
                {rowSeats.map((seat) => {
                  const isSelected = isSeatSelected(seat.seatNumber);
                  const isBooked = seat.status === 'booked';
                  const isReserved = seat.status === 'reserved';

                  return (
                    <button
                      key={seat.id}
                      id={`seat-btn-${seat.seatNumber}`}
                      type="button"
                      disabled={readOnly || isBooked || isReserved}
                      onClick={() => {
                        if (!readOnly && !isBooked && !isReserved) {
                          onSelectSeat(seat.seatNumber);
                        }
                      }}
                      className={`relative flex flex-col items-center justify-center w-11 h-12 sm:w-12 sm:h-13 rounded-xl font-mono-code transition-all duration-150 ${getSeatStyles(
                        seat
                      )}`}
                      title={
                        isBooked
                          ? `${t.seatBooked} - ${seat.passengerName || 'Passenger'}`
                          : `${t.seatAvailable} #${seat.seatNumber}`
                      }
                    >
                      {/* Top seat cushion contour */}
                      <span className="text-[11px] sm:text-xs font-black leading-none">
                        {seat.seatNumber < 10 ? `0${seat.seatNumber}` : seat.seatNumber}
                      </span>

                      {/* Icon / status badge inside seat */}
                      <div className="mt-0.5">
                        {isSelected && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
                        {isBooked && (
                          <span className="text-[10px]">
                            {seat.passengerGender === 'female' ? '👩' : '👨'}
                          </span>
                        )}
                        {!isSelected && !isBooked && (
                          <span className="text-[8px] text-slate-400 uppercase font-sans">
                            {seat.isWindow ? 'WIN' : 'AIS'}
                          </span>
                        )}
                      </div>

                      {/* Tooltip for booked seat */}
                      {isBooked && seat.passengerName && (
                        <span className="sr-only">{seat.passengerName}</span>
                      )}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* Rear Bumper Indicator */}
        <div className="mt-6 pt-3 border-t border-slate-800 text-center text-[10px] font-bold text-slate-500 uppercase tracking-wider">
          {t.rearSide}
        </div>
      </div>

      {/* Bottom selected seat status prompt */}
      {!readOnly && (
        <div className="mt-4 p-3 rounded-xl bg-slate-800/80 border border-slate-700 text-center text-xs">
          {selectedSeatNumbers && selectedSeatNumbers.length > 0 ? (
            <div className="flex flex-wrap items-center justify-center gap-2 text-emerald-400 font-semibold">
              <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
              <span>
                {t.selectedSeatsCount || 'Selected Seats'} ({selectedSeatNumbers.length}):
              </span>
              <div className="flex flex-wrap gap-1.5 items-center">
                {selectedSeatNumbers
                  .sort((a, b) => a - b)
                  .map((num) => (
                    <strong
                      key={num}
                      className="text-white text-xs font-mono-code bg-emerald-600 px-2 py-0.5 rounded shadow-sm"
                    >
                      #{num < 10 ? `0${num}` : num}
                    </strong>
                  ))}
              </div>
            </div>
          ) : selectedSeatNumber ? (
            <div className="flex items-center justify-center gap-2 text-emerald-400 font-semibold">
              <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
              <span>
                {t.selectedSeatNotice}{' '}
                <strong className="text-white text-sm font-mono-code bg-emerald-600 px-2 py-0.5 rounded">
                  #{selectedSeatNumber < 10 ? `0${selectedSeatNumber}` : selectedSeatNumber}
                </strong>
              </span>
            </div>
          ) : (
            <div className="text-slate-400 flex items-center justify-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-amber-400" />
              <span>{t.selectASeatPrompt}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
