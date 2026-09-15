import { User, Vehicle, Route, Trip, Ticket, Seat } from '../types';

// Default password for all demo users: Transit@2025!
// SHA-256 hash: 69fecb2d5cf8594a6dde0d662966f8ed5499f66430713432e964d0500a206862
const DEFAULT_HASH = '69fecb2d5cf8594a6dde0d662966f8ed5499f66430713432e964d0500a206862';

export const INITIAL_USERS: User[] = [
  {
    id: 'usr-admin-1',
    name: 'Yohannes Girma',
    nameAm: 'ዮሐንስ ግርማ',
    username: 'admin',
    passwordHash: DEFAULT_HASH,
    role: 'admin',
    agentCode: 'ADM-001',
    stationId: 'stn-addis-main',
    phone: '0911 40 21 88',
    active: true,
    avatar: '👨‍💼',
  },
  {
    id: 'usr-mgr-1',
    name: 'Tigist Alemayehu',
    nameAm: 'ትዕግስት አለማየሁ',
    username: 'manager',
    passwordHash: DEFAULT_HASH,
    role: 'manager',
    agentCode: 'MGR-012',
    stationId: 'stn-addis-main',
    phone: '0912 88 44 22',
    active: true,
    avatar: '👩‍💼',
  },
  {
    id: 'usr-agent-1',
    name: 'Bekele Desta',
    nameAm: 'በቀለ ደስታ',
    username: 'agent1',
    passwordHash: DEFAULT_HASH,
    role: 'agent',
    agentCode: 'AGT-104',
    stationId: 'stn-addis-main',
    phone: '0913 55 99 01',
    active: true,
    avatar: '🎫',
  },
  {
    id: 'usr-agent-2',
    name: 'Selamawit Kebede',
    nameAm: 'ሰላማዊት ከበደ',
    username: 'agent2',
    passwordHash: DEFAULT_HASH,
    role: 'agent',
    agentCode: 'AGT-105',
    stationId: 'stn-addis-main',
    phone: '0922 11 33 44',
    active: true,
    avatar: '👩‍💻',
  },
];

export const INITIAL_ROUTES: Route[] = [
  {
    id: 'rt-add-haw',
    routeCode: 'RT-ADD-HAW',
    originStationId: 'stn-addis',
    destinationStationId: 'stn-hawassa',
    originNameEn: 'Addis Ababa (Autobis Tera)',
    originNameAm: 'አዲስ አበባ (አውቶቡስ ተራ)',
    destinationNameEn: 'Hawassa Terminal',
    destinationNameAm: 'ሀዋሳ ተርሚናል',
    distanceKm: 275,
    estimatedDurationHours: 4.5,
    baseFare: 420,
    viaTownsEn: ['Bishoftu', 'Mojo', 'Zeway (Batu)', 'Shashemene'],
    viaTownsAm: ['ቢሾፍቱ', 'ሞጆ', 'ዝዋይ (ባቱ)', 'ሻሸመኔ'],
    status: 'active',
  },
  {
    id: 'rt-add-bhr',
    routeCode: 'RT-ADD-BHR',
    originStationId: 'stn-addis',
    destinationStationId: 'stn-bahirdar',
    originNameEn: 'Addis Ababa (Lamberet)',
    originNameAm: 'አዲስ አበባ (ላምበረት)',
    destinationNameEn: 'Bahir Dar Central',
    destinationNameAm: 'ባህር ዳር ማዕከላዊ',
    distanceKm: 565,
    estimatedDurationHours: 8.5,
    baseFare: 880,
    viaTownsEn: ['Sululta', 'Fiche', 'Debre Markos', 'Mota'],
    viaTownsAm: ['ሱሉልታ', 'ፍቼ', 'ደብረ ማርቆስ', 'ሞጣ'],
    status: 'active',
  },
  {
    id: 'rt-add-drd',
    routeCode: 'RT-ADD-DRD',
    originStationId: 'stn-addis',
    destinationStationId: 'stn-diredawa',
    originNameEn: 'Addis Ababa (Kality)',
    originNameAm: 'አዲስ አበባ (ቃሊቲ)',
    destinationNameEn: 'Dire Dawa Terminal',
    destinationNameAm: 'ድሬዳዋ ተርሚናል',
    distanceKm: 450,
    estimatedDurationHours: 7.0,
    baseFare: 750,
    viaTownsEn: ['Adama', 'Awash', 'Mieso', 'Asebe Teferi'],
    viaTownsAm: ['አዳማ', 'አዋሽ', 'ሚኤሶ', 'አሰበ ተፈሪ'],
    status: 'active',
  },
  {
    id: 'rt-add-jma',
    routeCode: 'RT-ADD-JMA',
    originStationId: 'stn-addis',
    destinationStationId: 'stn-jimma',
    originNameEn: 'Addis Ababa (Autobis Tera)',
    originNameAm: 'አዲስ አበባ (አውቶቡስ ተራ)',
    destinationNameEn: 'Jimma Aba Jifar Terminal',
    destinationNameAm: 'ጅማ አባ ጅፋር ተርሚናል',
    distanceKm: 350,
    estimatedDurationHours: 5.5,
    baseFare: 560,
    viaTownsEn: ['Sebeta', 'Woliso', 'Welkite', 'Seka'],
    viaTownsAm: ['ሰበታ', 'ወሊሶ', 'ወልቂጤ', 'ሴቃ'],
    status: 'active',
  },
  {
    id: 'rt-add-adm',
    routeCode: 'RT-ADD-ADM',
    originStationId: 'stn-addis',
    destinationStationId: 'stn-adama',
    originNameEn: 'Addis Ababa (Kality)',
    originNameAm: 'አዲስ አበባ (ቃሊቲ)',
    destinationNameEn: 'Adama (Nazret) Station',
    destinationNameAm: 'አዳማ (ናዝሬት) ጣቢያ',
    distanceKm: 98,
    estimatedDurationHours: 1.5,
    baseFare: 180,
    viaTownsEn: ['Bishoftu', 'Mojo'],
    viaTownsAm: ['ቢሾፍቱ', 'ሞጆ'],
    status: 'active',
  },
  {
    id: 'rt-add-gdr',
    routeCode: 'RT-ADD-GDR',
    originStationId: 'stn-addis',
    destinationStationId: 'stn-gondar',
    originNameEn: 'Addis Ababa (Lamberet)',
    originNameAm: 'አዲስ አበባ (ላምበረት)',
    destinationNameEn: 'Gondar Fasil Terminal',
    destinationNameAm: 'ጎንደር ፋሲል ተርሚናል',
    distanceKm: 730,
    estimatedDurationHours: 11.0,
    baseFare: 1150,
    viaTownsEn: ['Debre Markos', 'Bahir Dar', 'Wereta', 'Azezo'],
    viaTownsAm: ['ደብረ ማርቆስ', 'ባህር ዳር', 'ወረታ', 'አዘዞ'],
    status: 'active',
  }
];

export const INITIAL_VEHICLES: Vehicle[] = [
  {
    id: 'veh-01',
    plateNumber: '3-38492 AA',
    plateNumberAm: 'ኮድ 3-38492 አ.አ',
    sideNumber: '14',
    model: 'Toyota HiAce Minibus',
    type: 'minibus_12',
    totalSeats: 12,
    driverName: 'Kassahun Worku',
    driverPhone: '0911 34 56 78',
    driverLicenseNo: 'DRV-ETH-9921',
    status: 'boarding',
    assignedRouteId: 'rt-add-adm',
    currentTripId: 'trp-01',
  },
  {
    id: 'veh-02',
    plateNumber: '3-55910 AA',
    plateNumberAm: 'ኮድ 3-55910 አ.አ',
    sideNumber: '08',
    model: 'Toyota Coaster Deluxe',
    type: 'coaster_22',
    totalSeats: 22,
    driverName: 'Mulugeta Tesfaye',
    driverPhone: '0912 44 88 11',
    driverLicenseNo: 'DRV-ETH-4412',
    status: 'boarding',
    assignedRouteId: 'rt-add-haw',
    currentTripId: 'trp-02',
  },
  {
    id: 'veh-03',
    plateNumber: '3-88219 AA',
    plateNumberAm: 'ኮድ 3-88219 አ.አ',
    sideNumber: '25',
    model: 'Isuzu Higher Coach',
    type: 'bus_45',
    totalSeats: 45,
    driverName: 'Getachew Haile',
    driverPhone: '0913 22 77 90',
    driverLicenseNo: 'DRV-ETH-7721',
    status: 'ready',
    assignedRouteId: 'rt-add-bhr',
    currentTripId: 'trp-03',
  },
  {
    id: 'veh-04',
    plateNumber: '3-19455 AA',
    plateNumberAm: 'ኮድ 3-19455 አ.አ',
    sideNumber: '42',
    model: 'Yutong Luxury VIP Coach',
    type: 'luxury_55',
    totalSeats: 55,
    driverName: 'Abinet Tadesse',
    driverPhone: '0914 99 22 33',
    driverLicenseNo: 'DRV-ETH-8834',
    status: 'ready',
    assignedRouteId: 'rt-add-drd',
    currentTripId: 'trp-04',
  },
  {
    id: 'veh-05',
    plateNumber: '3-77401 AA',
    plateNumberAm: 'ኮድ 3-77401 አ.አ',
    sideNumber: '19',
    model: 'Toyota Coaster',
    type: 'coaster_22',
    totalSeats: 22,
    driverName: 'Dawit Mengistu',
    driverPhone: '0921 55 44 33',
    driverLicenseNo: 'DRV-ETH-1092',
    status: 'ready',
    assignedRouteId: 'rt-add-jma',
    currentTripId: 'trp-05',
  },
  {
    id: 'veh-06',
    plateNumber: '3-49021 AA',
    plateNumberAm: 'ኮድ 3-49021 አ.አ',
    sideNumber: '33',
    model: 'Zhongtong Intercity Coach',
    type: 'bus_45',
    totalSeats: 45,
    driverName: 'Henok Berhanu',
    driverPhone: '0933 77 11 22',
    driverLicenseNo: 'DRV-ETH-6523',
    status: 'ready',
    assignedRouteId: 'rt-add-gdr',
    currentTripId: 'trp-06',
  }
];

const getDayOffset = (days: number): string => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
};

export const INITIAL_TRIPS: Trip[] = [
  // Today's trips
  {
    id: 'trp-01',
    tripCode: 'TRP-ADM-101',
    routeId: 'rt-add-adm',
    vehicleId: 'veh-01',
    departureDate: getDayOffset(0),
    departureTime: '06:30',
    gateNumber: 'Gate 01 (በር 1)',
    status: 'boarding',
    pricePerSeat: 180,
    bookedSeatsCount: 9,
    totalSeatsCount: 12,
  },
  {
    id: 'trp-02',
    tripCode: 'TRP-HAW-204',
    routeId: 'rt-add-haw',
    vehicleId: 'veh-02',
    departureDate: getDayOffset(0),
    departureTime: '07:15',
    gateNumber: 'Gate 04 (በር 4)',
    status: 'boarding',
    pricePerSeat: 420,
    bookedSeatsCount: 19,
    totalSeatsCount: 22,
  },
  {
    id: 'trp-03',
    tripCode: 'TRP-BHR-301',
    routeId: 'rt-add-bhr',
    vehicleId: 'veh-03',
    departureDate: getDayOffset(0),
    departureTime: '05:45',
    gateNumber: 'Gate 08 (በር 8)',
    status: 'scheduled',
    pricePerSeat: 880,
    bookedSeatsCount: 38,
    totalSeatsCount: 45,
  },
  {
    id: 'trp-04',
    tripCode: 'TRP-DRD-402',
    routeId: 'rt-add-drd',
    vehicleId: 'veh-04',
    departureDate: getDayOffset(0),
    departureTime: '06:00',
    gateNumber: 'Gate 02 (በር 2)',
    status: 'scheduled',
    pricePerSeat: 750,
    bookedSeatsCount: 42,
    totalSeatsCount: 55,
  },
  {
    id: 'trp-05',
    tripCode: 'TRP-JMA-501',
    routeId: 'rt-add-jma',
    vehicleId: 'veh-05',
    departureDate: getDayOffset(0),
    departureTime: '07:30',
    gateNumber: 'Gate 05 (በር 5)',
    status: 'scheduled',
    pricePerSeat: 560,
    bookedSeatsCount: 15,
    totalSeatsCount: 22,
  },
  {
    id: 'trp-06',
    tripCode: 'TRP-GDR-601',
    routeId: 'rt-add-gdr',
    vehicleId: 'veh-06',
    departureDate: getDayOffset(0),
    departureTime: '05:30',
    gateNumber: 'Gate 09 (በር 9)',
    status: 'scheduled',
    pricePerSeat: 1150,
    bookedSeatsCount: 36,
    totalSeatsCount: 45,
  },

  // Additional scheduled trips across calendar dates for vehicle 1
  {
    id: 'trp-07',
    tripCode: 'TRP-ADM-102',
    routeId: 'rt-adm-add',
    vehicleId: 'veh-01',
    departureDate: getDayOffset(0),
    departureTime: '02:30 PM',
    gateNumber: 'Gate 03 (በር 3)',
    status: 'scheduled',
    pricePerSeat: 180,
    bookedSeatsCount: 7,
    totalSeatsCount: 12,
  },
  {
    id: 'trp-08',
    tripCode: 'TRP-ADM-103',
    routeId: 'rt-add-adm',
    vehicleId: 'veh-01',
    departureDate: getDayOffset(1),
    departureTime: '06:30 AM',
    gateNumber: 'Gate 01 (በር 1)',
    status: 'scheduled',
    pricePerSeat: 180,
    bookedSeatsCount: 10,
    totalSeatsCount: 12,
  },
  {
    id: 'trp-09',
    tripCode: 'TRP-ADM-104',
    routeId: 'rt-add-adm',
    vehicleId: 'veh-01',
    departureDate: getDayOffset(3),
    departureTime: '08:00 AM',
    gateNumber: 'Gate 01 (በር 1)',
    status: 'scheduled',
    pricePerSeat: 180,
    bookedSeatsCount: 11,
    totalSeatsCount: 12,
  },
  {
    id: 'trp-10',
    tripCode: 'TRP-ADM-105',
    routeId: 'rt-adm-add',
    vehicleId: 'veh-01',
    departureDate: getDayOffset(-2),
    departureTime: '06:00 AM',
    gateNumber: 'Gate 02 (በር 2)',
    status: 'arrived',
    pricePerSeat: 180,
    bookedSeatsCount: 12,
    totalSeatsCount: 12,
  },

  // Trips for vehicle 2 (Coaster veh-02)
  {
    id: 'trp-11',
    tripCode: 'TRP-HAW-205',
    routeId: 'rt-haw-add',
    vehicleId: 'veh-02',
    departureDate: getDayOffset(1),
    departureTime: '01:30 PM',
    gateNumber: 'Gate 04 (በር 4)',
    status: 'scheduled',
    pricePerSeat: 420,
    bookedSeatsCount: 18,
    totalSeatsCount: 22,
  },
  {
    id: 'trp-12',
    tripCode: 'TRP-HAW-206',
    routeId: 'rt-add-haw',
    vehicleId: 'veh-02',
    departureDate: getDayOffset(2),
    departureTime: '06:45 AM',
    gateNumber: 'Gate 04 (በር 4)',
    status: 'scheduled',
    pricePerSeat: 420,
    bookedSeatsCount: 14,
    totalSeatsCount: 22,
  },
  {
    id: 'trp-13',
    tripCode: 'TRP-HAW-207',
    routeId: 'rt-add-haw',
    vehicleId: 'veh-02',
    departureDate: getDayOffset(-1),
    departureTime: '07:15 AM',
    gateNumber: 'Gate 04 (በር 4)',
    status: 'arrived',
    pricePerSeat: 420,
    bookedSeatsCount: 22,
    totalSeatsCount: 22,
  },
  {
    id: 'trp-14',
    tripCode: 'TRP-HAW-208',
    routeId: 'rt-add-haw',
    vehicleId: 'veh-02',
    departureDate: getDayOffset(5),
    departureTime: '06:30 AM',
    gateNumber: 'Gate 04 (በር 4)',
    status: 'scheduled',
    pricePerSeat: 420,
    bookedSeatsCount: 8,
    totalSeatsCount: 22,
  },

  // Trips for vehicle 3 (Zhongtong Coach veh-03)
  {
    id: 'trp-15',
    tripCode: 'TRP-BHR-302',
    routeId: 'rt-bhr-add',
    vehicleId: 'veh-03',
    departureDate: getDayOffset(1),
    departureTime: '06:00 AM',
    gateNumber: 'Gate 08 (በር 8)',
    status: 'scheduled',
    pricePerSeat: 880,
    bookedSeatsCount: 40,
    totalSeatsCount: 45,
  },
  {
    id: 'trp-16',
    tripCode: 'TRP-BHR-303',
    routeId: 'rt-add-bhr',
    vehicleId: 'veh-03',
    departureDate: getDayOffset(-3),
    departureTime: '05:45 AM',
    gateNumber: 'Gate 08 (በር 8)',
    status: 'arrived',
    pricePerSeat: 880,
    bookedSeatsCount: 44,
    totalSeatsCount: 45,
  },
  {
    id: 'trp-17',
    tripCode: 'TRP-BHR-304',
    routeId: 'rt-add-bhr',
    vehicleId: 'veh-03',
    departureDate: getDayOffset(4),
    departureTime: '06:00 AM',
    gateNumber: 'Gate 08 (በር 8)',
    status: 'scheduled',
    pricePerSeat: 880,
    bookedSeatsCount: 25,
    totalSeatsCount: 45,
  },

  // Trips for vehicle 4 (Yutong Luxury Coach veh-04)
  {
    id: 'trp-18',
    tripCode: 'TRP-DRD-403',
    routeId: 'rt-drd-add',
    vehicleId: 'veh-04',
    departureDate: getDayOffset(1),
    departureTime: '07:00 AM',
    gateNumber: 'Gate 02 (በር 2)',
    status: 'scheduled',
    pricePerSeat: 750,
    bookedSeatsCount: 50,
    totalSeatsCount: 55,
  },
  {
    id: 'trp-19',
    tripCode: 'TRP-DRD-404',
    routeId: 'rt-add-drd',
    vehicleId: 'veh-04',
    departureDate: getDayOffset(3),
    departureTime: '06:00 AM',
    gateNumber: 'Gate 02 (በር 2)',
    status: 'scheduled',
    pricePerSeat: 750,
    bookedSeatsCount: 30,
    totalSeatsCount: 55,
  },

  // Trips for vehicle 5 (Coaster veh-05)
  {
    id: 'trp-20',
    tripCode: 'TRP-JMA-502',
    routeId: 'rt-jma-add',
    vehicleId: 'veh-05',
    departureDate: getDayOffset(2),
    departureTime: '06:30 AM',
    gateNumber: 'Gate 05 (በር 5)',
    status: 'scheduled',
    pricePerSeat: 560,
    bookedSeatsCount: 16,
    totalSeatsCount: 22,
  },

  // Trips for vehicle 6 (Coach veh-06)
  {
    id: 'trp-21',
    tripCode: 'TRP-GDR-602',
    routeId: 'rt-gdr-add',
    vehicleId: 'veh-06',
    departureDate: getDayOffset(2),
    departureTime: '05:30 AM',
    gateNumber: 'Gate 09 (በር 9)',
    status: 'scheduled',
    pricePerSeat: 1150,
    bookedSeatsCount: 39,
    totalSeatsCount: 45,
  },
];

export function generateSeatsForVehicle(vehicleType: Vehicle['type'], totalSeats: number): Seat[] {
  const seats: Seat[] = [];
  const count = totalSeats > 0 ? totalSeats : 22;
  
  if (vehicleType === 'minibus_12' && count === 12) {
    // Standard 12-seater layout
    const layout = [
      { num: 1, row: 0, col: 2, win: true, aisle: false },
      { num: 2, row: 1, col: 0, win: true, aisle: false },
      { num: 3, row: 1, col: 1, win: false, aisle: true },
      { num: 4, row: 1, col: 2, win: true, aisle: false },
      { num: 5, row: 2, col: 0, win: true, aisle: false },
      { num: 6, row: 2, col: 1, win: false, aisle: true },
      { num: 7, row: 2, col: 2, win: true, aisle: false },
      { num: 8, row: 3, col: 0, win: true, aisle: false },
      { num: 9, row: 3, col: 1, win: false, aisle: false },
      { num: 10, row: 3, col: 2, win: false, aisle: false },
      { num: 11, row: 3, col: 3, win: false, aisle: false },
      { num: 12, row: 3, col: 4, win: true, aisle: false },
    ];
    for (const item of layout) {
      seats.push({
        id: `seat-${item.num}`,
        seatNumber: item.num,
        label: item.num < 10 ? `0${item.num}` : `${item.num}`,
        row: item.row,
        col: item.col,
        isWindow: item.win,
        isAisle: item.aisle,
        status: 'available',
      });
    }
    return seats;
  }

  if (vehicleType === 'coaster_22' && count === 22) {
    // Standard 22-seater coaster layout (2+aisle+1)
    let seatNo = 1;
    for (let r = 1; r <= 6; r++) {
      seats.push({ id: `seat-${seatNo}`, seatNumber: seatNo, label: seatNo < 10 ? `0${seatNo}` : `${seatNo}`, row: r, col: 0, isWindow: true, isAisle: false, status: 'available' }); seatNo++;
      seats.push({ id: `seat-${seatNo}`, seatNumber: seatNo, label: seatNo < 10 ? `0${seatNo}` : `${seatNo}`, row: r, col: 1, isWindow: false, isAisle: true, status: 'available' }); seatNo++;
      seats.push({ id: `seat-${seatNo}`, seatNumber: seatNo, label: seatNo < 10 ? `0${seatNo}` : `${seatNo}`, row: r, col: 3, isWindow: true, isAisle: true, status: 'available' }); seatNo++;
    }
    for (let c = 0; c < 4; c++) {
      seats.push({ id: `seat-${seatNo}`, seatNumber: seatNo, label: `${seatNo}`, row: 7, col: c, isWindow: c === 0 || c === 3, isAisle: false, status: 'available' }); seatNo++;
    }
    return seats;
  }

  if (vehicleType === 'bus_45' && count === 45) {
    // Standard 45-seater bus (2+aisle+2)
    let seatNo = 1;
    for (let r = 1; r <= 10; r++) {
      seats.push({ id: `seat-${seatNo}`, seatNumber: seatNo, label: seatNo < 10 ? `0${seatNo}` : `${seatNo}`, row: r, col: 0, isWindow: true, isAisle: false, status: 'available' }); seatNo++;
      seats.push({ id: `seat-${seatNo}`, seatNumber: seatNo, label: seatNo < 10 ? `0${seatNo}` : `${seatNo}`, row: r, col: 1, isWindow: false, isAisle: true, status: 'available' }); seatNo++;
      seats.push({ id: `seat-${seatNo}`, seatNumber: seatNo, label: seatNo < 10 ? `0${seatNo}` : `${seatNo}`, row: r, col: 3, isWindow: false, isAisle: true, status: 'available' }); seatNo++;
      seats.push({ id: `seat-${seatNo}`, seatNumber: seatNo, label: seatNo < 10 ? `0${seatNo}` : `${seatNo}`, row: r, col: 4, isWindow: true, isAisle: false, status: 'available' }); seatNo++;
    }
    for (let c = 0; c < 5; c++) {
      seats.push({ id: `seat-${seatNo}`, seatNumber: seatNo, label: `${seatNo}`, row: 11, col: c, isWindow: c === 0 || c === 4, isAisle: false, status: 'available' }); seatNo++;
    }
    return seats;
  }

  // Generic / Custom edited seat layout matching exact `count`
  // Uses 2 + aisle + 2 if count > 24, otherwise 2 + aisle + 1
  const colsPerRow = count > 24 ? 4 : 3;
  let currentNum = 1;
  let currentRow = 1;

  while (currentNum <= count) {
    const remaining = count - currentNum + 1;
    // If last row has 4 or 5 seats, place them contiguous
    if (remaining <= 5 && remaining >= 3) {
      for (let c = 0; c < remaining; c++) {
        seats.push({
          id: `seat-${currentNum}`,
          seatNumber: currentNum,
          label: currentNum < 10 ? `0${currentNum}` : `${currentNum}`,
          row: currentRow,
          col: c,
          isWindow: c === 0 || c === remaining - 1,
          isAisle: false,
          status: 'available',
        });
        currentNum++;
      }
      break;
    }

    if (colsPerRow === 3) {
      // 2 left, aisle, 1 right
      if (currentNum <= count) {
        seats.push({ id: `seat-${currentNum}`, seatNumber: currentNum, label: currentNum < 10 ? `0${currentNum}` : `${currentNum}`, row: currentRow, col: 0, isWindow: true, isAisle: false, status: 'available' });
        currentNum++;
      }
      if (currentNum <= count) {
        seats.push({ id: `seat-${currentNum}`, seatNumber: currentNum, label: currentNum < 10 ? `0${currentNum}` : `${currentNum}`, row: currentRow, col: 1, isWindow: false, isAisle: true, status: 'available' });
        currentNum++;
      }
      if (currentNum <= count) {
        seats.push({ id: `seat-${currentNum}`, seatNumber: currentNum, label: currentNum < 10 ? `0${currentNum}` : `${currentNum}`, row: currentRow, col: 3, isWindow: true, isAisle: true, status: 'available' });
        currentNum++;
      }
    } else {
      // 2 left, aisle, 2 right
      if (currentNum <= count) {
        seats.push({ id: `seat-${currentNum}`, seatNumber: currentNum, label: currentNum < 10 ? `0${currentNum}` : `${currentNum}`, row: currentRow, col: 0, isWindow: true, isAisle: false, status: 'available' });
        currentNum++;
      }
      if (currentNum <= count) {
        seats.push({ id: `seat-${currentNum}`, seatNumber: currentNum, label: currentNum < 10 ? `0${currentNum}` : `${currentNum}`, row: currentRow, col: 1, isWindow: false, isAisle: true, status: 'available' });
        currentNum++;
      }
      if (currentNum <= count) {
        seats.push({ id: `seat-${currentNum}`, seatNumber: currentNum, label: currentNum < 10 ? `0${currentNum}` : `${currentNum}`, row: currentRow, col: 3, isWindow: false, isAisle: true, status: 'available' });
        currentNum++;
      }
      if (currentNum <= count) {
        seats.push({ id: `seat-${currentNum}`, seatNumber: currentNum, label: currentNum < 10 ? `0${currentNum}` : `${currentNum}`, row: currentRow, col: 4, isWindow: true, isAisle: false, status: 'available' });
        currentNum++;
      }
    }
    currentRow++;
  }

  return seats;
}

export const INITIAL_TICKETS: Ticket[] = [
  {
    id: 'tkt-001',
    ticketNumber: 'TK-AA-2025-001842',
    tripId: 'trp-01',
    routeId: 'rt-add-adm',
    vehicleId: 'veh-01',
    vehiclePlateNumber: '3-38492 AA',
    vehicleModel: 'Toyota HiAce Minibus',
    seatNumber: 1,
    passengerName: 'Abebe Balcha',
    passengerPhone: '0911 23 45 67',
    passengerGender: 'male',
    fareAmount: 180,
    serviceFee: 10,
    totalAmount: 190,
    agentId: 'usr-agent-1',
    agentCode: 'AGT-104',
    agentName: 'Bekele Desta',
    agentNameAm: 'በቀለ ደስታ',
    issueDate: new Date().toISOString().split('T')[0],
    issueTime: '05:40:12',
    departureDate: new Date().toISOString().split('T')[0],
    departureTime: '06:30',
    originCityEn: 'Addis Ababa',
    originCityAm: 'አዲስ አበባ',
    destinationCityEn: 'Adama',
    destinationCityAm: 'አዳማ',
    gateNumber: 'Gate 01 (በር 1)',
    paymentMethod: 'telebirr',
    status: 'active',
  },
  {
    id: 'tkt-002',
    ticketNumber: 'TK-AA-2025-001843',
    tripId: 'trp-01',
    routeId: 'rt-add-adm',
    vehicleId: 'veh-01',
    vehiclePlateNumber: '3-38492 AA',
    vehicleModel: 'Toyota HiAce Minibus',
    seatNumber: 2,
    passengerName: 'Genet Tadesse',
    passengerPhone: '0922 45 67 89',
    passengerGender: 'female',
    fareAmount: 180,
    serviceFee: 10,
    totalAmount: 190,
    agentId: 'usr-agent-1',
    agentCode: 'AGT-104',
    agentName: 'Bekele Desta',
    agentNameAm: 'በቀለ ደስታ',
    issueDate: new Date().toISOString().split('T')[0],
    issueTime: '05:45:20',
    departureDate: new Date().toISOString().split('T')[0],
    departureTime: '06:30',
    originCityEn: 'Addis Ababa',
    originCityAm: 'አዲስ አበባ',
    destinationCityEn: 'Adama',
    destinationCityAm: 'አዳማ',
    gateNumber: 'Gate 01 (በር 1)',
    paymentMethod: 'cash',
    status: 'boarded',
  },
  {
    id: 'tkt-003',
    ticketNumber: 'TK-AA-2025-001844',
    tripId: 'trp-02',
    routeId: 'rt-add-haw',
    vehicleId: 'veh-02',
    vehiclePlateNumber: '3-55910 AA',
    vehicleModel: 'Toyota Coaster Deluxe',
    seatNumber: 5,
    passengerName: 'Mekonnen Kebede',
    passengerPhone: '0931 99 88 77',
    passengerGender: 'male',
    fareAmount: 420,
    serviceFee: 20,
    totalAmount: 440,
    agentId: 'usr-agent-2',
    agentCode: 'AGT-105',
    agentName: 'Selamawit Kebede',
    agentNameAm: 'ሰላማዊት ከበደ',
    issueDate: new Date().toISOString().split('T')[0],
    issueTime: '06:10:05',
    departureDate: new Date().toISOString().split('T')[0],
    departureTime: '07:15',
    originCityEn: 'Addis Ababa',
    originCityAm: 'አዲስ አበባ',
    destinationCityEn: 'Hawassa',
    destinationCityAm: 'ሀዋሳ',
    gateNumber: 'Gate 04 (በር 4)',
    paymentMethod: 'cbe',
    status: 'active',
  },
  {
    id: 'tkt-004',
    ticketNumber: 'TK-AA-2025-001845',
    tripId: 'trp-02',
    routeId: 'rt-add-haw',
    vehicleId: 'veh-02',
    vehiclePlateNumber: '3-55910 AA',
    vehicleModel: 'Toyota Coaster Deluxe',
    seatNumber: 6,
    passengerName: 'Tigist Worku',
    passengerPhone: '0911 88 77 66',
    passengerGender: 'female',
    fareAmount: 420,
    serviceFee: 20,
    totalAmount: 440,
    agentId: 'usr-mgr-1',
    agentCode: 'MGR-012',
    agentName: 'Tigist Alemayehu',
    agentNameAm: 'ትዕግስት አለማየሁ',
    issueDate: new Date().toISOString().split('T')[0],
    issueTime: '06:15:22',
    departureDate: new Date().toISOString().split('T')[0],
    departureTime: '07:15',
    originCityEn: 'Addis Ababa',
    originCityAm: 'አዲስ አበባ',
    destinationCityEn: 'Hawassa',
    destinationCityAm: 'ሀዋሳ',
    gateNumber: 'Gate 04 (በር 4)',
    paymentMethod: 'abyssinia',
    status: 'active',
  }
];
