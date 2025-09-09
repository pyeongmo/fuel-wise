'use client';

import { useFuelData } from '@/lib/hooks/use-fuel-data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import StatsCards from './stats-cards';
import FuelForm from './fuel-form';
import MonthlyUsageChart from './monthly-usage-chart';
import LogTable from './log-table';

export default function Dashboard() {
  const { stats, monthlyUsage, logEntries, addFuelAndMileageEntry } = useFuelData();

  return (
    <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-3">
      <div className="grid auto-rows-max items-start gap-8 lg:col-span-2">
        <StatsCards stats={stats} />
        <div className="grid gap-8 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>월별 주유량</CardTitle>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <MonthlyUsageChart data={monthlyUsage} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>최근 활동</CardTitle>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <LogTable entries={logEntries} />
              </CardContent>
            </Card>
        </div>
      </div>
      <div className="grid auto-rows-max items-start gap-8">
        <FuelForm addFuelAndMileageEntry={addFuelAndMileageEntry} />
      </div>
    </div>
  );
}
