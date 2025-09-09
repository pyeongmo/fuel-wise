'use client';

import { useFuelData } from '@/lib/hooks/use-fuel-data';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { Line, LineChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { format, parseISO } from 'date-fns';
import { ko } from 'date-fns/locale';

export default function UsageChart() {
  const { distanceTrend, fuelTrend } = useFuelData();

  if (distanceTrend.length < 1 || fuelTrend.length < 1) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>사용량 추이</CardTitle>
                <CardDescription>주유 기록이 2개 이상 필요합니다.</CardDescription>
            </CardHeader>
            <CardContent className="flex h-96 items-center justify-center">
                <p className="text-muted-foreground">차트를 표시하기에 데이터가 부족합니다.</p>
            </CardContent>
        </Card>
    )
  }

  return (
    <div className="grid gap-8">
    <Card>
      <CardHeader>
        <CardTitle>월별 주행 거리 (km)</CardTitle>
        <CardDescription>
          최근 주유 기록을 바탕으로 월별 주행 거리를 보여줍니다.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={{}} className="h-96 w-full">
            <ResponsiveContainer>
              <LineChart
                data={distanceTrend}
                margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(dateStr) => format(parseISO(dateStr), 'M월', { locale: ko })}
                  stroke="hsl(var(--muted-foreground))"
                  />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  domain={['dataMin - 100', 'dataMax + 100']}
                  tickFormatter={(value) => value.toLocaleString()}
                  />
                <ChartTooltip
                  cursor={false}
                  content={
                    <ChartTooltipContent
                      formatter={(value, name, item) => (
                        <div className="flex flex-col">
                            <span>{format(parseISO(item.payload.date), 'yyyy-MM')}</span>
                            <span>주행거리: {Number(value).toLocaleString()} km</span>
                        </div>
                      )}
                      />
                  }
                  />
                <Line
                  type="monotone"
                  dataKey="distance"
                  stroke="hsl(var(--chart-1))"
                  strokeWidth={2}
                  dot={{
                    fill: 'hsl(var(--chart-1))',
                    r: 4,
                  }}
                  activeDot={{
                      r: 6,
                      fill: 'hsl(var(--chart-1))',
                  }}
                  />
              </LineChart>
            </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
    <Card>
      <CardHeader>
        <CardTitle>월별 주유량 (L)</CardTitle>
        <CardDescription>
          최근 주유 기록을 바탕으로 월별 주유량을 보여줍니다.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={{}} className="h-96 w-full">
            <ResponsiveContainer>
              <LineChart
                data={fuelTrend}
                margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(dateStr) => format(parseISO(dateStr), 'M월', { locale: ko })}
                  stroke="hsl(var(--muted-foreground))"
                  />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  domain={['dataMin - 10', 'dataMax + 10']}
                  tickFormatter={(value) => value.toFixed(0)}
                  />
                <ChartTooltip
                  cursor={false}
                  content={
                    <ChartTooltipContent
                      formatter={(value, name, item) => (
                        <div className="flex flex-col">
                            <span>{format(parseISO(item.payload.date), 'yyyy-MM')}</span>
                            <span>주유량: {Number(value).toFixed(1)} L</span>
                        </div>
                      )}
                      />
                  }
                  />
                <Line
                  type="monotone"
                  dataKey="fuel"
                  stroke="hsl(var(--chart-4))"
                  strokeWidth={2}
                  dot={{
                    fill: 'hsl(var(--chart-4))',
                    r: 4,
                  }}
                  activeDot={{
                      r: 6,
                      fill: 'hsl(var(--chart-4))',
                  }}
                  />
              </LineChart>
            </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
    </div>
  );
}
