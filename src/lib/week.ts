/** Get Monday of the week containing the given date */
export function getMonday(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

/** Format date as YYYY-MM-DD */
export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

/** Get Monday of prev/next week */
export function shiftWeek(mondayStr: string, delta: number): string {
  const d = new Date(mondayStr + 'T00:00:00');
  d.setDate(d.getDate() + 7 * delta);
  return formatDate(d);
}

/** Day labels in Spanish */
export const DAY_LABELS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'] as const;
export const DAY_NAMES = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'] as const;

/** Smart auto-labeling based on slot count */
const SLOT_SCHEMES: Record<number, string[]> = {
  1: ['Cena'],
  2: ['Comida', 'Cena'],
  3: ['Desayuno', 'Comida', 'Cena'],
  4: ['Desayuno', 'Comida', 'Merienda', 'Cena'],
};

export function getSlotLabel(slotOrder: number, totalSlots: number): string {
  const scheme = SLOT_SCHEMES[totalSlots];
  if (scheme && slotOrder < scheme.length) return scheme[slotOrder];
  return `Comida ${slotOrder + 1}`;
}
