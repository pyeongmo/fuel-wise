'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import FuelForm from './fuel-form';

interface FuelFormDialogProps {
  children: React.ReactNode;
}

export function FuelFormDialog({ children }: FuelFormDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>주유 기록 추가</DialogTitle>
          <DialogDescription>
            영수증을 올리거나 세부 정보를 직접 입력하세요.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <FuelForm onAfterSave={() => setOpen(false)} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
