'use client';

import { useFuelData } from '@/lib/hooks/use-fuel-data';
import StatsCards from './stats-cards';
import { FuelFormDialog } from './fuel-form-dialog';
import FuelCalendar from './fuel-calendar';
import { Button } from '../ui/button';
import { PlusCircle } from 'lucide-react';

export default function Dashboard() {
  const { stats } = useFuelData();

  return (
    <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-3">
      <div className="grid auto-rows-max items-start gap-8 lg:col-span-2">
        <StatsCards stats={stats} />
        <FuelCalendar />
      </div>
      <div className="grid auto-rows-max items-start gap-8">
        <FuelFormDialog>
          <Button className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
            <PlusCircle className="mr-2" />
            새 주유 기록 추가
          </Button>
        </FuelFormDialog>
      </div>
    </div>
  );
}
