'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { useFuelData } from '@/lib/hooks/use-fuel-data';
import { parseISO } from 'date-fns';

export default function FuelCalendar() {
  const { fuelRecords } = useFuelData();

  // The date from Firestore is an ISO string, but might not be a full Date object yet.
  // parseISO ensures it's a valid Date object for the calendar.
  const fueledDays = fuelRecords.map(record => parseISO(record.date));

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
          className="w-full"
        />
      </CardContent>
    </Card>
  );
}
