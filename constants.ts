
export const COLORS = {
  primary: '#FBC02D',
  action: '#D32F2F',
  white: '#FFFFFF',
  text: '#111827',
  success: '#10B981',
  warning: '#F59E0B'
};

export const TEA_TYPES = [
  { id: 'masala', name: 'Masala Tea', price: 15 },
  { id: 'ginger', name: 'Ginger Tea', price: 15 },
  { id: 'cardamom', name: 'Cardamom Tea', price: 20 },
  { id: 'black', name: 'Black Tea', price: 10 },
  { id: 'lemon', name: 'Lemon Tea', price: 12 }
];

export const SNACK_TYPES = [
  { id: 'samosa', name: 'Samosa (2pc)', price: 30 },
  { id: 'biscuits', name: 'Butter Biscuits', price: 10 },
  { id: 'vada', name: 'Medhu Vada', price: 15 }
];

export const INITIAL_VEHICLES = [
  {
    id: 'v1',
    name: 'Thambi 01 - Ravi',
    driverName: 'Ravi',
    location: { lat: 13.0827, lng: 80.2707 },
    status: 'available',
    stock: { tea: 85, milk: 75, sugar: 90, cups: 95, fuel: 80, snacks: 40 },
    rating: 4.9,
    health: 'perfect'
  },
  {
    id: 'v2',
    name: 'Thambi 02 - Dinesh',
    driverName: 'Dinesh',
    location: { lat: 13.0850, lng: 80.2600 },
    status: 'available',
    stock: { tea: 45, milk: 40, sugar: 60, cups: 50, fuel: 70, snacks: 20 },
    rating: 4.7,
    health: 'perfect'
  },
  {
    id: 'v3',
    name: 'Thambi 03 - Kumar',
    driverName: 'Kumar',
    location: { lat: 13.0780, lng: 80.2800 },
    status: 'busy',
    stock: { tea: 15, milk: 10, sugar: 25, cups: 10, fuel: 50, snacks: 5 },
    rating: 4.4,
    health: 'perfect'
  }
];

export const SHIFT_SLOTS = [
  '5:00 AM - 12:00 PM',
  '12:00 PM - 7:00 PM',
  '7:00 PM - 2:00 AM'
];
