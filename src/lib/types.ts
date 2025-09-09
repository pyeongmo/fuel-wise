export interface FuelEntry {
  id: string;
  type: 'fuel';
  date: string;
  liters: number;
  price: number;
  currency: string;
}

export interface MileageEntry {
  id: string;
  type: 'mileage';
  date: string;
  mileage: number;
}

export type LogEntry = FuelEntry | MileageEntry;
