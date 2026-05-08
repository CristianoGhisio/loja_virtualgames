'use client';

import { redirect } from 'next/navigation';

export default function VendasPage() {
  redirect('/dashboard/vendas/em-andamento');
}
