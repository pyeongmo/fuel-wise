export interface FuelRecord {
  id: string;
  date: string; // ISO 8601 format
  liters: number;
  price: number;
  currency: string;
  mileage: number; // Total mileage at the time of refueling
}

export interface EfficiencyRecord {
  date: string; // ISO 8601 format
  efficiency: number; // km/L
}
