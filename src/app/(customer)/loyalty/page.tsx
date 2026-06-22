'use client';

import { Star, Gift } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

const TIERS = [
  { name: 'Bronze', min: 0, max: 499, color: 'text-orange-400', bg: 'bg-orange-900/20' },
  { name: 'Silver', min: 500, max: 1499, color: 'text-gray-300', bg: 'bg-gray-800/20' },
  { name: 'Gold', min: 1500, max: 4999, color: 'text-yellow-400', bg: 'bg-yellow-900/20' },
  { name: 'Platinum', min: 5000, max: Infinity, color: 'text-cyan-300', bg: 'bg-cyan-900/20' },
];

export default function LoyaltyPage() {
  const { customer } = useAuthStore();
  const points = customer?.pointsBalance ?? 0;
  const tier = TIERS.find((t) => points >= t.min && points <= t.max) ?? TIERS[0];
  const progress = tier.max === Infinity ? 100 : Math.min(100, ((points - tier.min) / (tier.max - tier.min)) * 100);

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl font-bold">Loyalty Rewards</h1>
      <div className="rounded-2xl bg-card border border-border p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-sm text-foreground-muted">Your Tier</p>
            <p className={`font-heading text-3xl font-bold ${tier.color}`}>{tier.name}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-foreground-muted">Total Points</p>
            <p className="font-heading text-3xl font-bold text-accent">{points.toLocaleString()}</p>
          </div>
        </div>
        {tier.max !== Infinity && (
          <div>
            <div className="flex justify-between text-xs text-foreground-muted mb-1">
              <span>{tier.name}</span>
              <span>{tier.max - points} pts to next tier</span>
            </div>
            <div className="h-2 rounded-full bg-background-tertiary overflow-hidden">
              <div className="h-full rounded-full bg-accent transition-all duration-500" style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}
      </div>
      <div className="rounded-xl bg-card border border-border p-5">
        <h3 className="font-heading text-lg font-bold mb-3 flex items-center gap-2">
          <Gift className="h-5 w-5 text-accent" /> How to Earn Points
        </h3>
        <div className="space-y-3">
          {[
            { action: 'Every AED 1 spent', points: '1 point' },
            { action: 'Write a product review', points: '50 points' },
            { action: 'Refer a friend', points: '200 points' },
            { action: 'Birthday bonus', points: '100 points' },
          ].map((item) => (
            <div key={item.action} className="flex justify-between text-sm">
              <span className="text-foreground-muted">{item.action}</span>
              <span className="font-medium text-accent">{item.points}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}