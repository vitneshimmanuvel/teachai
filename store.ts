
import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppRole, User, Vehicle, Order, StockAlert, AttendanceLog, RefillRequest, ShiftBooking, HealthReport, Notification, Message } from './types';
import { INITIAL_VEHICLES } from './constants';

interface AppContextType {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  vehicles: Vehicle[];
  orders: Order[];
  stockAlerts: StockAlert[];
  attendanceLogs: AttendanceLog[];
  refillRequests: RefillRequest[];
  shiftBookings: ShiftBooking[];
  healthReports: HealthReport[];
  notifications: Notification[];
  messages: Message[];
  updateVehicleStatus: (id: string, status: Vehicle['status']) => void;
  updateVehicleStock: (id: string, item: keyof Vehicle['stock'], value: number) => void;
  placeOrder: (order: Order) => void;
  updateOrderStatus: (id: string, status: Order['status'], paymentStatus?: Order['paymentStatus']) => void;
  clockIn: (driverId: string, driverName: string, vehicleId: string, shift: string, duration?: number) => void;
  clockOut: (driverId: string) => void;
  requestRefill: (vehicleId: string, items: string[], type?: 'stock' | 'fuel') => void;
  completeRefill: (requestId: string) => void;
  bookShift: (booking: ShiftBooking) => void;
  updateShiftStatus: (id: string, status: ShiftBooking['status']) => void;
  submitHealthReport: (report: HealthReport) => void;
  processManualSale: (vehicleId: string, items: { type: string; quantity: number; price: number }[]) => void;
  sendNotification: (userId: string, title: string, message: string, type: Notification['type']) => void;
  markNotificationRead: (id: string) => void;
  sendMessage: (receiverId: string, text: string) => void;
  addInboundStock: (vehicleId: string, item: keyof Vehicle['stock'], amount: number) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>(INITIAL_VEHICLES.map(v => ({...v, lastMaintained: '2025-05-15'})) as Vehicle[]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [stockAlerts, setStockAlerts] = useState<StockAlert[]>([]);
  const [attendanceLogs, setAttendanceLogs] = useState<AttendanceLog[]>([
    { id: 'h1', driverId: 'ravi_id', driverName: 'Ravi', vehicleId: 'v1', clockIn: Date.now() - 86400000, clockOut: Date.now() - 80000000, shift: 'Morning', durationMinutes: 420 },
    { id: 'h2', driverId: 'ravi_id', driverName: 'Ravi', vehicleId: 'v1', clockIn: Date.now() - 172800000, clockOut: Date.now() - 160000000, shift: 'Morning', durationMinutes: 420 }
  ]);
  const [refillRequests, setRefillRequests] = useState<RefillRequest[]>([]);
  const [shiftBookings, setShiftBookings] = useState<ShiftBooking[]>([]);
  const [healthReports, setHealthReports] = useState<HealthReport[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([
    { id: 'n1', userId: 'all', title: 'System Update', message: 'New inventory tracking live!', type: 'info', timestamp: Date.now() - 100000, read: false },
    { id: 'n2', userId: 'driver_id', title: 'Great Sales!', message: 'You reached 80% of your target today. Keep going!', type: 'success', timestamp: Date.now() - 50000, read: false }
  ]);
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setVehicles(prev => prev.map(v => ({
        ...v,
        location: {
          lat: v.location.lat + (Math.random() - 0.5) * 0.0005,
          lng: v.location.lng + (Math.random() - 0.5) * 0.0005
        },
        stock: {
          ...v.stock,
          fuel: Math.max(0, v.stock.fuel - (v.status === 'available' ? 0.05 : 0.01))
        }
      })));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const addInboundStock = (vehicleId: string, item: keyof Vehicle['stock'], amount: number) => {
    setVehicles(prev => prev.map(v => v.id === vehicleId ? {
      ...v,
      stock: { ...v.stock, [item]: Math.min(100, v.stock[item] + amount) }
    } : v));
  };

  const sendMessage = (receiverId: string, text: string) => {
    if (!currentUser) return;
    const msg: Message = {
      id: Math.random().toString(36).substr(2, 9),
      senderId: currentUser.id,
      receiverId,
      text,
      timestamp: Date.now()
    };
    setMessages(prev => [...prev, msg]);
  };

  const sendNotification = (userId: string, title: string, message: string, type: Notification['type']) => {
    const n: Notification = {
      id: Math.random().toString(36).substr(2, 9),
      userId,
      title,
      message,
      type,
      timestamp: Date.now(),
      read: false
    };
    setNotifications(prev => [n, ...prev]);
  };

  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const deductStock = (vehicleId: string, items: { type: string; quantity: number }[]) => {
    setVehicles(vList => vList.map(v => {
      if (v.id === vehicleId) {
        let teaReduction = 0;
        let milkReduction = 0;
        let sugarReduction = 0;
        let cupReduction = 0;
        let snackReduction = 0;

        items.forEach(item => {
          if (item.type.toLowerCase().includes('tea')) {
            teaReduction += item.quantity * 0.5;
            milkReduction += item.quantity * 0.8;
            sugarReduction += item.quantity * 0.2;
            cupReduction += item.quantity * 1.5;
          } else {
            snackReduction += item.quantity * 2;
          }
        });

        const newStock = {
          ...v.stock,
          tea: Math.max(0, v.stock.tea - teaReduction),
          milk: Math.max(0, v.stock.milk - milkReduction),
          sugar: Math.max(0, v.stock.sugar - sugarReduction),
          cups: Math.max(0, v.stock.cups - cupReduction),
          snacks: Math.max(0, v.stock.snacks - snackReduction)
        };

        Object.entries(newStock).forEach(([item, val]) => {
          if ((val as any) < 20 && v.stock[item as keyof typeof v.stock] >= 20) {
            sendNotification('admin', 'Low Stock Alert', `${item} is below 20% on truck ${v.id}`, 'warning');
          }
        });

        return { ...v, stock: newStock };
      }
      return v;
    }));
  };

  const processManualSale = (vehicleId: string, items: { type: string; quantity: number; price: number }[]) => {
    const totalPrice = items.reduce((acc, i) => acc + (i.price * i.quantity), 0);
    const manualOrder: Order = {
      id: 'MS-' + Math.random().toString(36).substr(2, 6).toUpperCase(),
      customerId: 'WALK-IN',
      customerName: 'Street Customer',
      vehicleId,
      items,
      totalPrice,
      status: 'delivered',
      paymentStatus: 'paid',
      timestamp: Date.now(),
      location: { lat: 0, lng: 0 }
    };
    setOrders(prev => [manualOrder, ...prev]);
    deductStock(vehicleId, items);
  };

  const clockIn = (driverId: string, driverName: string, vehicleId: string, shift: string, duration: number = 180) => {
    const newLog: AttendanceLog = {
      id: Math.random().toString(36).substr(2, 9),
      driverId,
      driverName,
      vehicleId,
      clockIn: Date.now(),
      shift,
      durationMinutes: duration
    };
    setAttendanceLogs(prev => [newLog, ...prev]);
    setVehicles(prev => prev.map(v => v.id === vehicleId ? { ...v, status: 'available' } : v));
    sendNotification('admin', 'Shift Started', `${driverName} clocked in for ${shift}`, 'info');
  };

  const clockOut = (driverId: string) => {
    const activeLog = attendanceLogs.find(l => l.driverId === driverId && !l.clockOut);
    if (!activeLog) return;

    setAttendanceLogs(prev => prev.map(log => 
      log.id === activeLog.id ? { ...log, clockOut: Date.now() } : log
    ));
    setVehicles(prev => prev.map(v => v.id === activeLog.vehicleId ? { ...v, status: 'offline' } : v));
    sendNotification('admin', 'Shift Ended', `${activeLog.driverName} clocked out`, 'info');
  };

  const bookShift = (booking: ShiftBooking) => {
    setShiftBookings(prev => [booking, ...prev]);
    sendNotification('admin', 'New Slot Booking', `Driver ${booking.driverId} requested ${booking.slot}`, 'info');
  };

  const updateShiftStatus = (id: string, status: ShiftBooking['status']) => {
    setShiftBookings(prev => prev.map(b => {
      if (b.id === id) {
        sendNotification(b.driverId, 'Shift Updated', `Your booking has been ${status}`, status === 'approved' ? 'success' : 'error');
        return { ...b, status };
      }
      return b;
    }));
  };

  const requestRefill = (vehicleId: string, items: string[], type: 'stock' | 'fuel' = 'stock') => {
    const newReq: RefillRequest = {
      id: 'REF-' + Math.random().toString(36).substr(2, 5).toUpperCase(),
      vehicleId,
      items,
      type,
      timestamp: Date.now(),
      status: 'pending'
    };
    setRefillRequests(prev => [newReq, ...prev]);
    sendNotification('admin', 'Refill Needed', `Truck ${vehicleId} requested ${type} refill`, 'warning');
  };

  const completeRefill = (requestId: string) => {
    const req = refillRequests.find(r => r.id === requestId);
    if (!req) return;
    setRefillRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: 'completed' } : r));
    setVehicles(prev => prev.map(v => v.id === req.vehicleId ? {
      ...v,
      stock: req.type === 'fuel' ? { ...v.stock, fuel: 100 } : { ...v.stock, tea: 100, milk: 100, sugar: 100, cups: 100, snacks: 50 }
    } : v));
  };

  const submitHealthReport = (report: HealthReport) => {
    setHealthReports(prev => [report, ...prev]);
    setVehicles(prev => prev.map(v => v.id === report.vehicleId ? { ...v, health: report.status } : v));
    if (report.status === 'critical') {
      sendNotification('admin', 'Critical Health', `Truck ${report.vehicleId} critical failure`, 'error');
    }
  };

  const updateVehicleStatus = (id: string, status: Vehicle['status']) => {
    setVehicles(prev => prev.map(v => v.id === id ? { ...v, status } : v));
  };

  const updateVehicleStock = (id: string, item: keyof Vehicle['stock'], value: number) => {
    setVehicles(prev => prev.map(v => v.id === id ? { ...v, stock: { ...v.stock, [item]: value } } : v));
  };

  const placeOrder = (order: Order) => {
    setOrders(prev => [order, ...prev]);
  };

  const updateOrderStatus = (id: string, status: Order['status'], paymentStatus?: Order['paymentStatus']) => {
    setOrders(prev => {
      const updatedOrders = prev.map(o => o.id === id ? { ...o, status, paymentStatus: paymentStatus || o.paymentStatus } : o);
      if (status === 'delivered') {
        const order = prev.find(o => o.id === id);
        if (order) deductStock(order.vehicleId, order.items);
      }
      return updatedOrders;
    });
  };

  return React.createElement(AppContext.Provider, {
    value: {
      currentUser, setCurrentUser, vehicles, orders, stockAlerts, attendanceLogs, refillRequests, shiftBookings, healthReports, notifications, messages,
      updateVehicleStatus, updateVehicleStock, placeOrder, updateOrderStatus, clockIn, clockOut, requestRefill, completeRefill, bookShift, updateShiftStatus, submitHealthReport, processManualSale, sendNotification, markNotificationRead, sendMessage, addInboundStock
    }
  }, children);
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
