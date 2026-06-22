'use client';
import { StatCard } from '@/components/admin/StatCard';
import { Star, Users, Gift, TrendingUp } from 'lucide-react';
const TIERS = [
  { name: 'Bronze', min: 0, max: 499, members: 8421, color: 'text-orange-400', bg: 'bg-orange-400/10' },
  { name: 'Silver', min: 500, max: 1499, members: 2890, color: 'text-gray-300', bg: 'bg-gray-400/10' },
  { name: 'Gold', min: 1500, max: 4999, members: 892, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
  { name: 'Platinum', min: 5000, max: null, members: 138, color: 'text-cyan-300', bg: 'bg-cyan-400/10' },
];
export default function AdminLoyaltyPage() {
  return (
    <div className="p-4 md:p-6 space-y-6">
      <h1 className="font-heading text-2xl font-bold">Loyalty Program</h1>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Members" value="12,341" icon={<Users className="h-4 w-4" />} color="text-blue-400" />
        <StatCard title="Points Issued" value="4.2M" icon={<Star className="h-4 w-4" />} color="text-yellow-400" />
        <StatCard title="Points Redeemed" value="1.8M" icon={<Gift className="h-4 w-4" />} color="text-green-400" />
        <StatCard title="Redemption Rate" value="43%" icon={<TrendingUp className="h-4 w-4" />} color="text-accent" />
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {TIERS.map((tier) => (
          <div key={tier.name} className={`rounded-xl p-5 border border-border ${tier.bg}`}>
            <p className={`font-heading text-xl font-bold ${tier.color} mb-1`}>{tier.name}</p>
            <p className="text-sm text-foreground-muted">{tier.min.toLocaleString()} – {tier.max ? tier.max.toLocaleString() : '∞'} pts</p>
            <p className="font-heading text-2xl font-bold text-foreground mt-3">{tier.members.toLocaleString()}</p>
            <p className="text-xs text-foreground-muted">members</p>
          </div>
        ))}
      </div>
    </div>
  );
}