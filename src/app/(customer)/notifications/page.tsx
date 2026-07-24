'use client';

import { useEffect, useState } from 'react';
import { Bell, Mail, MessageSquare, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';

const PREF_ITEMS = [
  { key: 'orderUpdates', label: 'Order Updates', desc: 'Shipping and delivery notifications' },
  { key: 'dealsOffers', label: 'Deals & Offers', desc: 'Flash sales, coupons, and promotions' },
  { key: 'newArrivals', label: 'New Arrivals', desc: 'Latest products and releases' },
  { key: 'loyaltyRewards', label: 'Loyalty Rewards', desc: 'Points earned and tier changes' },
  { key: 'priceDropAlerts', label: 'Price Drop Alerts', desc: 'When wishlist items go on sale' },
] as const;

type PrefKey = (typeof PREF_ITEMS)[number]['key'];
type Channel = 'email' | 'sms';
type Prefs = Record<PrefKey, Record<Channel, boolean>>;

const STORAGE_KEY = 'cgagames-notification-preferences';

const DEFAULT_PREFS: Prefs = PREF_ITEMS.reduce((acc, item) => {
  acc[item.key] = { email: true, sms: false };
  return acc;
}, {} as Prefs);

function loadPrefs(): Prefs {
  if (typeof window === 'undefined') return DEFAULT_PREFS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PREFS;
    return { ...DEFAULT_PREFS, ...(JSON.parse(raw) as Partial<Prefs>) };
  } catch {
    return DEFAULT_PREFS;
  }
}

export default function NotificationsPage() {
  const [prefs, setPrefs] = useState<Prefs>(DEFAULT_PREFS);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => { setPrefs(loadPrefs()); }, []);

  const toggle = (key: PrefKey, channel: Channel) => {
    setPrefs((prev) => ({ ...prev, [key]: { ...prev[key], [channel]: !prev[key][channel] } }));
    setSaved(false);
  };

  const handleSave = () => {
    setSaving(true);
    try {
      // NOTE: the backend notifications module currently only exposes GET
      // /notifications/preferences — there's no PATCH/update route wired up
      // yet, so this persists to localStorage as a stopgap. Once a backend
      // endpoint exists, swap this for a real API call.
      localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
      setSaved(true);
      setTimeout(() => setSaved(false), 4000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center flex-wrap justify-between gap-3">
        <h1 className="font-heading text-2xl font-bold">Notification Preferences</h1>
        <Button variant="primary" size="sm" onClick={handleSave} isLoading={saving}>
          <Bell className="h-4 w-4" /> Save Preferences
        </Button>
      </div>

      <div className="rounded-xl bg-card border border-border divide-y divide-border shadow-sm">
        {PREF_ITEMS.map((pref) => (
          <div key={pref.key} className="flex items-center flex-wrap justify-between gap-3 p-4">
            <div className="min-w-0">
              <p className="font-medium text-foreground text-sm">{pref.label}</p>
              <p className="text-xs text-foreground-muted">{pref.desc}</p>
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-1.5 text-xs text-foreground-muted cursor-pointer hover:text-foreground transition-colors">
                <input
                  type="checkbox"
                  checked={prefs[pref.key].email}
                  onChange={() => toggle(pref.key, 'email')}
                  className="accent-accent focus-visible:ring-2 focus-visible:ring-ring/40 rounded"
                />
                <Mail className="h-3.5 w-3.5" /> Email
              </label>
              <label className="flex items-center gap-1.5 text-xs text-foreground-muted cursor-pointer hover:text-foreground transition-colors">
                <input
                  type="checkbox"
                  checked={prefs[pref.key].sms}
                  onChange={() => toggle(pref.key, 'sms')}
                  className="accent-accent focus-visible:ring-2 focus-visible:ring-ring/40 rounded"
                />
                <MessageSquare className="h-3.5 w-3.5" /> SMS
              </label>
            </div>
          </div>
        ))}
      </div>

      {saved && (
        <div
          role="status"
          className="fixed bottom-4 right-4 z-[60] flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg border border-success/30 bg-success/10 text-success text-sm font-medium"
        >
          <CheckCircle2 className="h-4 w-4" /> Preferences saved.
        </div>
      )}
    </div>
  );
}
