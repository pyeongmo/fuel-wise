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
  ChartLegend,
  ChartLegendContent
} from '@/components/ui/chart';
import { Line, LineChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { format, parseISO } from 'date-fns';

export default function UsageChart() {
  const { usageTrend } = useFuelData();
  let lastMonth = '';

  if (!usageTrend || usageTrend.length < 1) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>사용량 추이</CardTitle>
                <CardDescription>주유 기록이 충분하지 않습니다.</CardDescription>
            </CardHeader>
            <CardContent className="flex h-96 items-center justify-center">
                <p className="text-muted-foreground">차트를 표시하기에 데이터가 부족합니다.</p>
            </CardContent>
        </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>월별 사용량 추이</CardTitle>
        <CardDescription>
          최근 주유 기록을 바탕으로 월별 주행 거리와 주유량을 보여줍니다.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            distance: {
              label: '주행 거리 (km)',
              color: 'hsl(var(--chart-1))',
            },
            fuel: {
              label: '주유량 (L)',
              color: 'hsl(var(--chart-2))',
            },
          }}
          className="h-96 w-full"
        >
          <ResponsiveContainer>
            <LineChart
              data={usageTrend}
              margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="date"
                tickFormatter={(dateStr) => {
                  const month = format(parseISO(dateStr), 'M월');
                  if (lastMonth !== month) {
                    lastMonth = month;
                    return month;
                  }
                  return '';
                }}
                stroke="hsl(var(--muted-foreground))"
              />
              <YAxis
                yAxisId="left"
                stroke="hsl(var(--chart-1))"
                tickFormatter={(value) => value.toLocaleString()}
                name="주행 거리"
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                stroke="hsl(var(--chart-2))"
                tickFormatter={(value) => value.toFixed(0)}
                name="주유량"
              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    formatter={(value, name, item) => (
                      <div className="flex flex-col">
                        <span>{format(parseISO(item.payload.date), 'yyyy-MM')}</span>
                        <div className="flex items-center" style={{ color: 'hsl(var(--chart-1))' }}>
                          <span>주행거리: {item.payload.distance.toLocaleString()} km</span>
                        </div>
                        <div className="flex items-center" style={{ color: 'hsl(var(--chart-2))' }}>
                          <span>주유량: {item.payload.fuel.toFixed(1)} L</span>
                        </div>
                      </div>
                    )}
                  />
                }
              />
              <ChartLegend content={<ChartLegendContent />} />
              <Line
                yAxisId="left"
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
                name="주행 거리 (km)"
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="fuel"
                stroke="hsl(var(--chart-2))"
                strokeWidth={2}
                dot={{
                  fill: 'hsl(var(--chart-2))',
                  r: 4,
                }}
                activeDot={{
                  r: 6,
                  fill: 'hsl(var(--chart-2))',
                }}
                name="주유량 (L)"
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
