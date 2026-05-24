'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface PaginationProps {
  page: number;
  totalPages: number;
  total: number;
  limit: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
}

export function Pagination({ page, totalPages, total, limit, onPageChange, onLimitChange }: PaginationProps) {
  const startItem = total === 0 ? 0 : (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, total);

  const getPageNumbers = () => {
    const pages: (number | 'ellipsis')[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible + 2) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
      return pages;
    }

    pages.push(1);

    if (page > 3) pages.push('ellipsis');

    const start = Math.max(2, page - 1);
    const end = Math.min(totalPages - 1, page + 1);

    for (let i = start; i <= end; i++) pages.push(i);

    if (page < totalPages - 2) pages.push('ellipsis');

    pages.push(totalPages);

    return pages;
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
      <div className="flex items-center gap-3 text-sm text-gray-400">
        <span>
          Mostrando {startItem}-{endItem} de {total} {total === 1 ? 'item' : 'itens'}
        </span>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">Itens/página:</span>
          <Select
            value={String(limit)}
            onValueChange={(value) => onLimitChange(Number(value))}
          >
            <SelectTrigger className="h-8 w-20 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-gray-400 hover:text-white disabled:opacity-30"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {getPageNumbers().map((p, idx) =>
          p === 'ellipsis' ? (
            <span key={`ellipsis-${idx}`} className="px-2 text-gray-500 text-sm">...</span>
          ) : (
            <Button
              key={p}
              variant={p === page ? 'neon' : 'ghost'}
              size="icon"
              className={`h-8 w-8 text-xs ${
                p === page
                  ? 'bg-neon-blue/20 text-neon-blue'
                  : 'text-gray-400 hover:text-white'
              }`}
              onClick={() => onPageChange(p)}
            >
              {p}
            </Button>
          )
        )}

        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-gray-400 hover:text-white disabled:opacity-30"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
