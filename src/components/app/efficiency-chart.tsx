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

export default function EfficiencyChart() {
  const { efficiencyTrend } = useFuelData();

  if (efficiencyTrend.length < 2) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>연비 추이</CardTitle>
                <CardDescription>주유 기록이 2개 이상 필요합니다.</CardDescription>
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
        <CardTitle>연비 추이 (km/L)</CardTitle>
        <CardDescription>
          최근 주유 기록을 바탕으로 연비 변화를 보여줍니다.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={{}} className="h-96 w-full">
            <ResponsiveContainer>
              <LineChart
                data={efficiencyTrend}
                margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(dateStr) => format(parseISO(dateStr), 'MMM')}
                  stroke="hsl(var(--muted-foreground))"
                  />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  domain={['dataMin - 1', 'dataMax + 1']}
                  tickFormatter={(value) => value.toFixed(1)}
                  />
                <ChartTooltip
                  cursor={false}
                  content={
                    <ChartTooltipContent
                      formatter={(value, name, item) => (
                        <div className="flex flex-col">
                            <span>{format(parseISO(item.payload.date), 'yyyy-MM-dd')}</span>
                            <span>연비: {Number(value).toFixed(1)} km/L</span>
                        </div>
                      )}
                      />
                  }
                  />
                <Line
                  type="monotone"
                  dataKey="efficiency"
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
                  />
              </LineChart>
            </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
