import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Droplets, GaugeCircle, Route } from 'lucide-react';

interface StatsCardsProps {
  stats: {
    averageMonthlyDistance: number;
    averageEfficiency: number;
    averageMonthlyFuel: number;
  };
}

export default function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">월평균 주행</CardTitle>
          <Route className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.averageMonthlyDistance.toLocaleString(undefined, { maximumFractionDigits: 0 })} km</div>
          <p className="text-xs text-muted-foreground">최근 3개월 기준</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">평균 연비</CardTitle>
          <GaugeCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.averageEfficiency.toFixed(1)} km/L</div>
          <p className="text-xs text-muted-foreground">최근 3개월 기준</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">월평균 주유량</CardTitle>
          <Droplets className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.averageMonthlyFuel.toFixed(1)} L</div>
          <p className="text-xs text-muted-foreground">최근 3개월 기준</p>
        </CardContent>
      </Card>
    </div>
  );
}
