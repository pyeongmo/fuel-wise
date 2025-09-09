'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { useFuelData } from '@/lib/hooks/use-fuel-data';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { DayContent, DayContentProps } from 'react-day-picker';
import { format, parseISO } from 'date-fns';
import { Droplets, GaugeCircle } from 'lucide-react';

export default function FuelCalendar() {
  const { fuelRecords } = useFuelData();
  const fueledDays = fuelRecords.map(record => parseISO(record.date));

  function FuelDay(props: DayContentProps) {
    const formattedDate = format(props.date, 'yyyy-MM-dd');
    const fuelRecordForDay = fuelRecords.find(record => format(parseISO(record.date), 'yyyy-MM-dd') === formattedDate);

    if (fuelRecordForDay) {
      return (
        <Popover>
          <PopoverTrigger asChild>
            <div className="relative w-full h-full flex items-center justify-center">
              <DayContent {...props} />
            </div>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-2" onPointerDownOutside={(e) => e.preventDefault()}>
            <div className="flex flex-col space-y-2 text-sm">
              <div className="font-bold">{format(parseISO(fuelRecordForDay.date), 'yyyy-MM-dd')}</div>
              <div className="flex items-center gap-2">
                <Droplets className="h-4 w-4 text-muted-foreground" />
                <span>{fuelRecordForDay.liters.toFixed(1)} L</span>
              </div>
              <div className="flex items-center gap-2">
                 <span className="font-mono text-lg">₩</span>
                <span>{fuelRecordForDay.price.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <GaugeCircle className="h-4 w-4 text-muted-foreground" />
                <span>{fuelRecordForDay.mileage.toLocaleString()} km</span>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      );
    }
    return <DayContent {...props} />;
  }


  return (
    <Card>
      <CardHeader>
        <CardTitle>주유 기록</CardTitle>
      </CardHeader>
      <CardContent className="flex justify-center">
        <Calendar
          modifiers={{ fueled: fueledDays }}
          modifiersClassNames={{
            fueled: 'fueled-day',
          }}
          components={{
            DayContent: FuelDay
          }}
        />
      </CardContent>
    </Card>
  );
}
