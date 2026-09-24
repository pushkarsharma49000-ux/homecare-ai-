import type { SupabaseClient } from '@supabase/supabase-js';

const TIMEZONE = process.env.APPOINTMENT_TIMEZONE || 'Asia/Kolkata';
const DURATION_MINUTES = Number(process.env.APPOINTMENT_DURATION_MINUTES || 60);
const HOURS = (process.env.APPOINTMENT_WORKING_HOURS || '10,15,17').split(',').map(Number).filter((hour) => hour >= 0 && hour <= 23);

export type AvailableSlot = { id: string; start: string; end: string; timezone: string };

function localDate(offsetDays: number): string {
  const date = new Date(Date.now() + offsetDays * 86_400_000);
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: TIMEZONE, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(date);
  const part = (type: string) => parts.find((item) => item.type === type)?.value;
  return `${part('year')}-${part('month')}-${part('day')}`;
}

function slotAt(date: string, hour: number): AvailableSlot {
  const start = new Date(`${date}T${String(hour).padStart(2, '0')}:00:00+05:30`);
  const end = new Date(start.getTime() + DURATION_MINUTES * 60_000);
  return { id: `${start.toISOString()}_${end.toISOString()}`, start: start.toISOString(), end: end.toISOString(), timezone: TIMEZONE };
}

export async function isAvailable(supabase: SupabaseClient, start: Date, end: Date): Promise<boolean> {
  const { data, error } = await supabase.from('appointments').select('id').lt('scheduled_start', end.toISOString()).gt('scheduled_end', start.toISOString()).neq('status', 'CANCELLED').limit(1);
  if (error) throw error;
  return !data?.length;
}

export async function getAvailableSlots(supabase: SupabaseClient): Promise<AvailableSlot[]> {
  const candidates = Array.from({ length: 14 }, (_, index) => index + 1)
    .filter((day) => new Date(`${localDate(day)}T12:00:00+05:30`).getDay() !== 0)
    .flatMap((day) => HOURS.map((hour) => slotAt(localDate(day), hour)));
  const available = await Promise.all(candidates.map(async (slot) => (await isAvailable(supabase, new Date(slot.start), new Date(slot.end))) ? slot : null));
  return available.filter((slot): slot is AvailableSlot => slot !== null).slice(0, 12);
}

export function isConfiguredSlot(start: Date, end: Date): boolean {
  if (end.getTime() - start.getTime() !== DURATION_MINUTES * 60_000) return false;
  const localHour = Number(new Intl.DateTimeFormat('en-US', { timeZone: TIMEZONE, hour: '2-digit', hourCycle: 'h23' }).format(start));
  return HOURS.includes(localHour) && start.getDay() !== 0;
}
