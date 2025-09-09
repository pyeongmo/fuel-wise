'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import type { FuelRecord } from '@/lib/types';
import { format } from 'date-fns';
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

  const totalDistance = useMemo(() => {
    if (sortedRecords.length < 2) return 0;
    const firstMileage = sortedRecords[0].mileage;
    const lastMileage = sortedRecords[sortedRecords.length - 1].mileage;
    return lastMileage - firstMileage;
  }, [sortedRecords]);

  const totalFuelThisMonth = useMemo(() => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    return fuelRecords
      .filter(record => {
        const entryDate = new Date(record.date);
        return entryDate.getMonth() === currentMonth && entryDate.getFullYear() === currentYear;
      })
      .reduce((sum, record) => sum + record.liters, 0);
  }, [fuelRecords]);
  
  const averageEfficiency = useMemo(() => {
    if (sortedRecords.length < 2) return 0;

    const totalDistanceTravelled = sortedRecords[sortedRecords.length - 1].mileage - sortedRecords[0].mileage;
    if (totalDistanceTravelled <= 0) return 0;

    // Sum of all liters except the last fill-up
    const totalFuelUsed = sortedRecords
        .slice(0, -1)
        .reduce((sum, record) => sum + record.liters, 0);

    if (totalFuelUsed <= 0) return 0;

    return totalDistanceTravelled / totalFuelUsed;
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
    stats: {
      totalDistance,
      totalFuelThisMonth,
      averageEfficiency,
    },
    monthlyUsage,
  };
}
