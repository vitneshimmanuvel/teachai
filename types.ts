
export enum AppRole {
  CUSTOMER = 'CUSTOMER',
  DRIVER = 'DRIVER',
  ADMIN = 'ADMIN'
}

export interface User {
  id: string;
  name: string;
  phone: string;
  role: AppRole;
  location?: { lat: number; lng: number };
  goldPoints?: number;
  bonusCredits?: number;
  salesTarget?: number;
}

export interface Vehicle {
  id: string;
  name: string;
  driverName: string;
  location: { lat: number; lng: number };
  status: 'available' | 'busy' | 'offline';
  stock: {
    tea: number;
    milk: number;
    sugar: number;
    cups: number;
    fuel: number;
    snacks: number;
  };
  health: 'perfect' | 'needs-service' | 'critical';
  lastMaintained: string;
  rating: number;
}

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  vehicleId: string;
  items: { type: string; quantity: number; price: number }[];
  totalPrice: number;
  status: 'pending' | 'accepted' | 'preparing' | 'on-the-way' | 'delivered' | 'cancelled';
  paymentStatus: 'unpaid' | 'paid';
  timestamp: number;
  location: { lat: number; lng: number };
}

export interface AttendanceLog {
  id: string;
  driverId: string;
  driverName: string;
  vehicleId: string;
  clockIn: number;
  clockOut?: number;
  shift: string;
  durationMinutes: number; // Planned duration
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  text: string;
  timestamp: number;
}

export interface ShiftBooking {
  id: string;
  driverId: string;
  vehicleId: string;
  date: string;
  slot: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  timestamp: number;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: number;
  read: boolean;
}

export interface RefillRequest {
  id: string;
  vehicleId: string;
  items: string[];
  type: 'stock' | 'fuel';
  timestamp: number;
  status: 'pending' | 'completed';
}

export interface HealthReport {
  id: string;
  vehicleId: string;
  driverId: string;
  status: 'perfect' | 'needs-service' | 'critical';
  notes: string;
  timestamp: number;
}

export interface StockAlert {
  id: string;
  vehicleId: string;
  item: string;
  level: number;
  timestamp: number;
}
