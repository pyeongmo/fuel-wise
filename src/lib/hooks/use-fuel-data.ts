'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import type { FuelEntry, MileageEntry, LogEntry } from '@/lib/types';
import { format } from 'date-fns';
import { useAuth } from '@/hooks/use-auth';
import { db } from '@/lib/firebase';
import { collection, addDoc, onSnapshot, query, orderBy } from 'firebase/firestore';

export function useFuelData() {
  const { user, loading } = useAuth();
  const [fuelEntries, setFuelEntries] = useState<FuelEntry[]>([]);
  const [mileageEntries, setMileageEntries] = useState<MileageEntry[]>([]);
  
  const entriesCollectionName = useMemo(() => user ? `users/${user.uid}/entries` : null, [user]);

  useEffect(() => {
    if (loading || !entriesCollectionName) {
      setFuelEntries([]);
      setMileageEntries([]);
      return;
    };

    const q = query(collection(db, entriesCollectionName), orderBy('date', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const allEntries = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as LogEntry));
      setFuelEntries(allEntries.filter(e => e.type === 'fuel') as FuelEntry[]);
      setMileageEntries(allEntries.filter(e => e.type === 'mileage') as MileageEntry[]);
    },
    (error) => {
      console.error("Snapshot listener error:", error);
    });

    return () => unsubscribe();
  }, [entriesCollectionName, loading]);

  const addFuelAndMileageEntry = useCallback(async (
    fuelData: Omit<FuelEntry, 'id' | 'type'>,
    mileageData: Omit<MileageEntry, 'id' | 'type'>
  ) => {
    if (!entriesCollectionName) return;
    
    await addDoc(collection(db, entriesCollectionName), { ...fuelData, type: 'fuel' });
    await addDoc(collection(db, entriesCollectionName), { ...mileageData, type: 'mileage' });

  }, [entriesCollectionName]);


  const logEntries = useMemo(() => {
    const combined = [...fuelEntries, ...mileageEntries];
    return combined.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [fuelEntries, mileageEntries]);

  const totalDistance = useMemo(() => {
    if (mileageEntries.length < 2) return 0;
    const sorted = [...mileageEntries].sort((a, b) => a.mileage - b.mileage);
    return sorted[sorted.length - 1].mileage - sorted[0].mileage;
  }, [mileageEntries]);

  const totalFuelThisMonth = useMemo(() => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    return fuelEntries
      .filter(entry => {
        const entryDate = new Date(entry.date);
        return entryDate.getMonth() === currentMonth && entryDate.getFullYear() === currentYear;
      })
      .reduce((sum, entry) => sum + entry.liters, 0);
  }, [fuelEntries]);
  
  const averageEfficiency = useMemo(() => {
    if (mileageEntries.length < 2) return 0;

    const sortedMileage = [...mileageEntries].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const firstMileage = sortedMileage[0];
    const lastMileage = sortedMileage[sortedMileage.length - 1];
    
    const relevantFuelEntries = fuelEntries.filter(
        entry => new Date(entry.date) >= new Date(firstMileage.date) && new Date(entry.date) <= new Date(lastMileage.date)
    );
    
    const totalFuelUsed = relevantFuelEntries.reduce((sum, entry) => sum + entry.liters, 0);
    const totalDistanceTravelled = lastMileage.mileage - firstMileage.mileage;

    if (totalFuelUsed <= 0 || totalDistanceTravelled <= 0) return 0;
    
    // We subtract the last fill-up because it hasn't been used for driving yet in this dataset
    const fuelForEfficiencyCalc = totalFuelUsed - (relevantFuelEntries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]?.liters || 0);
    
    if (fuelForEfficiencyCalc <= 0) return 0;

    return totalDistanceTravelled / fuelForEfficiencyCalc;
  }, [fuelEntries, mileageEntries]);

  const monthlyUsage = useMemo(() => {
    const usage: { [key: string]: number } = {};
    fuelEntries.forEach(entry => {
      const month = format(new Date(entry.date), 'yyyy-MM');
      if (!usage[month]) {
        usage[month] = 0;
      }
      usage[month] += entry.liters;
    });
    return Object.entries(usage)
      .map(([month, liters]) => ({ name: month, total: liters }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [fuelEntries]);

  return {
    fuelEntries,
    mileageEntries,
    logEntries,
    addFuelAndMileageEntry,
    stats: {
      totalDistance,
      totalFuelThisMonth,
      averageEfficiency,
    },
    monthlyUsage,
  };
}
