'use client';
import { useState } from 'react';
import { Save } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
const TABS = ['General', 'Countries', 'Payments', 'Shipping', 'Integrations', 'SEO'];
export default function AdminSettingsPage() {
  const [tab, setTab] = useState('General');
  return (
    <div className="p-4 md:p-6 space-y-5">
      <h1 className="font-heading text-2xl font-bold">Settings</h1>
      <div className="flex gap-1 overflow-x-auto pb-1">
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === t ? 'bg-accent text-white' : 'bg-background-tertiary text-foreground-muted hover:text-foreground border border-border'}`}>
            {t}
          </button>
        ))}
      </div>
      {tab === 'General' && (
        <div className="rounded-xl bg-card border border-border p-5 space-y-4 max-w-2xl">
          <h3 className="font-heading text-base font-bold">Store Information</h3>
          <Input label="Store Name" defaultValue="ZGames" />
          <Input label="Support Email" type="email" defaultValue="support@zgames.ae" />
          <Input label="Support Phone" defaultValue="+971 4 XXX XXXX" />
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">Default Currency</label>
            <select className="w-full rounded border border-border bg-background-secondary px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-accent">
              <option>AED – UAE Dirham</option><option>SAR – Saudi Riyal</option><option>USD – US Dollar</option>
            </select>
          </div>
          <Button variant="primary"><Save className="h-4 w-4" /> Save Changes</Button>
        </div>
      )}
      {tab !== 'General' && (
        <div className="rounded-xl bg-card border border-border p-8 text-center">
          <p className="text-foreground-muted">{tab} settings coming soon</p>
        </div>
      )}
    </div>
  );
}