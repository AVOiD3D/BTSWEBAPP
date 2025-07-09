import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency: string = 'TND'): string {
  return new Intl.NumberFormat('fr-TN', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 3,
  }).format(amount)
}

export function calculateTVA(amount: number, rate: number = 19): number {
  return (amount * rate) / 100
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('fr-TN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date)
}