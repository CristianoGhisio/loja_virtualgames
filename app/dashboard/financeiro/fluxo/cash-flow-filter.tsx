
'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { addDays, startOfMonth, endOfMonth, format } from 'date-fns';

export function CashFlowFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const today = new Date();
  const defaultStart = format(startOfMonth(today), 'yyyy-MM-dd');
  const defaultEnd = format(endOfMonth(today), 'yyyy-MM-dd');

  const period = searchParams.get('period') || '30d';
  const startDate = searchParams.get('start') || defaultStart;
  const endDate = searchParams.get('end') || defaultEnd;

  const handlePeriodChange = (value: string) => {
    let newStart = startDate;
    let newEnd = endDate;

    switch (value) {
      case 'today':
        newStart = format(today, 'yyyy-MM-dd');
        newEnd = format(today, 'yyyy-MM-dd');
        break;
      case '7d':
        newStart = format(today, 'yyyy-MM-dd');
        newEnd = format(addDays(today, 7), 'yyyy-MM-dd');
        break;
      case '30d':
        newStart = format(today, 'yyyy-MM-dd');
        newEnd = format(addDays(today, 30), 'yyyy-MM-dd');
        break;
      case 'custom':
        break;
    }
    
    applyFilter(value, newStart, newEnd);
  };

  const applyFilter = (p: string, s: string, e: string) => {
    const params = new URLSearchParams();
    params.set('period', p);
    params.set('start', s);
    params.set('end', e);
    router.push(`?${params.toString()}`);
  };

  const handleDateChange = (type: 'start' | 'end', value: string) => {
    if (period === 'custom') {
        const s = type === 'start' ? value : startDate;
        const e = type === 'end' ? value : endDate;
        applyFilter('custom', s, e);
    }
  };

  return (
    <div className="flex flex-wrap gap-4 items-center bg-card p-4 rounded-lg border border-border">
      <div className="w-[180px]">
        <Select value={period} onValueChange={handlePeriodChange}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione o período" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="today">Hoje</SelectItem>
            <SelectItem value="7d">7 dias</SelectItem>
            <SelectItem value="30d">30 dias</SelectItem>
            <SelectItem value="custom">Personalizado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2">
        <Input 
          type="date" 
          value={startDate} 
          onChange={(e) => handleDateChange('start', e.target.value)}
          disabled={period !== 'custom'}
          className="w-[160px]"
        />
        <span className="text-muted-foreground">até</span>
        <Input 
          type="date" 
          value={endDate} 
          onChange={(e) => handleDateChange('end', e.target.value)}
          disabled={period !== 'custom'}
          className="w-[160px]"
        />
      </div>
    </div>
  );
}
