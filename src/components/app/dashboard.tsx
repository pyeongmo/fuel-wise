'use client';

import { useFuelData } from '@/lib/hooks/use-fuel-data';
import StatsCards from './stats-cards';
import FuelCalendar from './fuel-calendar';

export default function Dashboard() {
  const { stats } = useFuelData();

  return (
    <div className="grid gap-8">
      <div className="grid auto-rows-max items-start gap-8">
        <StatsCards stats={stats} />
        <FuelCalendar />
      </div>
    </div>
  );
}
