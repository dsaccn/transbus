import React, { useState } from 'react';
import { useTransport } from '../../context/TransportContext';
import { Vehicle, VehicleType } from '../../types';
import {
  Bus,
  Plus,
  Edit2,
  Trash2,
  Phone,
  User,
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertCircle,
  X,
  Lock,
  Layers,
} from 'lucide-react';

export const FleetManagement: React.FC = () => {
  const { t, language, currentUser, vehicles, addVehicle, updateVehicle, deleteVehicle } = useTransport();

  const isReadOnly = currentUser.role === 'manager';

  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);

  // Form State
  const [plateNumber, setPlateNumber] = useState<string>('');
  const [sideNumber, setSideNumber] = useState<string>('');
  const [model, setModel] = useState<string>('');
  const [type, setType] = useState<VehicleType>('coaster_22');
  const [totalSeats, setTotalSeats] = useState<number>(22);
  const [driverName, setDriverName] = useState<string>('');
  const [driverPhone, setDriverPhone] = useState<string>('');
  const [driverLicenseNo, setDriverLicenseNo] = useState<string>('');

  const resetForm = () => {
    setPlateNumber('');
    setSideNumber('');
    setModel('');
    setType('coaster_22');
    setTotalSeats(22);
    setDriverName('');
    setDriverPhone('');
    setDriverLicenseNo('');
    setEditingVehicle(null);
    setShowAddModal(false);
  };

  const getTypeForSeats = (seats: number): VehicleType => {
    if (seats <= 16) return 'minibus_12';
    if (seats <= 28) return 'coaster_22';
    if (seats <= 48) return 'bus_45';
    return 'luxury_55';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isReadOnly) return;
    if (!plateNumber.trim() || !driverName.trim()) return;

    const seatsCount = Math.max(1, Number(totalSeats) || 22);
    const calculatedType = getTypeForSeats(seatsCount);

    if (editingVehicle) {
      updateVehicle(editingVehicle.id, {
        plateNumber: plateNumber.trim(),
        sideNumber: sideNumber.trim() || undefined,
        model: model.trim() || 'Coaster / Bus',
        type: calculatedType,
        totalSeats: seatsCount,
        driverName: driverName.trim(),
        driverPhone: driverPhone.trim(),
        driverLicenseNo: driverLicenseNo.trim(),
      });
    } else {
      addVehicle({
        plateNumber: plateNumber.trim(),
        sideNumber: sideNumber.trim() || undefined,
        model: model.trim() || 'Toyota Coaster',
        type: calculatedType,
        totalSeats: seatsCount,
        driverName: driverName.trim(),
        driverPhone: driverPhone.trim() || '0911 00 00 00',
        driverLicenseNo: driverLicenseNo.trim() || 'DRV-ETH-1000',
        status: 'ready',
      });
    }
    resetForm();
  };

  const openEdit = (v: Vehicle) => {
    if (isReadOnly) return;
    setEditingVehicle(v);
    setPlateNumber(v.plateNumber);
    setSideNumber(v.sideNumber || '');
    setModel(v.model);
    setType(v.type);
    setTotalSeats(v.totalSeats);
    setDriverName(v.driverName);
    setDriverPhone(v.driverPhone);
    setDriverLicenseNo(v.driverLicenseNo);
    setShowAddModal(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center font-bold">
            <Bus className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white">{t.fleetTitle}</h2>
              {isReadOnly && (
                <span className="text-[10px] font-bold bg-blue-950 text-blue-300 px-2 py-0.5 rounded border border-blue-700 flex items-center gap-1">
                  <Lock className="w-3 h-3" />
                  <span>Read-Only</span>
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {isReadOnly ? t.managerReadOnlyNotice : t.fleetSubtitle}
            </p>
          </div>
        </div>

        {!isReadOnly && (
          <button
            id="add-vehicle-btn"
            onClick={() => {
              resetForm();
              setShowAddModal(true);
            }}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition shadow-md cursor-pointer flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>{t.addNewVehicle}</span>
          </button>
        )}
      </div>

      {/* Read-Only Notice banner for manager */}
      {isReadOnly && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
          <span>
            {language === 'am'
              ? 'የስራ አስኪያጅ እይታ፦ የተሽከርካሪዎችን መረጃ ለመመልከት የተፈቀደ ሲሆን፣ አዲስ መኪና መመዝገብ ወይም ማስተካከል በአስተዳዳሪ (Admin) ብቻ ይከናወናል።'
              : 'Manager View: Read-only access to vehicle rosters and driver assignments. Vehicle registration and edits are managed by System Administrator.'}
          </span>
        </div>
      )}

      {/* Fleet Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {vehicles.map((v) => (
          <div
            key={v.id}
            className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="font-mono-code font-black text-sm bg-slate-900 text-white px-2.5 py-1 rounded-lg shadow-xs">
                    {v.plateNumber}
                  </span>
                  {v.sideNumber && (
                    <span className="text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded-lg">
                      {language === 'am' ? 'የጎን' : 'Side'} #{v.sideNumber}
                    </span>
                  )}
                </div>
                <span
                  className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase ${
                    v.status === 'ready'
                      ? 'bg-emerald-100 text-emerald-800'
                      : v.status === 'boarding'
                      ? 'bg-amber-100 text-amber-800 animate-pulse'
                      : v.status === 'in_transit'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {v.status}
                </span>
              </div>

              <div className="font-bold text-sm text-slate-900 mb-1">{v.model}</div>
              <div className="text-xs text-slate-500 mb-3 font-medium">
                {t[v.type]} ({v.totalSeats} {language === 'am' ? 'መቀመጫ' : 'Seats'})
              </div>

              {/* Driver Details */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-1 mb-4">
                <div className="flex items-center gap-2 text-slate-800 font-semibold">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>{v.driverName}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600 font-mono-code">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{v.driverPhone}</span>
                </div>
                <div className="text-[10px] text-slate-500 font-mono-code">
                  License: {v.driverLicenseNo}
                </div>
              </div>
            </div>

            {/* Actions Bar */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
              {isReadOnly ? (
                <span className="text-[11px] text-slate-500 font-semibold flex items-center gap-1">
                  <Lock className="w-3 h-3 text-slate-400" />
                  <span>{t[v.status as keyof typeof t] || v.status}</span>
                </span>
              ) : (
                <select
                  value={v.status}
                  onChange={(e) => updateVehicle(v.id, { status: e.target.value as any })}
                  className="bg-slate-100 border border-slate-200 text-slate-800 rounded-lg px-2 py-1 text-[11px] font-semibold outline-none cursor-pointer"
                >
                  <option value="ready">{t.statusReady}</option>
                  <option value="boarding">{t.statusBoarding}</option>
                  <option value="in_transit">{t.statusInTransit}</option>
                  <option value="maintenance">{t.statusMaintenance}</option>
                  <option value="completed">{t.statusCompleted}</option>
                </select>
              )}

              {!isReadOnly && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEdit(v)}
                    className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                    title="Edit Vehicle"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteVehicle(v.id)}
                    className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                    title="Delete Vehicle"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Vehicle Modal (Admin only) */}
      {!isReadOnly && showAddModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                {editingVehicle ? 'Edit Vehicle Information' : t.addNewVehicle}
              </h3>
              <button
                onClick={resetForm}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t.vehiclePlate} *
                  </label>
                  <input
                    type="text"
                    required
                    value={plateNumber}
                    onChange={(e) => setPlateNumber(e.target.value)}
                    placeholder="e.g., 3-38492 AA"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 font-mono-code outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                    <span>{t.sideNumberLabel || 'Side Number (የጎን ቁጥር)'}</span>
                    <span className="text-[10px] text-slate-400 font-normal">Optional</span>
                  </label>
                  <input
                    type="text"
                    value={sideNumber}
                    onChange={(e) => setSideNumber(e.target.value)}
                    placeholder="e.g., 14 or B-08"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 font-mono-code outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t.driverAssigned} *
                  </label>
                  <input
                    type="text"
                    required
                    value={driverName}
                    onChange={(e) => setDriverName(e.target.value)}
                    placeholder="Driver full name"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t.driverPhoneLabel} *
                  </label>
                  <input
                    type="tel"
                    required
                    value={driverPhone}
                    onChange={(e) => setDriverPhone(e.target.value)}
                    placeholder="0911 23 45 67"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 font-mono-code outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                  <span>{language === 'am' ? 'የወንበር ብዛት / አቅም (Seat Capacity) *' : 'Seat Capacity (Total Seats) *'}</span>
                  <span className="text-[10px] text-emerald-600 font-semibold">{language === 'am' ? 'የሚስተካከል' : 'Direct Editable'}</span>
                </label>
                <input
                  type="number"
                  min={1}
                  max={100}
                  required
                  value={totalSeats}
                  onChange={(e) => setTotalSeats(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full px-3 py-2 bg-slate-50 border border-emerald-300 rounded-xl text-xs text-slate-900 font-bold outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t.modelAndMake}
                </label>
                <input
                  type="text"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  placeholder="e.g., Toyota Coaster Deluxe 2024"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Driver License Number
                </label>
                <input
                  type="text"
                  value={driverLicenseNo}
                  onChange={(e) => setDriverLicenseNo(e.target.value)}
                  placeholder="DRV-ETH-..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 font-mono-code outline-none focus:ring-2 focus:ring-emerald-500"
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
    </div>
  );
};
