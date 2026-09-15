import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  Vehicle,
  Route,
  Trip,
  Ticket,
  Seat,
  Language,
  Role,
  PaymentMethod,
} from '../types';
import {
  INITIAL_USERS,
  INITIAL_ROUTES,
  INITIAL_VEHICLES,
  INITIAL_TRIPS,
  INITIAL_TICKETS,
  generateSeatsForVehicle,
} from '../data/initialData';
import { translations } from '../i18n/translations';
import QRCode from 'qrcode';
import {
  verifyPassword,
  createSession,
  clearSession,
  validateSession,
  isAccountLocked,
  recordFailedAttempt,
  clearFailedAttempts,
  getAccountLockoutUntil,
  logSecurityEvent,
} from '../security/auth';

export interface LoginResult {
  success: boolean;
  error?: string;
  locked?: boolean;
  lockoutUntil?: number;
  remainingAttempts?: number;
}

interface TransportContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: typeof translations.en;
  currentUser: User;
  setCurrentUser: (user: User) => void;
  isAuthenticated: boolean;
  login: (user: User, password: string) => Promise<LoginResult>;
  logout: () => void;
  users: User[];
  addUser: (user: Omit<User, 'id'>) => void;
  updateUser: (id: string, updates: Partial<User>) => void;
  vehicles: Vehicle[];
  addVehicle: (vehicle: Omit<Vehicle, 'id'>) => void;
  updateVehicle: (id: string, updates: Partial<Vehicle>) => void;
  deleteVehicle: (id: string) => void;
  routes: Route[];
  addRoute: (route: Omit<Route, 'id'>) => void;
  updateRoute: (id: string, updates: Partial<Route>) => void;
  deleteRoute: (id: string) => void;
  trips: Trip[];
  addTrip: (trip: Omit<Trip, 'id' | 'tripCode' | 'bookedSeatsCount'>) => void;
  updateTrip: (id: string, updates: Partial<Trip>) => void;
  dispatchTrip: (tripId: string) => void;
  startBoardingTrip: (tripId: string) => void;
  markTripArrived: (tripId: string) => void;
  resetTripStatus: (tripId: string) => void;
  tickets: Ticket[];
  issueTicket: (ticketData: {
    tripId: string;
    seatNumber: number;
    passengerName?: string;
    passengerPhone?: string;
    passengerGender?: 'male' | 'female' | 'other';
    passengerIdNumber?: string;
    paymentMethod: PaymentMethod;
    baggageWeightKg?: number;
  }) => Promise<Ticket>;
  cancelTicket: (ticketId: string) => void;
  updateTicket: (ticketId: string, updates: Partial<Ticket>) => void;
  markTicketBoarded: (ticketId: string) => boolean;
  getTicketByNumber: (ticketNumber: string) => Ticket | undefined;
  getSeatsForTrip: (tripId: string) => Seat[];
  activeTab: string;
  setActiveTab: (tab: string) => void;
  ticketForPrint: Ticket | null;
  setTicketForPrint: (ticket: Ticket | null) => void;
  ticketsForPrint: Ticket[];
  setTicketsForPrint: (tickets: Ticket[] | Ticket | null) => void;
  issueMultipleTickets: (ticketsData: Array<{
    tripId: string;
    seatNumber: number;
    passengerName?: string;
    passengerPhone?: string;
    passengerGender?: 'male' | 'female' | 'other';
    passengerIdNumber?: string;
    paymentMethod: PaymentMethod;
    baggageWeightKg?: number;
  }>) => Promise<Ticket[]>;
  selectedTripId: string | null;
  setSelectedTripId: (id: string | null) => void;
  selectedSeatNumber: number | null;
  setSelectedSeatNumber: (num: number | null) => void;
  currentTime: string;
}

const TransportContext = createContext<TransportContextType | undefined>(undefined);

export const TransportProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. Language state
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('transit_station_lang');
    return saved === 'am' ? 'am' : 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('transit_station_lang', lang);
  };

  const t = translations[language];

  // 2. Users
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('transit_station_users');
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  // Auth State — use sessionStorage so session dies when tab closes
  const [currentUser, setCurrentUser] = useState<User>(() => {
    // Validate active session first
    if (!validateSession()) {
      clearSession();
      return users.find((u) => u.role === 'agent') || users[2] || INITIAL_USERS[2];
    }
    const savedAuth = sessionStorage.getItem('ts_current_user');
    if (savedAuth) {
      try {
        return JSON.parse(savedAuth);
      } catch {
        // fallback
      }
    }
    return users.find((u) => u.role === 'agent') || users[2] || INITIAL_USERS[2];
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return validateSession();
  });

  // 3. Vehicles
  const [vehicles, setVehicles] = useState<Vehicle[]>(() => {
    const saved = localStorage.getItem('transit_station_vehicles');
    return saved ? JSON.parse(saved) : INITIAL_VEHICLES;
  });

  // 4. Routes
  const [routes, setRoutes] = useState<Route[]>(() => {
    const saved = localStorage.getItem('transit_station_routes');
    return saved ? JSON.parse(saved) : INITIAL_ROUTES;
  });

  // 5. Trips
  const [trips, setTrips] = useState<Trip[]>(() => {
    const saved = localStorage.getItem('transit_station_trips');
    return saved ? JSON.parse(saved) : INITIAL_TRIPS;
  });

  // 6. Tickets
  const [tickets, setTickets] = useState<Ticket[]>(() => {
    const saved = localStorage.getItem('transit_station_tickets');
    return saved ? JSON.parse(saved) : INITIAL_TICKETS;
  });

  // UI States
  const [activeTab, setActiveTab] = useState<string>('ticketCounter');
  const [ticketsForPrint, setTicketsForPrintState] = useState<Ticket[]>([]);

  const setTicketsForPrint = (tks: Ticket[] | Ticket | null) => {
    if (!tks) {
      setTicketsForPrintState([]);
    } else if (Array.isArray(tks)) {
      setTicketsForPrintState(tks);
    } else {
      setTicketsForPrintState([tks]);
    }
  };

  const setTicketForPrint = (ticket: Ticket | null) => {
    setTicketsForPrintState(ticket ? [ticket] : []);
  };

  const ticketForPrint = ticketsForPrint.length > 0 ? ticketsForPrint[0] : null;

  const [selectedTripId, setSelectedTripId] = useState<string | null>(trips[0]?.id || null);
  const [selectedSeatNumber, setSelectedSeatNumber] = useState<number | null>(null);
  const [currentTime, setCurrentTime] = useState<string>('');

  // Save to localStorage on state changes
  useEffect(() => {
    localStorage.setItem('transit_station_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('transit_station_vehicles', JSON.stringify(vehicles));
  }, [vehicles]);

  useEffect(() => {
    localStorage.setItem('transit_station_routes', JSON.stringify(routes));
  }, [routes]);

  useEffect(() => {
    localStorage.setItem('transit_station_trips', JSON.stringify(trips));
  }, [trips]);

  useEffect(() => {
    localStorage.setItem('transit_station_tickets', JSON.stringify(tickets));
  }, [tickets]);

  useEffect(() => {
    if (isAuthenticated) {
      sessionStorage.setItem('ts_current_user', JSON.stringify(currentUser));
    } else {
      sessionStorage.removeItem('ts_current_user');
    }
  }, [isAuthenticated, currentUser]);

  // Live clock
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('en-GB', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  const login = async (user: User, password: string): Promise<LoginResult> => {
    // Check if account is inactive
    if (!user.active) {
      logSecurityEvent('BLOCKED_INACTIVE', user.username, 'Login attempt on inactive account');
      return { success: false, error: 'This account is disabled. Contact your administrator.' };
    }

    // Verify password hash
    const storedHash = user.passwordHash;
    if (!storedHash) {
      // Legacy user without hash — reject
      return { success: false, error: 'Account not configured. Contact administrator.' };
    }

    const passwordValid = await verifyPassword(password, storedHash);
    if (!passwordValid) {
      logSecurityEvent('FAILED_LOGIN', user.username, 'Incorrect password attempt');
      return {
        success: false,
        error: language === 'am' ? 'የይለፍ ቃሉ ትክክል አይደለም።' : 'Incorrect password.',
      };
    }

    // Successful login
    clearFailedAttempts(user.username);
    createSession(user.id, user.role);
    setCurrentUser(user);
    setIsAuthenticated(true);
    logSecurityEvent('LOGIN_SUCCESS', user.username, `Logged in as ${user.role}`);

    // Route by role automatically
    if (user.role === 'agent') {
      setActiveTab('ticketCounter');
    } else if (user.role === 'manager') {
      setActiveTab('ticketCounter');
    } else if (user.role === 'admin') {
      setActiveTab('adminSettings');
    }

    return { success: true };
  };

  const logout = () => {
    setIsAuthenticated(false);
    clearSession();
    logSecurityEvent('LOGOUT', currentUser.username, 'User logged out');
  };

  // User Management
  const addUser = (userData: Omit<User, 'id'>) => {
    const newUser: User = {
      ...userData,
      id: `usr-${Date.now()}`,
    };
    setUsers((prev) => [...prev, newUser]);
  };

  const updateUser = (id: string, updates: Partial<User>) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, ...updates } : u))
    );
    if (currentUser.id === id) {
      setCurrentUser((prev) => ({ ...prev, ...updates }));
    }
  };

  // Fleet Management
  const addVehicle = (vehicleData: Omit<Vehicle, 'id'>) => {
    const newVehicle: Vehicle = {
      ...vehicleData,
      id: `veh-${Date.now()}`,
    };
    setVehicles((prev) => [...prev, newVehicle]);
  };

  const updateVehicle = (id: string, updates: Partial<Vehicle>) => {
    setVehicles((prev) =>
      prev.map((v) => (v.id === id ? { ...v, ...updates } : v))
    );
  };

  const deleteVehicle = (id: string) => {
    setVehicles((prev) => prev.filter((v) => v.id !== id));
  };

  // Route Management
  const addRoute = (routeData: Omit<Route, 'id'>) => {
    const newRoute: Route = {
      ...routeData,
      id: `rt-${Date.now()}`,
    };
    setRoutes((prev) => [...prev, newRoute]);
  };

  const updateRoute = (id: string, updates: Partial<Route>) => {
    setRoutes((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...updates } : r))
    );
  };

  const deleteRoute = (id: string) => {
    setRoutes((prev) => prev.filter((r) => r.id !== id));
  };

  // Trip Operations
  const addTrip = (tripData: Omit<Trip, 'id' | 'tripCode' | 'bookedSeatsCount'>) => {
    const id = `trp-${Date.now()}`;
    const codeNum = Math.floor(100 + Math.random() * 900);
    const newTrip: Trip = {
      ...tripData,
      id,
      tripCode: `TRP-${codeNum}`,
      bookedSeatsCount: 0,
    };
    setTrips((prev) => [newTrip, ...prev]);
  };

  const updateTrip = (id: string, updates: Partial<Trip>) => {
    setTrips((prev) =>
      prev.map((tr) => (tr.id === id ? { ...tr, ...updates } : tr))
    );
  };

  const startBoardingTrip = (tripId: string) => {
    const trip = trips.find((t) => t.id === tripId);
    if (!trip) return;

    setTrips((prev) =>
      prev.map((tr) => (tr.id === tripId ? { ...tr, status: 'boarding' } : tr))
    );
    if (trip.vehicleId) {
      updateVehicle(trip.vehicleId, { status: 'boarding' });
    }
  };

  const dispatchTrip = (tripId: string) => {
    const trip = trips.find((t) => t.id === tripId);
    if (!trip) return;

    setTrips((prev) =>
      prev.map((tr) => (tr.id === tripId ? { ...tr, status: 'departed' } : tr))
    );
    if (trip.vehicleId) {
      updateVehicle(trip.vehicleId, { status: 'in_transit' });
    }
  };

  const markTripArrived = (tripId: string) => {
    const trip = trips.find((t) => t.id === tripId);
    if (!trip) return;

    setTrips((prev) =>
      prev.map((tr) => (tr.id === tripId ? { ...tr, status: 'arrived' } : tr))
    );
    if (trip.vehicleId) {
      updateVehicle(trip.vehicleId, { status: 'completed' });
    }
  };

  const resetTripStatus = (tripId: string) => {
    const trip = trips.find((t) => t.id === tripId);
    if (!trip) return;

    setTrips((prev) =>
      prev.map((tr) => (tr.id === tripId ? { ...tr, status: 'scheduled' } : tr))
    );
    if (trip.vehicleId) {
      updateVehicle(trip.vehicleId, { status: 'ready' });
    }
  };

  // Seat generation
  const getSeatsForTrip = (tripId: string): Seat[] => {
    const trip = trips.find((t) => t.id === tripId);
    if (!trip) return [];

    const vehicle = vehicles.find((v) => v.id === trip.vehicleId);
    if (!vehicle) return [];

    const baseSeats = generateSeatsForVehicle(vehicle.type, vehicle.totalSeats);

    // Overlay active tickets
    const tripTickets = tickets.filter(
      (tk) => tk.tripId === tripId && tk.status !== 'cancelled' && tk.status !== 'refunded'
    );

    return baseSeats.map((seat) => {
      const match = tripTickets.find((tk) => tk.seatNumber === seat.seatNumber);
      if (match) {
        return {
          ...seat,
          status: 'booked',
          ticketId: match.id,
          passengerName: match.passengerName,
          passengerGender: match.passengerGender,
        };
      }
      return seat;
    });
  };

  // Ticket Management
  const cancelTicket = (ticketId: string) => {
    const target = tickets.find((t) => t.id === ticketId);
    if (!target) return;

    setTickets((prev) =>
      prev.map((tk) => (tk.id === ticketId ? { ...tk, status: 'cancelled' } : tk))
    );

    // Decrement trip booked seats count
    setTrips((prev) =>
      prev.map((tr) =>
        tr.id === target.tripId
          ? { ...tr, bookedSeatsCount: Math.max(0, tr.bookedSeatsCount - 1) }
          : tr
      )
    );
  };

  const updateTicket = (ticketId: string, updates: Partial<Ticket>) => {
    setTickets((prev) =>
      prev.map((tk) => (tk.id === ticketId ? { ...tk, ...updates } : tk))
    );
  };

  // Issue ticket with QR code generation
  const issueTicket = async (ticketData: {
    tripId: string;
    seatNumber: number;
    passengerName?: string;
    passengerPhone?: string;
    passengerGender?: 'male' | 'female' | 'other';
    passengerIdNumber?: string;
    paymentMethod: PaymentMethod;
    baggageWeightKg?: number;
  }): Promise<Ticket> => {
    const trip = trips.find((t) => t.id === ticketData.tripId);
    if (!trip) throw new Error('Trip not found');

    const route = routes.find((r) => r.id === trip.routeId);
    if (!route) throw new Error('Route not found');

    const vehicle = vehicles.find((v) => v.id === trip.vehicleId);
    if (!vehicle) throw new Error('Vehicle not found');

    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toTimeString().split(' ')[0];
    const serial = Math.floor(100000 + Math.random() * 900000);
    const ticketNo = `TK-NX-${now.getFullYear()}-${serial}`;

    const fare = trip.pricePerSeat || route.baseFare;
    const serviceFee = 15;
    const total = fare + serviceFee;

    const effectiveName = ticketData.passengerName?.trim() || (language === 'am' ? `ተሳፋሪ (ወንበር #${ticketData.seatNumber})` : `Passenger (Seat #${ticketData.seatNumber})`);
    const effectivePhone = ticketData.passengerPhone?.trim() || 'N/A';
    const effectiveGender = ticketData.passengerGender || 'male';

    // Generate QR Code data
    const qrPayload = JSON.stringify({
      brand: 'Nexora Tech Solutions',
      tkt: ticketNo,
      seat: ticketData.seatNumber,
      plate: vehicle.plateNumber,
      side: vehicle.sideNumber || 'N/A',
      agent: currentUser.agentCode,
      from: route.originNameEn,
      to: route.destinationNameEn,
      dep: `${trip.departureDate} ${trip.departureTime}`,
      pass: effectiveName,
      phone: effectivePhone,
      fare: total,
    });

    let qrCodeDataUrl = '';
    try {
      qrCodeDataUrl = await QRCode.toDataURL(qrPayload, {
        width: 180,
        margin: 1,
        color: {
          dark: '#0f172a',
          light: '#ffffff',
        },
      });
    } catch {
      qrCodeDataUrl = '';
    }

    const newTicket: Ticket = {
      id: `tkt-${Date.now()}`,
      ticketNumber: ticketNo,
      tripId: trip.id,
      routeId: route.id,
      vehicleId: vehicle.id,
      vehiclePlateNumber: vehicle.plateNumber,
      vehicleSideNumber: vehicle.sideNumber || undefined,
      vehicleModel: vehicle.model,
      seatNumber: ticketData.seatNumber,
      passengerName: effectiveName,
      passengerPhone: effectivePhone,
      passengerGender: effectiveGender,
      passengerIdNumber: ticketData.passengerIdNumber?.trim() || undefined,
      fareAmount: fare,
      serviceFee: serviceFee,
      totalAmount: total,
      agentId: currentUser.id,
      agentCode: currentUser.agentCode,
      agentName: currentUser.name,
      agentNameAm: currentUser.nameAm,
      issueDate: dateStr,
      issueTime: timeStr,
      departureDate: trip.departureDate,
      departureTime: trip.departureTime,
      originCityEn: route.originNameEn,
      originCityAm: route.originNameAm,
      destinationCityEn: route.destinationNameEn,
      destinationCityAm: route.destinationNameAm,
      gateNumber: trip.gateNumber,
      paymentMethod: ticketData.paymentMethod,
      status: 'active',
      baggageWeightKg: ticketData.baggageWeightKg || 0,
      qrCodeDataUrl,
    };

    setTickets((prev) => [newTicket, ...prev]);

    // Update trip booked seats count
    setTrips((prev) =>
      prev.map((tr) =>
        tr.id === trip.id
          ? { ...tr, bookedSeatsCount: tr.bookedSeatsCount + 1 }
          : tr
      )
    );

    return newTicket;
  };

  const issueMultipleTickets = async (ticketsData: Array<{
    tripId: string;
    seatNumber: number;
    passengerName?: string;
    passengerPhone?: string;
    passengerGender?: 'male' | 'female' | 'other';
    passengerIdNumber?: string;
    paymentMethod: PaymentMethod;
    baggageWeightKg?: number;
  }>): Promise<Ticket[]> => {
    if (!ticketsData || ticketsData.length === 0) return [];
    const issuedList: Ticket[] = [];
    for (const item of ticketsData) {
      const t = await issueTicket(item);
      issuedList.push(t);
    }
    return issuedList;
  };

  const markTicketBoarded = (ticketId: string): boolean => {
    const target = tickets.find((t) => t.id === ticketId);
    if (!target) return false;
    if (target.status === 'boarded') return false; // Already boarded, cannot board again

    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const dateStr = now.toISOString().split('T')[0];

    setTickets((prev) =>
      prev.map((t) => (t.id === ticketId ? { ...t, status: 'boarded', boardedAt: `${dateStr} ${timeStr}` } : t))
    );
    return true;
  };

  const getTicketByNumber = (ticketNumber: string): Ticket | undefined => {
    return tickets.find(
      (t) => t.ticketNumber.trim().toLowerCase() === ticketNumber.trim().toLowerCase()
    );
  };

  return (
    <TransportContext.Provider
      value={{
        language,
        setLanguage,
        t,
        currentUser,
        setCurrentUser,
        isAuthenticated,
        login,
        logout,
        users,
        addUser,
        updateUser,
        vehicles,
        addVehicle,
        updateVehicle,
        deleteVehicle,
        routes,
        addRoute,
        updateRoute,
        deleteRoute,
        trips,
        addTrip,
        updateTrip,
        dispatchTrip,
        startBoardingTrip,
        markTripArrived,
        resetTripStatus,
        tickets,
        issueTicket,
        issueMultipleTickets,
        cancelTicket,
        updateTicket,
        markTicketBoarded,
        getTicketByNumber,
        getSeatsForTrip,
        activeTab,
        setActiveTab,
        ticketForPrint,
        setTicketForPrint,
        ticketsForPrint,
        setTicketsForPrint,
        selectedTripId,
        setSelectedTripId,
        selectedSeatNumber,
        setSelectedSeatNumber,
        currentTime,
      }}
    >
      {children}
    </TransportContext.Provider>
  );
};

export const useTransport = () => {
  const context = useContext(TransportContext);
  if (!context) {
    throw new Error('useTransport must be used within a TransportProvider');
  }
  return context;
};
