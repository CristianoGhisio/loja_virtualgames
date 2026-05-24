'use client';

import { Package, DollarSign, TrendingUp, AlertTriangle, BarChart3 } from 'lucide-react';

interface InventoryItem {
  id: string;
  name: string;
  price: number;
  costPrice?: number;
  stock: number;
  minStock?: number;
  stockTotalValue?: number;
  totalSaleValue?: number;
}

interface StockKpiCardsProps {
  items: InventoryItem[];
}

export function StockKpiCards({ items }: StockKpiCardsProps) {
  const totalItems = items.reduce((acc, item) => acc + item.stock, 0);
  const totalCostValue = items.reduce((acc, item) => acc + (item.stock * (item.costPrice || 0)), 0);
  const totalSaleValue = items.reduce((acc, item) => acc + (item.stock * item.price), 0);
  const potentialMargin = totalSaleValue - totalCostValue;
  const lowStockCount = items.filter(item => item.stock < (item.minStock || 5)).length;

  const formatCurrency = (value: number) =>
    value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const cards = [
    {
      label: 'Total de Itens',
      value: `${totalItems} unid.`,
      icon: Package,
      color: 'text-cyan-300',
      bgColor: 'bg-cyan-400/10',
      borderColor: 'border-cyan-400/30',
    },
    {
      label: 'Custo Total',
      value: formatCurrency(totalCostValue),
      icon: DollarSign,
      color: 'text-rose-400',
      bgColor: 'bg-rose-400/10',
      borderColor: 'border-rose-400/30',
    },
    {
      label: 'Venda Total',
      value: formatCurrency(totalSaleValue),
      icon: BarChart3,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-400/10',
      borderColor: 'border-emerald-400/30',
    },
    {
      label: 'Margem Potencial',
      value: formatCurrency(potentialMargin),
      icon: TrendingUp,
      color: 'text-neon-blue',
      bgColor: 'bg-neon-blue/10',
      borderColor: 'border-neon-blue/30',
    },
    {
      label: 'Estoque Baixo',
      value: `${lowStockCount} produtos`,
      icon: AlertTriangle,
      color: lowStockCount > 0 ? 'text-amber-400' : 'text-emerald-400',
      bgColor: lowStockCount > 0 ? 'bg-amber-400/10' : 'bg-emerald-400/10',
      borderColor: lowStockCount > 0 ? 'border-amber-400/30' : 'border-emerald-400/30',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {cards.map((card) => (
        <div
          key={card.label}
          className={`${card.bgColor} ${card.borderColor} border rounded-lg p-3 sm:p-4 transition-all duration-200 hover:scale-[1.02]`}
        >
          <div className="flex items-center gap-2 mb-2">
            <card.icon className={`w-4 h-4 ${card.color}`} />
            <span className="text-xs text-gray-400 uppercase tracking-wide font-medium">
              {card.label}
            </span>
          </div>
          <p className={`text-sm sm:text-base font-bold ${card.color} font-mono`}>
            {card.value}
          </p>
        </div>
      ))}
    </div>
  );
}
