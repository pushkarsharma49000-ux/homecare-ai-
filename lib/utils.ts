import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export function maskPhoneNumber(phone: string): string {
  if (!phone) return '';
  // Keeps country code and prefix, masks middle/end as requested
  if (phone.includes('XXXXX')) return phone;
  return phone.replace(/(\+91\s?\d{2})\d{3}\s?(\d{5})/, '$1XXX XXXXX');
}
