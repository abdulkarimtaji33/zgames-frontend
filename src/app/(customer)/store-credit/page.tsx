'use client';

import { Wallet } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

export default function StoreCreditPage() {
  const { customer } = useAuthStore();
  const balance = customer?.walletBalance ?? 0;
  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl font-bold">Store Credit</h1>
      <div className="rounded-2xl bg-gradient-to-br from-green-900/30 to-background-secondary border border-green-500/20 p-8 text-center">
        <Wallet className="h-12 w-12 text-success mx-auto mb-3" />
        <p className="text-foreground-muted text-sm mb-1">Available Balance</p>
        <p className="font-heading text-5xl font-bold text-success">AED {Number(balance).toFixed(2)}</p>
        <p className="text-xs text-foreground-muted mt-2">Used automatically at checkout</p>
      </div>
    </div>
  );
}