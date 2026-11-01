export function formatMinutes(totalMinutes: number): string {
  const rounded = Math.max(0, Math.round(totalMinutes));
  const hours = Math.floor(rounded / 60);
  const minutes = rounded % 60;
  if (hours === 0) return `${minutes} perc`;
  return `${hours} ó ${minutes} perc`;
}

export function formatClock(date: Date): string {
  return date.toLocaleTimeString('hu-HU', { hour: '2-digit', minute: '2-digit' });
}

export function formatKm(km: number): string {
  return `${km.toFixed(1).replace('.', ',')} km`;
}

export function formatMeters(meters: number): string {
  return `${Math.round(meters)} m`;
}

export function formatRelativeTime(iso: string): string {
  const diffMinutes = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (diffMinutes < 1) return 'az imént';
  if (diffMinutes < 60) return `${diffMinutes} perce`;
  return new Date(iso).toLocaleString('hu-HU', { hour: '2-digit', minute: '2-digit' });
}
