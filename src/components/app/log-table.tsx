import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import type { LogEntry } from '@/lib/types';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

interface LogTableProps {
  entries: LogEntry[];
}

export default function LogTable({ entries }: LogTableProps) {
    if (entries.length === 0) {
        return (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
            데이터가 없습니다.
          </div>
        );
      }

  return (
    <div className="relative max-h-[250px] overflow-auto">
        <Table>
        <TableHeader>
            <TableRow>
            <TableHead>유형</TableHead>
            <TableHead>날짜</TableHead>
            <TableHead className="text-right">값</TableHead>
            </TableRow>
        </TableHeader>
        <TableBody>
            {entries.slice(0, 5).map(entry => (
            <TableRow key={entry.id}>
                <TableCell>
                <Badge variant={entry.type === 'fuel' ? 'default' : 'secondary'} className={entry.type === 'fuel' ? 'bg-primary' : ''}>
                    {entry.type === 'fuel' ? '주유' : '주행'}
                </Badge>
                </TableCell>
                <TableCell>{format(new Date(entry.date), 'MM.dd(EEE)', { locale: ko })}</TableCell>
                <TableCell className="text-right">
                {entry.type === 'fuel'
                    ? `${entry.liters.toFixed(1)} L`
                    : `${entry.mileage.toLocaleString()} km`}
                </TableCell>
            </TableRow>
            ))}
        </TableBody>
        </Table>
    </div>
  );
}
