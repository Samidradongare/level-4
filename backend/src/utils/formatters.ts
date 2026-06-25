const STROOPS_PER_XLM = 10000000;

export function stroopsToXlm(stroops: number | bigint | string): number {
  const s = typeof stroops === 'string' ? parseInt(stroops, 10) : Number(stroops);
  if (isNaN(s)) return 0;
  return s / STROOPS_PER_XLM;
}

export function xlmToStroops(xlm: number): number {
  if (isNaN(xlm) || xlm <= 0) return 0;
  return Math.round(xlm * STROOPS_PER_XLM);
}

export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toISOString().replace('T', ' ').substring(0, 19);
}
