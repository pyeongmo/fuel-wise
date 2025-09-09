'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import type { FuelRecord } from '@/lib/types';
import { format, subDays, isWithinInterval } from 'date-fns';
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
        
        const startMileageRecord = recordBeforePeriod || last3MonthsRecords[0];
        const endMileageRecord = last3MonthsRecords[last3MonthsRecords.length - 1];
        
        if (endMileageRecord.mileage > startMileageRecord.mileage) {
            totalDistance = endMileageRecord.mileage - startMileageRecord.mileage;
        } else if (last3MonthsRecords.length > 1) {
            const firstRecordInPeriod = last3MonthsRecords[0];
            totalDistance = endMileageRecord.mileage - firstRecordInPeriod.mileage;
        }
    }

    const totalFuel = last3MonthsRecords.reduce((sum, record) => sum + record.liters, 0);

    let averageEfficiency = 0;
    if (totalDistance > 0) {
        // Exclude the last fill-up for efficiency calculation as it's for future mileage
        const fuelForEfficiency = last3MonthsRecords.slice(0, -1).reduce((sum, record) => sum + record.liters, 0);
        if (fuelForEfficiency > 0) {
            averageEfficiency = totalDistance / fuelForEfficiency;
        }
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


  const monthlyUsage = useMemo(() => {
    const usage: { [key: string]: number } = {};
    fuelRecords.forEach(entry => {
      const month = format(new Date(entry.date), 'yyyy-MM');
      if (!usage[month]) {
        usage[month] = 0;
      }
      usage[month] += entry.liters;
    });
    return Object.entries(usage)
      .map(([month, liters]) => ({ name: month, total: liters }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [fuelRecords]);

  return {
    fuelRecords: sortedRecords,
    addFuelRecord,
    updateFuelRecord,
    deleteFuelRecord,
    stats,
    monthlyUsage,
  };
}
