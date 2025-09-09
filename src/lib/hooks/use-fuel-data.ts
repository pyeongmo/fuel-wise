'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import type { FuelRecord } from '@/lib/types';
import { format, subDays, isWithinInterval, parseISO, startOfMonth } from 'date-fns';
import { useAuth } from '@/hooks/use-auth';
import { db } from '@/lib/firebase';
import { collection, addDoc, onSnapshot, query, orderBy, doc, updateDoc, deleteDoc } from 'firebase/firestore';

export function useFuelData() {
  const { user, loading } = useAuth();
  const [fuelRecords, setFuelRecords] = useState<FuelRecord[]>([]);
  
  const entriesCollectionName = useMemo(() => user ? `users/${user.uid}/fuelRecords` : null, [user]);

  useEffect(() => {
    if (loading || !entriesCollectionName) {
      setFuelRecords([]);
      return;
    };

    const q = query(collection(db, entriesCollectionName), orderBy('date', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const records = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as FuelRecord));
      setFuelRecords(records);
    },
    (error) => {
      console.error("Snapshot listener error:", error);
    });

    return () => unsubscribe();
  }, [entriesCollectionName, loading]);

  const addFuelRecord = useCallback(async (
    fuelData: Omit<FuelRecord, 'id'>
  ) => {
    if (!entriesCollectionName) return;
    await addDoc(collection(db, entriesCollectionName), fuelData);
  }, [entriesCollectionName]);

  const updateFuelRecord = useCallback(async (
    id: string,
    fuelData: Partial<Omit<FuelRecord, 'id'>>
  ) => {
    if (!entriesCollectionName) return;
    const recordDoc = doc(db, entriesCollectionName, id);
    await updateDoc(recordDoc, fuelData);
  }, [entriesCollectionName]);

  const deleteFuelRecord = useCallback(async (
    id: string
  ) => {
    if (!entriesCollectionName) return;
    const recordDoc = doc(db, entriesCollectionName, id);
    await deleteDoc(recordDoc);
  }, [entriesCollectionName]);

  const sortedRecords = useMemo(() => {
    return [...fuelRecords].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [fuelRecords]);

  const stats = useMemo(() => {
    const today = new Date();
    const last3MonthsDate = subDays(today, 90);

    const last3MonthsRecords = sortedRecords.filter(record => 
        isWithinInterval(new Date(record.date), { start: last3MonthsDate, end: today })
    );

    let totalDistance = 0;
    if (sortedRecords.length > 0 && last3MonthsRecords.length > 0) {
        const recordBeforePeriod = sortedRecords.slice().reverse().find(
            record => new Date(record.date) < last3MonthsDate
        );
        
        const startMileageRecord = recordBeforePeriod || (last3MonthsRecords.length > 1 ? last3MonthsRecords[0] : null);
        const endMileageRecord = last3MonthsRecords[last3MonthsRecords.length - 1];
        
        if (startMileageRecord && endMileageRecord.mileage > startMileageRecord.mileage) {
            totalDistance = endMileageRecord.mileage - startMileageRecord.mileage;
        }
    }
    
    // Total fuel for the last 3 months, excluding the most recent fill-up for efficiency calculation
    const fuelForDistance = last3MonthsRecords
      .slice(0, last3MonthsRecords.length > 1 ? -1 : 1)
      .reduce((sum, record) => sum + record.liters, 0);

    const totalFuel = last3MonthsRecords.reduce((sum, record) => sum + record.liters, 0);
    
    let averageEfficiency = 0;
    if (totalDistance > 0 && fuelForDistance > 0) {
        averageEfficiency = totalDistance / fuelForDistance;
    }
    
    // Calculate 1-month average based on 3 months of data
    const monthlyDistance = totalDistance / 3;
    const monthlyFuel = totalFuel / 3;
    
    return {
        averageMonthlyDistance: monthlyDistance,
        averageEfficiency: averageEfficiency,
        averageMonthlyFuel: monthlyFuel,
    };
}, [sortedRecords]);


  const efficiencyTrend = useMemo(() => {
    if (sortedRecords.length < 2) return { individual: [], monthly: [] };

    const individualEfficiencies: { date: string; individualEfficiency: number }[] = [];
    for (let i = 1; i < sortedRecords.length; i++) {
      const current = sortedRecords[i];
      const previous = sortedRecords[i - 1];

      const distance = current.mileage - previous.mileage;
      if (distance > 0 && previous.liters > 0) {
        const efficiency = distance / previous.liters;
        individualEfficiencies.push({
          date: current.date,
          individualEfficiency: efficiency,
        });
      }
    }

    const monthlyAverages: { [key: string]: { total: number; count: number } } = {};
    individualEfficiencies.forEach(({ date, individualEfficiency }) => {
      const month = format(parseISO(date), 'yyyy-MM');
      if (!monthlyAverages[month]) {
        monthlyAverages[month] = { total: 0, count: 0 };
      }
      monthlyAverages[month].total += individualEfficiency;
      monthlyAverages[month].count += 1;
    });

    const trendData = Object.entries(monthlyAverages)
      .map(([month, { total, count }]) => ({
        date: format(startOfMonth(parseISO(month)), 'yyyy-MM-dd'),
        efficiency: total / count,
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    const finalTrendData = trendData.length > 1 ? trendData.slice(1) : trendData;

    return {
      individual: individualEfficiencies,
      monthly: finalTrendData,
    };
  }, [sortedRecords]);

  const usageTrend = useMemo(() => {
    if (sortedRecords.length < 2) return [];

    const monthlyData: { [key: string]: { distance: number; fuel: number } } = {};

    for (let i = 1; i < sortedRecords.length; i++) {
      const current = sortedRecords[i];
      const previous = sortedRecords[i - 1];
      const month = format(parseISO(current.date), 'yyyy-MM');
      
      if (!monthlyData[month]) {
        monthlyData[month] = { distance: 0, fuel: 0 };
      }
      
      const distance = current.mileage - previous.mileage;
      if (distance > 0) {
        monthlyData[month].distance += distance;
        monthlyData[month].fuel += previous.liters;
      }
    }

    const trend = Object.entries(monthlyData)
      .map(([month, data]) => ({
        date: format(startOfMonth(parseISO(month)), 'yyyy-MM-dd'),
        ...data
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    if (trend.length < 2) return trend;

    return trend.slice(1);
  }, [sortedRecords]);


  return {
    fuelRecords: sortedRecords,
    addFuelRecord,
    updateFuelRecord,
    deleteFuelRecord,
    stats,
    efficiencyTrend,
    usageTrend,
  };
}
