import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default function SubcategoriasPage() {
  redirect('/dashboard/controle/categorias');
}
