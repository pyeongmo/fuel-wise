'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { useAuth } from '@/hooks/use-auth';
import { extractReceiptInfo } from '@/ai/flows/extract-receipt-info';
import { useFuelData } from '@/lib/hooks/use-fuel-data';
import type { FuelRecord } from '@/lib/types';


interface FuelFormProps {
    recordToEdit?: FuelRecord;
    onSave?: (data: Omit<FuelRecord, 'id' | 'currency'> & { currency?: string }) => Promise<void>;
    onAfterSave?: () => void;
}


export default function FuelForm({ recordToEdit, onSave, onAfterSave }: FuelFormProps) {
  const { user } = useAuth();
  const { addFuelRecord } = useFuelData();
  const [liters, setLiters] = useState('');
  const [price, setPrice] = useState('');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [currency, setCurrency] = useState('KRW');
  const [mileage, setMileage] = useState('');
  const [receiptImage, setReceiptImage] = useState<File | null>(null);

  const [isProcessing, setIsProcessing] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (recordToEdit) {
      setLiters(recordToEdit.liters.toString());
      setPrice(recordToEdit.price.toString());
      setDate(format(parseISO(recordToEdit.date), 'yyyy-MM-dd'));
      setMileage(recordToEdit.mileage.toString());
      setCurrency(recordToEdit.currency || 'KRW');
    }
  }, [recordToEdit]);


  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setReceiptImage(file);
      handleImageExtract(file);
    }
  };

  const handleImageExtract = async (file: File) => {
    if (!file) {
      toast({
        variant: 'destructive',
        title: '⚠️ 이미지 없음',
        description: '분석할 영수증 이미지를 먼저 선택해주세요.',
      });
      return;
    }
    try {
        setIsExtracting(true);
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const photoDataUri = reader.result as string;
        const result = await extractReceiptInfo({ photoDataUri });

        if (result.liters) setLiters(result.liters.toString());
        if (result.price) setPrice(result.price.toString());
        if (result.date) setDate(result.date);

        toast({
          title: '✨ 영수증 분석 완료',
          description: '추출된 정보를 확인하고 필요한 경우 수정하세요.',
        });
          setIsExtracting(false);
      };
    } catch (error) {
      console.error("Error extracting from receipt: ", error);
      toast({
        variant: 'destructive',
        title: '❌ 분석 실패',
        description: '영수증을 분석하는 중에 오류가 발생했습니다.',
      });
        setIsExtracting(false);
    }
  }


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({
        variant: 'destructive',
        title: '⚠️ 로그인 필요',
        description: '데이터를 저장하려면 먼저 로그인해야 합니다.',
      });
      return;
    }
    if (!liters || !price || !date || !mileage) {
      toast({
        variant: 'destructive',
        title: '⚠️ 입력 오류',
        description: '모든 필드를 채워주세요.',
      });
      return;
    }

    setIsProcessing(true);
    const entryDate = new Date(date).toISOString();

    try {
      const fuelData = {
          date: entryDate,
          liters: parseFloat(liters),
          price: parseFloat(price),
          currency,
          mileage: parseInt(mileage, 10),
      };

      if (onSave) {
        await onSave(fuelData);
        toast({ title: '💾 주유 기록 수정 완료' });
      } else {
        await addFuelRecord(fuelData);
        toast({ title: '⛽️ 주유 기록 추가 완료' });
      }

      if (onAfterSave) {
        onAfterSave();
      } else {
        // Reset form only when adding new record
        setLiters('');
        setPrice('');
        setDate(format(new Date(), 'yyyy-MM-dd'));
        setMileage('');
        setReceiptImage(null);
        const fileInput = document.getElementById('receipt') as HTMLInputElement;
        if(fileInput) fileInput.value = '';
      }

    } catch (error) {
      console.error("Error saving document: ", error);
      toast({
        variant: 'destructive',
        title: '❌ 저장 실패',
        description: '데이터를 저장하는 중에 오류가 발생했습니다.',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="receipt">영수증 이미지 (선택 사항)</Label>
        <div className="flex items-center gap-2">
          <Input id="receipt" type="file" accept="image/*" onChange={handleImageChange} className="flex-grow" disabled={isProcessing || isExtracting} />
          {isExtracting && <Loader2 className="h-5 w-5 animate-spin" />}
        </div>
        <p className="text-xs text-muted-foreground">AI가 주유량, 금액, 날짜를 자동 추출합니다.</p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="mileage">총 주행 거리 (km)</Label>
        <Input id="mileage" type="number" value={mileage} onChange={e => setMileage(e.target.value)} required placeholder="예: 54321" disabled={isProcessing} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="liters">주유량 (L)</Label>
          <Input id="liters" type="number" step="0.01" value={liters} onChange={e => setLiters(e.target.value)} required placeholder="예: 45.5" disabled={isProcessing || isExtracting} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="price">금액 ({currency})</Label>
          <Input id="price" type="number" value={price} onChange={e => setPrice(e.target.value)} required placeholder="예: 60000" disabled={isProcessing || isExtracting}/>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="date">날짜</Label>
        <Input id="date" type="date" value={date} onChange={e => setDate(e.target.value)} required disabled={isProcessing || isExtracting} />
      </div>
      <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground" disabled={isProcessing || isExtracting || !user}>
        {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        {user ? '저장' : '로그인 필요'}
      </Button>
    </form>
  );
}
