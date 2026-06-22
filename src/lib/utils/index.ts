export { cn } from './cn';

export function formatPrice(amount: number, currency = 'AED'): string {
  return `${currency} ${amount.toFixed(2)}`;
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-GB', {
    year: 'numeric', month: 'short', day: 'numeric',
  });
}

export function truncate(str: string, maxLength: number): string {
  return str.length > maxLength ? `${str.slice(0, maxLength)}...` : str;
}

export function slugify(str: string): string {
  return str.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
}

export function getDiscountPercent(price: number, salePrice: number): number {
  return Math.round(((price - salePrice) / price) * 100);
}
