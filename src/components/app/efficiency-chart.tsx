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
import { Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Scatter, TooltipProps, ComposedChart } from 'recharts';
import { format, parseISO } from 'date-fns';
import { ko } from 'date-fns/locale';
import { useState } from 'react';

export default function EfficiencyChart() {
  const { efficiencyTrend } = useFuelData();
  const [lastMonth, setLastMonth] = useState('');

  const CustomTooltip = ({ active, payload }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const dataDate = parseISO(data.date);

      if (payload[0].dataKey === 'efficiency') { // Monthly average line
        return (
            <div className="bg-popover text-popover-foreground border border-border/50 shadow-lg rounded-lg p-2 text-sm">
                <p className="font-bold">{`${format(dataDate, 'yyyy년 M월')} 평균`}</p>
                <p style={{color: 'hsl(var(--chart-2))'}}>{`연비: ${payload[0].value?.toFixed(1)} km/L`}</p>
            </div>
        );
      }
      
      if (payload[0].dataKey === 'individualEfficiency') { // Individual scatter dot
        return (
          <div className="bg-popover text-popover-foreground border border-border/50 shadow-lg rounded-lg p-2 text-sm">
            <p className="font-bold">{format(dataDate, 'yyyy-MM-dd')}</p>
            <p style={{color: 'hsl(var(--muted-foreground))'}}>{`연비: ${payload[0].value?.toFixed(1)} km/L`}</p>
          </div>
        );
      }
    }
  
    return null;
  };

  if (!efficiencyTrend || efficiencyTrend.monthly.length < 1) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>연비 추이</CardTitle>
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
        <CardTitle>연비 추이 (km/L)</CardTitle>
        <CardDescription>
          월평균 연비(선)와 개별 주유 기록(점)을 함께 보여줍니다.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={{}} className="h-96 w-full">
            <ResponsiveContainer>
              <ComposedChart
                data={efficiencyTrend.combined}
                margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                onMouseMove={() => setLastMonth('')}
                onMouseLeave={() => setLastMonth('')}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(dateStr, index) => {
                    const month = format(parseISO(dateStr), 'M월');
                    if (lastMonth !== month) {
                      setLastMonth(month);
                      return month;
                    }
                    return '';
                  }}
                  stroke="hsl(var(--muted-foreground))"
                  />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  domain={['dataMin - 1', 'dataMax + 1']}
                  tickFormatter={(value) => value.toFixed(1)}
                  />
                <ChartTooltip
                  cursor={false}
                  content={<CustomTooltip />}
                  />
                <Line
                  type="monotone"
                  dataKey="efficiency"
                  stroke="hsl(var(--chart-2))"
                  strokeWidth={2}
                  dot={{
                    r: 0,
                  }}
                  activeDot={{
                      r: 6,
                      fill: 'hsl(var(--chart-2))',
                  }}
                  name="월평균 연비"
                  connectNulls
                  />
                <Scatter
                    dataKey="individualEfficiency"
                    fill="hsl(var(--muted-foreground))"
                    opacity={0.6}
                    shape="circle"
                    name="개별 기록"
                />
              </ComposedChart>
            </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
