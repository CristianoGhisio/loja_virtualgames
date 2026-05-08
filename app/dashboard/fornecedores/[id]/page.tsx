'use client';

import { use, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SupplierDetailRedirect({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  useEffect(() => {
    router.replace(`/dashboard/fornecedores/${id}/visao-geral`);
  }, [id, router]);

  return (
    <div className="flex items-center justify-center h-40">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neon-blue"></div>
    </div>
  );
}
