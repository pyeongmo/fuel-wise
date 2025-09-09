import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Droplets, GaugeCircle, Route } from 'lucide-react';

interface StatsCardsProps {
  stats: {
    totalDistance: number;
    averageEfficiency: number;
    totalFuelThisMonth: number;
  };
}

export default function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">총 주행 거리</CardTitle>
          <Route className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalDistance.toLocaleString()} km</div>
          <p className="text-xs text-muted-foreground">전체 기간 누적</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">평균 연비</CardTitle>
          <GaugeCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.averageEfficiency.toFixed(1)} km/L</div>
          <p className="text-xs text-muted-foreground">전체 기간 평균</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">이달의 주유량</CardTitle>
          <Droplets className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalFuelThisMonth.toFixed(1)} L</div>
          <p className="text-xs text-muted-foreground">이번 달 총 주유량</p>
        </CardContent>
      </Card>
    </div>
  );
}
