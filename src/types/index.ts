export type Role = 'admin' | 'manager' | 'agent';

export type Language = 'en' | 'am';

export interface User {
  id: string;
  name: string;
  nameAm: string;
  username: string;
  passwordHash?: string; // SHA-256 hash of user password
  role: Role;
  agentCode: string; // e.g. "AGT-104"
  stationId: string;
  phone: string;
  active: boolean;
  avatar?: string;
}

export interface Station {
  id: string;
  nameEn: string;
  nameAm: string;
  cityEn: string;
  cityAm: string;
  code: string;
  region: string;
}

export type VehicleType = 'minibus_12' | 'coaster_22' | 'bus_45' | 'luxury_55';

export interface Vehicle {
  id: string;
  plateNumber: string; // e.g. "3-38492 AA" or "ኮድ 3-38492 አ.አ"
  plateNumberAm?: string;
  sideNumber?: string; // e.g. "B-14", "14", "Side 08", "የጎን ቁጥር 14"
  model: string;
  type: VehicleType;
  totalSeats: number; // editable seat capacity
  driverName: string;
  driverPhone: string;
  driverLicenseNo: string;
  status: 'ready' | 'boarding' | 'in_transit' | 'maintenance' | 'completed';
  assignedRouteId?: string;
  currentTripId?: string;
}

export type SeatStatus = 'available' | 'booked' | 'reserved' | 'selected' | 'disabled';

export interface Seat {
  id: string;
  seatNumber: number;
  label: string; // e.g. "01", "02", "12"
  row: number;
  col: number;
  isWindow: boolean;
  isAisle: boolean;
  status: SeatStatus;
  ticketId?: string;
  passengerName?: string;
  passengerGender?: 'male' | 'female' | 'other';
}

export interface Route {
  id: string;
  routeCode: string; // e.g. "RT-ADD-HAW"
  originStationId: string;
  destinationStationId: string;
  originNameEn: string;
  originNameAm: string;
  destinationNameEn: string;
  destinationNameAm: string;
  distanceKm: number;
  estimatedDurationHours: number;
  baseFare: number; // in ETB (Birr)
  viaTownsEn: string[];
  viaTownsAm: string[];
  status: 'active' | 'suspended';
}

export type TripStatus = 'scheduled' | 'boarding' | 'departed' | 'arrived' | 'cancelled';

export interface Trip {
  id: string;
  tripCode: string; // e.g. "TRP-8821"
  routeId: string;
  vehicleId: string;
  driverName?: string;
  departureDate: string; // YYYY-MM-DD
  departureTime: string; // HH:mm
  gateNumber: string; // e.g. "Gate 03" / "በር 3"
  status: TripStatus;
  pricePerSeat: number; // in ETB
  bookedSeatsCount: number;
  totalSeatsCount: number;
}

export type PaymentMethod = 'cash' | 'telebirr' | 'cbe' | 'abyssinia' | 'cbe_birr' | 'bank_card';

export interface Ticket {
  id: string;
  ticketNumber: string; // e.g. "TK-AA-2025-004812"
  tripId: string;
  routeId: string;
  vehicleId: string;
  vehiclePlateNumber: string;
  vehicleSideNumber?: string;
  vehicleModel: string;
  seatNumber: number;
  passengerName: string;
  passengerPhone: string;
  passengerGender: 'male' | 'female' | 'other';
  passengerIdNumber?: string;
  fareAmount: number; // in ETB (Birr)
  serviceFee: number;
  totalAmount: number;
  agentId: string;
  agentCode: string;
  agentName: string;
  agentNameAm: string;
  issueDate: string; // YYYY-MM-DD
  issueTime: string; // HH:mm:ss
  departureDate: string;
  departureTime: string;
  originCityEn: string;
  originCityAm: string;
  destinationCityEn: string;
  destinationCityAm: string;
  gateNumber: string;
  paymentMethod: PaymentMethod;
  status: 'active' | 'boarded' | 'cancelled' | 'refunded';
  boardedAt?: string; // Timestamp when scanned & onboarded
  baggageWeightKg?: number;
  qrCodeDataUrl?: string;
}

export interface AgentShiftSummary {
  agentId: string;
  agentCode: string;
  agentName: string;
  totalTicketsIssued: number;
  totalCashETB: number;
  totalTelebirrETB: number;
  totalCbeBirrETB: number;
  totalRevenueETB: number;
  shiftStartTime: string;
}
