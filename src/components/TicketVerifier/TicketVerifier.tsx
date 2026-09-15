import React, { useState } from 'react';
import { useTransport } from '../../context/TransportContext';
import { Ticket } from '../../types';
import {
  Search,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  QrCode,
  Bus,
  User,
  Phone,
  Clock,
  Printer,
  Sparkles,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const TicketVerifier: React.FC = () => {
  const { t, language, tickets, getTicketByNumber, markTicketBoarded, setTicketForPrint } = useTransport();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchedTicket, setSearchedTicket] = useState<Ticket | null>(null);
  const [hasSearched, setHasSearched] = useState<boolean>(false);
  const [boardSuccessMessage, setBoardSuccessMessage] = useState<string>('');

  const handleSearch = (e?: React.FormEvent, customQuery?: string) => {
    if (e) e.preventDefault();
    const query = (customQuery || searchQuery).trim();
    if (!query) return;

    setBoardSuccessMessage('');
    setHasSearched(true);
    const found = getTicketByNumber(query);
    setSearchedTicket(found || null);
  };

  const handleMarkBoarded = () => {
    if (!searchedTicket) return;
    const ok = markTicketBoarded(searchedTicket.id);
    if (ok) {
      setSearchedTicket((prev) => (prev ? { ...prev, status: 'boarded' } : null));
      setBoardSuccessMessage(t.boardedSuccess);
      confetti({
        particleCount: 50,
        spread: 50,
        origin: { y: 0.7 },
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 shadow-xl flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white">{t.verifierTitle}</h2>
          <p className="text-xs text-slate-400 mt-0.5">{t.verifierSubtitle}</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-md space-y-4">
        <form onSubmit={(e) => handleSearch(e)} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              id="ticket-verifier-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.searchTicketPlaceholder}
              className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none font-mono-code"
            />
          </div>
          <button
            id="verify-ticket-submit-btn"
            type="submit"
            className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition shadow-md cursor-pointer flex items-center gap-2"
          >
            <QrCode className="w-4 h-4 text-emerald-400" />
            <span>{t.verifyBtn}</span>
          </button>
        </form>

        {/* Quick Test Chips */}
        <div>
          <div className="text-[11px] text-slate-500 font-semibold mb-2">
            {language === 'am' ? 'ፈጣን የሙከራ ትኬቶች (ጠቅ ያድርጉ):' : 'Recent Tickets (Click to verify instantly):'}
          </div>
          <div className="flex flex-wrap gap-2">
            {tickets.slice(0, 5).map((tk) => (
              <button
                key={tk.id}
                type="button"
                onClick={() => {
                  setSearchQuery(tk.ticketNumber);
                  handleSearch(undefined, tk.ticketNumber);
                }}
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-mono-code border border-slate-300 transition cursor-pointer flex items-center gap-1.5"
              >
                <span>{tk.ticketNumber}</span>
                <span className="text-[10px] text-slate-500">({tk.passengerName.split(' ')[0]})</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Verification Result Card */}
      {hasSearched && (
        <div>
          {searchedTicket ? (
            <div className="bg-white rounded-2xl border-2 border-slate-300 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
              {/* Status Ribbon */}
              <div
                className={`p-4 text-white flex items-center justify-between ${
                  searchedTicket.status === 'boarded'
                    ? 'bg-rose-700'
                    : searchedTicket.status === 'active'
                    ? 'bg-emerald-600'
                    : 'bg-slate-700'
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-sm">
                  {searchedTicket.status === 'active' && <CheckCircle2 className="w-5 h-5" />}
                  {searchedTicket.status === 'boarded' && <XCircle className="w-5 h-5 text-amber-300" />}
                  {searchedTicket.status === 'cancelled' && <XCircle className="w-5 h-5" />}
                  <span>
                    {searchedTicket.status === 'active'
                      ? (language === 'am' ? 'ትኬቱ ትክክለኛ ነው (VALID TICKET)' : 'Valid Ticket - Ready for Boarding')
                      : searchedTicket.status === 'boarded'
                      ? (language === 'am' ? 'ትኬቱ ተሳፍሯል - ከአሁን በኋላ አይሰራም (ALREADY ONBOARD & VOID)' : 'ONBOARD - TICKET VOID & WILL NOT WORK')
                      : t.ticketCancelled}
                  </span>
                </div>

                <span className="font-mono-code text-xs bg-white/20 px-2 py-0.5 rounded">
                  {searchedTicket.ticketNumber}
                </span>
              </div>

              {/* Onboard Invalidation Warning Banner */}
              {searchedTicket.status === 'boarded' && (
                <div className="bg-rose-50 border-b border-rose-200 p-4 text-rose-950 text-xs space-y-1">
                  <div className="font-bold flex items-center gap-1.5 text-rose-800 text-sm">
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>
                      {language === 'am'
                        ? 'ትኬቱ ተሳፍሯል! ዳግም መጠቀም አይቻልም'
                        : 'Ticket Already Boarded! Re-entry / Reuse Denied'}
                    </span>
                  </div>
                  <p className="text-rose-800 leading-relaxed">
                    {language === 'am'
                      ? 'ይህ ትኬት አስቀድሞ በስካነር ተረጋግጦ ተሳፋሪው ወደ መኪናው ገብቷል። ትኬቱ በሲስተሙ ውስጥ "ተሳፍሯል (ONBOARD)" ተብሎ ስለተመዘገበ ከአሁን በኋላ አይሰራም።'
                      : 'This ticket has already been checked and scanned for boarding. Once on board, the ticket is burned and will not work for any future entry.'}
                  </p>
                  {searchedTicket.boardedAt && (
                    <div className="text-[11px] font-mono-code text-rose-700 font-semibold">
                      Boarded Timestamp: {searchedTicket.boardedAt}
                    </div>
                  )}
                </div>
              )}

              {/* Success Notification */}
              {boardSuccessMessage && (
                <div className="bg-emerald-50 border-b border-emerald-200 p-3 text-emerald-900 text-xs font-bold flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-600 animate-pulse" />
                  <span>{boardSuccessMessage}</span>
                </div>
              )}

              {/* Details Grid */}
              <div className="p-6 space-y-4">
                {/* Big Highlights */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="bg-slate-900 text-white p-3.5 rounded-xl text-center">
                    <span className="text-[10px] text-emerald-400 font-bold uppercase block">
                      {t.seatNumberLabel}
                    </span>
                    <span className="text-2xl font-black font-mono-code text-white">
                      #{searchedTicket.seatNumber < 10 ? `0${searchedTicket.seatNumber}` : searchedTicket.seatNumber}
                    </span>
                  </div>

                  <div className="bg-amber-50 text-slate-900 border border-amber-300 p-3.5 rounded-xl text-center">
                    <span className="text-[10px] text-amber-800 font-bold uppercase block">
                      {t.plateNumberLabel}
                    </span>
                    <span className="text-base font-black font-mono-code text-slate-950">
                      {searchedTicket.vehiclePlateNumber}
                    </span>
                  </div>

                  <div className="bg-slate-100 text-slate-900 border border-slate-300 p-3.5 rounded-xl text-center col-span-2 sm:col-span-1">
                    <span className="text-[10px] text-slate-500 font-bold uppercase block">
                      {t.gate}
                    </span>
                    <span className="text-sm font-bold text-slate-900">
                      {searchedTicket.gateNumber}
                    </span>
                  </div>
                </div>

                {/* Info List */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">{t.passengerLabel}:</span>
                    <span className="font-bold text-slate-900 text-sm">{searchedTicket.passengerName}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">{t.phoneLabel}:</span>
                    <span className="font-mono-code font-bold text-slate-900">{searchedTicket.passengerPhone}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">{t.routeLabel}:</span>
                    <span className="font-bold text-slate-900">
                      {language === 'am'
                        ? `${searchedTicket.originCityAm} ➔ ${searchedTicket.destinationCityAm}`
                        : `${searchedTicket.originCityEn} ➔ ${searchedTicket.destinationCityEn}`}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">{t.departureTime}:</span>
                    <span className="font-bold text-slate-900 font-mono-code">
                      {searchedTicket.departureDate} at {searchedTicket.departureTime}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">{t.agentIdBadge}:</span>
                    <span className="font-bold text-emerald-800 font-mono-code">
                      {searchedTicket.agentCode} ({searchedTicket.agentName})
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">{t.amountPaidLabel}:</span>
                    <span className="font-bold text-slate-900 font-mono-code">
                      {searchedTicket.totalAmount} ETB ({searchedTicket.paymentMethod.toUpperCase()})
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between gap-3 pt-2">
                  <button
                    onClick={() => setTicketForPrint(searchedTicket)}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
                  >
                    <Printer className="w-4 h-4" />
                    <span>{t.reprintTicket}</span>
                  </button>

                  {searchedTicket.status === 'active' && (
                    <button
                      id="mark-boarded-btn"
                      onClick={handleMarkBoarded}
                      className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black transition shadow-md shadow-emerald-900/20 cursor-pointer flex items-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{t.markAsBoarded}</span>
                    </button>
                  )}

                  {searchedTicket.status === 'boarded' && (
                    <div className="px-4 py-2.5 bg-rose-100 text-rose-900 border border-rose-300 rounded-xl text-xs font-bold flex items-center gap-1.5">
                      <XCircle className="w-4 h-4 text-rose-600" />
                      <span>{language === 'am' ? 'ተሳፍሯል (ዳግም አይሰራም)' : 'Onboard - Inactive (Cannot Reuse)'}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-rose-50 border border-rose-200 text-rose-900 p-6 rounded-2xl text-center space-y-2">
              <AlertTriangle className="w-8 h-8 text-rose-600 mx-auto" />
              <h4 className="text-sm font-bold">{t.ticketNotFound}</h4>
              <p className="text-xs text-rose-700">
                {language === 'am'
                  ? 'እባክዎ የትኬት ቁጥሩን በድጋሚ ያረጋግጡ ወይም ከላይ ካሉት የሙከራ ቁልፎች አንዱን ይጫኑ።'
                  : 'Please double-check the ticket serial number or scan again.'}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
