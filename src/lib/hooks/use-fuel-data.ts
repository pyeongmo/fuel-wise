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
    const lastMonthDate = subDays(today, 30);

    const lastMonthRecords = sortedRecords.filter(record => 
        isWithinInterval(new Date(record.date), { start: lastMonthDate, end: today })
    );

    let distanceLastMonth = 0;
    if (sortedRecords.length > 0 && lastMonthRecords.length > 0) {
        // Find the record just before the last month period to get starting mileage
        const recordBeforeLastMonth = sortedRecords.slice().reverse().find(
            record => new Date(record.date) < lastMonthDate
        );
        
        const startMileageRecord = recordBeforeLastMonth || lastMonthRecords[0];
        const endMileageRecord = lastMonthRecords[lastMonthRecords.length - 1];
        
        if (endMileageRecord.mileage > startMileageRecord.mileage) {
            distanceLastMonth = endMileageRecord.mileage - startMileageRecord.mileage;
        } else if (lastMonthRecords.length > 1) {
             // Fallback if there's no record before last month
            const firstRecordInPeriod = lastMonthRecords[0];
            distanceLastMonth = endMileageRecord.mileage - firstRecordInPeriod.mileage;
        }
    }


    const fuelLastMonth = lastMonthRecords.reduce((sum, record) => sum + record.liters, 0);

    let efficiencyLastMonth = 0;
    if (distanceLastMonth > 0) {
        // Exclude the last fill-up for efficiency calculation
        const fuelForEfficiency = lastMonthRecords.slice(0, -1).reduce((sum, record) => sum + record.liters, 0);
        if (fuelForEfficiency > 0) {
            efficiencyLastMonth = distanceLastMonth / fuelForEfficiency;
        }
    }
    
    return {
        totalDistance: distanceLastMonth,
        averageEfficiency: efficiencyLastMonth,
        totalFuelThisMonth: fuelLastMonth,
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
