export function getDailyCashStorageStatus(): 'ABERTO' | 'FECHADO' | null {
  if (typeof window === 'undefined') return null;
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const key = `virtual-games-caixa-diario:${year}-${month}-${day}`;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { status?: string };
    return parsed?.status === 'ABERTO' ? 'ABERTO' : 'FECHADO';
  } catch {
    return null;
  }
}
