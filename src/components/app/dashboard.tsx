'use client';

import { useFuelData } from '@/lib/hooks/use-fuel-data';
import StatsCards from './stats-cards';
import FuelForm from './fuel-form';

export default function Dashboard() {
  const { stats } = useFuelData();

  return (
    <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-3">
      <div className="grid auto-rows-max items-start gap-8 lg:col-span-2">
        <StatsCards stats={stats} />
      </div>
      <div className="grid auto-rows-max items-start gap-8">
        <FuelForm />
      </div>
    </div>
  );
}
