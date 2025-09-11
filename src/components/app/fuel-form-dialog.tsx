'use client';

import { useState, useEffect } from 'react';
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

  useEffect(() => {
    const handlePopState = () => {
      setOpen(false);
    };

    if (open) {
      history.pushState({ modal: true }, '');
      window.addEventListener('popstate', handlePopState);
    }

    return () => {
      window.removeEventListener('popstate', handlePopState);
      if (open) {
        // If the modal is still open when the component unmounts or re-renders,
        // we might need to go back in history to not leave the fake history entry.
        // This is tricky, a simpler approach is to just ensure the popstate is handled.
      }
    };
  }, [open]);

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen && open) {
      // If modal is being closed manually, go back in history
      if (history.state?.modal) {
        history.back();
      }
    }
    setOpen(isOpen);
  };


  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>주유 기록 추가</DialogTitle>
          <DialogDescription>
            영수증을 올리거나 세부 정보를 직접 입력하세요.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <FuelForm onAfterSave={() => handleOpenChange(false)} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
