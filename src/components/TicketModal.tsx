import React, { useState } from 'react';
import { useTransport } from '../context/TransportContext';
import { Ticket } from '../types';
import {
  Printer,
  X,
  Bus,
  MapPin,
  Calendar,
  Clock,
  User,
  Phone,
  Sparkles,
  ShieldCheck,
  Cpu,
  Layers,
  CheckCircle2,
  Trash2,
} from 'lucide-react';

interface TicketModalProps {
  ticket?: Ticket | null;
  tickets?: Ticket[] | null;
  onClose: () => void;
  onNewBooking?: () => void;
}

interface SingleTicketCardProps {
  ticket: Ticket;
  index: number;
  totalCount: number;
  language: string;
  t: any;
  onRemove?: () => void;
}

const SingleTicketCard: React.FC<SingleTicketCardProps> = ({
  ticket,
  index,
  totalCount,
  language,
  t,
  onRemove,
}) => {
  return (
    <div className="printable-single-ticket w-full max-w-md bg-[#fffdfa] text-slate-900 border-2 border-slate-900 rounded-2xl shadow-xl p-5 font-sans relative overflow-hidden mb-6 mx-auto">
      {/* Batch index indicator in preview only */}
      {totalCount > 1 && (
        <div className="no-print flex items-center justify-between pb-2 mb-3 border-b border-slate-200 text-xs">
          <span className="font-mono-code font-bold bg-slate-900 text-emerald-400 px-2.5 py-0.5 rounded-full text-[10px]">
            TICKET {index + 1} OF {totalCount}
          </span>
          {onRemove && (
            <button
              onClick={onRemove}
              className="text-slate-400 hover:text-rose-600 transition flex items-center gap-1 text-[11px] font-semibold cursor-pointer"
              title="Remove this ticket from batch"
            >
              <Trash2 className="w-3 h-3" />
              <span>{language === 'am' ? 'አስወግድ' : 'Remove'}</span>
            </button>
          )}
        </div>
      )}

      {/* Watermark / Background stamp */}
      <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none">
        <Bus className="w-72 h-72 text-slate-900" />
      </div>

      {/* Official Header with Noxora Tech Solutions Branding */}
      <div className="text-center border-b-2 border-slate-900 pb-3 mb-3">
        <div className="flex items-center justify-center gap-1.5 mb-1">
          <div className="w-5 h-5 rounded-md bg-slate-900 text-emerald-400 flex items-center justify-center font-bold text-[10px]">
            <Cpu className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-black tracking-wider uppercase text-slate-950">
            NOXORA TECH SOLUTIONS
          </span>
        </div>
        <div className="text-[10px] font-bold uppercase tracking-wide text-slate-700">
          {t.transportAuthority}
        </div>
        <div className="text-[10px] font-semibold text-emerald-800 mt-0.5">
          {language === 'am' ? 'የአዲስ አበባ ማዕከላዊ የትራንስፖርት ጣቢያ' : 'Addis Ababa Central Transport Terminal'}
        </div>
      </div>

      {/* Ticket Serial & Agent Badge Strip */}
      <div className="flex items-center justify-between bg-slate-100 p-2 rounded-xl border border-slate-300 mb-3 text-xs">
        <div>
          <span className="text-[10px] text-slate-500 font-semibold uppercase block">
            {t.ticketNumber}:
          </span>
          <span className="font-mono-code font-bold text-slate-950 text-xs">
            {ticket.ticketNumber}
          </span>
        </div>
        <div className="text-right">
          <span className="text-[10px] text-slate-500 font-semibold uppercase block">
            {t.agentIdBadge}:
          </span>
          <span className="font-bold text-emerald-900 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300 text-[11px]">
            {ticket.agentCode} ({ticket.agentName.split(' ')[0]})
          </span>
        </div>
      </div>

      {/* PRIMARY HIGHLIGHT BOX: Seat Number & Plate Number */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        {/* Seat Badge */}
        <div className="bg-slate-900 text-white rounded-xl p-3 text-center border-2 border-slate-900 shadow-sm">
          <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
            {t.seatNumberLabel}
          </div>
          <div className="text-3xl font-black font-mono-code leading-tight my-0.5 text-white">
            #{ticket.seatNumber < 10 ? `0${ticket.seatNumber}` : ticket.seatNumber}
          </div>
          <div className="text-[9px] text-slate-300">
            {language === 'am' ? 'የተረጋገጠ መቀመጫ' : 'CONFIRMED SEAT'}
          </div>
        </div>

        {/* Vehicle Plate Badge */}
        <div className="bg-amber-50 text-slate-900 rounded-xl p-3 text-center border-2 border-amber-400 shadow-sm">
          <div className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">
            {t.plateNumberLabel}
          </div>
          <div className="text-lg font-black font-mono-code leading-tight my-1 text-slate-950">
            {ticket.vehiclePlateNumber}
          </div>
          <div className="text-[9px] text-slate-600 truncate font-semibold">
            {ticket.vehicleModel}
          </div>
        </div>
      </div>

      {/* Route & Journey Box */}
      <div className="border border-slate-300 rounded-xl p-3 bg-white mb-3">
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
          <div className="flex items-center gap-1.5 text-slate-600 text-xs">
            <MapPin className="w-3.5 h-3.5 text-rose-500" />
            <span className="text-[10px] uppercase font-bold text-slate-500">{t.routeLabel}:</span>
          </div>
          <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
            {ticket.gateNumber}
          </span>
        </div>

        <div className="flex items-center justify-between gap-2 text-sm">
          <div className="text-left flex-1">
            <div className="text-[10px] text-slate-500 uppercase">{t.fromLabel}</div>
            <div className="font-extrabold text-slate-900">
              {language === 'am' ? ticket.originCityAm : ticket.originCityEn}
            </div>
          </div>
          <div className="text-slate-400 font-bold text-base px-2">➔</div>
          <div className="text-right flex-1">
            <div className="text-[10px] text-slate-500 uppercase">{t.toLabel}</div>
            <div className="font-extrabold text-emerald-800">
              {language === 'am' ? ticket.destinationCityAm : ticket.destinationCityEn}
            </div>
          </div>
        </div>

        {/* Date and Time */}
        <div className="grid grid-cols-2 gap-2 mt-3 pt-2 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <div>
              <div className="text-[9px] text-slate-400 uppercase">{t.departDateLabel}</div>
              <div className="font-bold text-slate-900">{ticket.departureDate}</div>
            </div>
          </div>
          <div className="flex items-center gap-1.5 justify-end text-right">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <div>
              <div className="text-[9px] text-slate-400 uppercase">{t.departTimeLabel}</div>
              <div className="font-bold text-slate-900">{ticket.departureTime}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Passenger & Payment Details */}
      <div className="border border-slate-300 rounded-xl p-3 bg-white mb-3 text-xs space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-slate-500 flex items-center gap-1">
            <User className="w-3.5 h-3.5 text-slate-400" />
            {t.passengerLabel}:
          </span>
          <span className="font-bold text-slate-950">
            {ticket.passengerName}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-500 flex items-center gap-1">
            <Phone className="w-3.5 h-3.5 text-slate-400" />
            {t.phoneLabel}:
          </span>
          <span className="font-mono-code font-semibold text-slate-800">
            {ticket.passengerPhone || 'N/A'}
          </span>
        </div>
        <div className="flex items-center justify-between pt-1 border-t border-slate-100">
          <span className="text-slate-500">{t.paymentModeLabel}:</span>
          <span className="font-bold uppercase text-slate-800 bg-slate-100 px-2 py-0.5 rounded text-[10px]">
            {ticket.paymentMethod}
          </span>
        </div>
        <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-sm">
          <span className="font-bold text-slate-900">{t.totalPayable}:</span>
          <span className="font-black text-emerald-800 text-base font-mono-code">
            {ticket.totalAmount} {t.currency}
          </span>
        </div>
      </div>

      {/* QR Code and Validation Notice */}
      <div className="flex items-center gap-3 bg-slate-50 p-2.5 rounded-xl border border-slate-200 mb-3">
        {ticket.qrCodeDataUrl ? (
          <img
            src={ticket.qrCodeDataUrl}
            alt="Ticket QR Code"
            className="w-20 h-20 bg-white p-1 rounded-lg border border-slate-300 shrink-0"
          />
        ) : (
          <div className="w-20 h-20 bg-slate-200 flex items-center justify-center text-xs font-mono-code">
            QR PASS
          </div>
        )}
        <div className="text-[10px] text-slate-600 leading-tight">
          <div className="font-bold text-slate-900 text-xs mb-1 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Nexora Digital Gate Pass</span>
          </div>
          {t.qrCodeScanNotice}
          <div className="text-[9px] text-slate-400 font-mono-code mt-1">
            Issued: {ticket.issueDate} {ticket.issueTime}
          </div>
        </div>
      </div>

      {/* Terms and Conditions */}
      <div className="text-[8.5px] text-slate-500 leading-relaxed border-t border-slate-200 pt-2 mb-3">
        <div className="font-bold uppercase text-slate-700 mb-0.5">{t.termsTitle}</div>
        <div>{t.term1}</div>
        <div>{t.term2}</div>
        <div>{t.term3}</div>
      </div>

      {/* PERFORATED CUT LINE FOR STATION RECORD */}
      <div className="relative my-4 border-t-2 border-dashed border-slate-400 text-center">
        <span className="bg-[#fffdfa] px-2 text-[9px] font-bold tracking-widest text-slate-500 uppercase -top-2.5 relative">
          {t.stationCopy}
        </span>
      </div>

      {/* Station Stub / Control Copy */}
      <div className="bg-slate-100 p-2.5 rounded-xl border border-slate-300 text-[10px] space-y-1">
        <div className="flex items-center justify-between font-bold">
          <span>STATION RECORD (የጣቢያ ቅጂ)</span>
          <span className="font-mono-code">{ticket.ticketNumber}</span>
        </div>
        <div className="grid grid-cols-3 gap-1 text-[9px] text-slate-700">
          <div>
            <span className="text-slate-500">Seat: </span>
            <span className="font-bold">#{ticket.seatNumber}</span>
          </div>
          <div>
            <span className="text-slate-500">Plate: </span>
            <span className="font-bold">{ticket.vehiclePlateNumber}</span>
          </div>
          <div>
            <span className="text-slate-500">Fare: </span>
            <span className="font-bold">{ticket.totalAmount} ETB</span>
          </div>
        </div>
        <div className="flex justify-between items-end pt-3 text-[8.5px] text-slate-500">
          <div>
            <div className="border-b border-slate-400 w-24 mb-0.5" />
            {t.passengerSignature}
          </div>
          <div className="text-right">
            <div className="border-b border-slate-400 w-24 mb-0.5 ml-auto" />
            {t.agentSignature}
          </div>
        </div>
      </div>
    </div>
  );
};

export const TicketModal: React.FC<TicketModalProps> = ({
  ticket,
  tickets,
  onClose,
  onNewBooking,
}) => {
  const { t, language } = useTransport();

  // Consolidate tickets into an active list
  const initialTickets = tickets && tickets.length > 0 ? tickets : ticket ? [ticket] : [];
  const [ticketList, setTicketList] = useState<Ticket[]>(initialTickets);

  // Sync state if props change
  React.useEffect(() => {
    const list = tickets && tickets.length > 0 ? tickets : ticket ? [ticket] : [];
    setTicketList(list);
  }, [ticket, tickets]);

  if (ticketList.length === 0) return null;

  const isMultiTicket = ticketList.length > 1;
  const totalAmountSum = ticketList.reduce((sum, tk) => sum + tk.totalAmount, 0);

  const handlePrint = () => {
    window.print();
  };

  const handleRemoveTicket = (indexToRemove: number) => {
    const updated = ticketList.filter((_, idx) => idx !== indexToRemove);
    if (updated.length === 0) {
      onClose();
    } else {
      setTicketList(updated);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-3xl w-full max-h-[94vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Top Control Bar (Non-Printable) */}
        <div className="no-print p-4 bg-slate-800/90 border-b border-slate-700 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold">
              {isMultiTicket ? <Layers className="w-5 h-5" /> : <Sparkles className="w-4 h-4" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white">
                  {isMultiTicket
                    ? language === 'am'
                      ? `የበርካታ ትኬቶች ማተሚያ (${ticketList.length} ትኬቶች)`
                      : `Batch Travel Tickets (${ticketList.length} Tickets)`
                    : language === 'am'
                    ? 'ዲጂታል የጉዞ ትኬት ደረሰኝ'
                    : 'Digital Passenger Travel Ticket'}
                </h3>
                {isMultiTicket && (
                  <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-700 font-mono-code px-2 py-0.5 rounded font-bold">
                    PRINT ALL IN ONE
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 font-mono-code mt-0.5">
                {isMultiTicket
                  ? `${ticketList.length} tickets • Total: ${totalAmountSum.toLocaleString()} ETB`
                  : ticketList[0].ticketNumber}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="print-ticket-btn"
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition shadow-md cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>
                {isMultiTicket
                  ? language === 'am'
                    ? `ሁሉንም (${ticketList.length}) በአንድ ላይ አትም`
                    : `Print All (${ticketList.length}) in One`
                  : t.printTicket}
              </span>
            </button>
            <button
              id="close-ticket-modal-btn"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-xl transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Multi-ticket quick summary pill strip */}
        {isMultiTicket && (
          <div className="no-print bg-slate-800/60 px-4 py-2.5 border-b border-slate-700/80 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] text-slate-400 font-medium mr-1">
                {language === 'am' ? 'የተካተቱ ወንበሮች:' : 'Included Seats:'}
              </span>
              {ticketList.map((tk, idx) => (
                <span
                  key={tk.id}
                  className="inline-flex items-center gap-1 bg-slate-900 border border-slate-700 text-slate-200 px-2 py-0.5 rounded-lg text-[11px] font-mono-code font-semibold"
                >
                  <span>#{tk.seatNumber < 10 ? `0${tk.seatNumber}` : tk.seatNumber}</span>
                  <span className="text-[10px] text-slate-400 font-normal">({tk.passengerName.split(' ')[0]})</span>
                  <button
                    onClick={() => handleRemoveTicket(idx)}
                    className="text-slate-500 hover:text-rose-400 cursor-pointer ml-0.5"
                    title="Remove from batch print"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>

            <div className="text-[11px] font-bold text-emerald-400 font-mono-code">
              {ticketList.length} {language === 'am' ? 'ትኬቶች ለመታተም ዝግጁ ናቸው' : 'tickets ready to print together'}
            </div>
          </div>
        )}

        {/* Modal Body / Scrollable Canvas */}
        <div className="p-4 sm:p-6 overflow-y-auto bg-slate-950 flex flex-col items-center">
          {/* Authentic Paper Ticket Layout Card(s) */}
          <div id="printable-ticket-area" className="w-full">
            {ticketList.map((tk, idx) => (
              <SingleTicketCard
                key={tk.id}
                ticket={tk}
                index={idx}
                totalCount={ticketList.length}
                language={language}
                t={t}
                onRemove={isMultiTicket ? () => handleRemoveTicket(idx) : undefined}
              />
            ))}
          </div>
        </div>

        {/* Modal Bottom Actions (Non-Printable) */}
        <div className="no-print p-4 bg-slate-800/90 border-t border-slate-700 flex flex-wrap items-center justify-between gap-2">
          <button
            id="modal-new-booking-btn"
            onClick={() => {
              onClose();
              if (onNewBooking) onNewBooking();
            }}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-xs font-semibold transition cursor-pointer"
          >
            {t.newBooking}
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition shadow-sm cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>
                {isMultiTicket
                  ? language === 'am'
                    ? `ሁሉንም (${ticketList.length}) በአንድ ላይ አትም`
                    : `Print All (${ticketList.length}) in One`
                  : t.printTicket}
              </span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white rounded-xl text-xs font-medium transition cursor-pointer"
            >
              {t.closeModal}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
