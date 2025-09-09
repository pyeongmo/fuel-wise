'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import FuelForm from './fuel-form';
import type { FuelRecord } from '@/lib/types';
import { useFuelData } from '@/lib/hooks/use-fuel-data';
import { Button } from '../ui/button';
import { Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface EditFuelRecordDialogProps {
  record: FuelRecord;
  children: React.ReactNode;
}

export function EditFuelRecordDialog({ record, children }: EditFuelRecordDialogProps) {
  const [open, setOpen] = useState(false);
  const { updateFuelRecord, deleteFuelRecord } = useFuelData();
  const { toast } = useToast();

  const handleSave = async (data: Omit<FuelRecord, 'id'>) => {
    await updateFuelRecord(record.id, data);
  };

  const handleDelete = async () => {
    try {
      await deleteFuelRecord(record.id);
      toast({ title: '🗑️ 주유 기록 삭제 완료' });
      setOpen(false);
    } catch (error) {
      console.error('Error deleting record: ', error);
      toast({
        variant: 'destructive',
        title: '❌ 삭제 실패',
        description: '기록을 삭제하는 중에 오류가 발생했습니다.',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {children}
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>주유 기록 편집</DialogTitle>
          <DialogDescription>
            주유 기록의 세부 정보를 수정하거나 삭제할 수 있습니다.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <FuelForm
            recordToEdit={record}
            onSave={handleSave}
            onAfterSave={() => setOpen(false)}
          />
        </div>
        <DialogFooter className="sm:justify-between">
            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="outline" className="text-red-500 border-red-500/50 hover:bg-red-500/10 hover:text-red-600">
                        <Trash2 className="mr-2 h-4 w-4" />
                        삭제
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>정말 삭제하시겠습니까?</AlertDialogTitle>
                        <AlertDialogDescription>
                            이 작업은 되돌릴 수 없습니다. 이 기록이 서버에서 영구적으로 삭제됩니다.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>취소</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">삭제</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
