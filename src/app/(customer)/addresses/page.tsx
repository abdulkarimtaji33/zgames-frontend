'use client';

import { useState } from 'react';
import { MapPin, Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function AddressesPage() {
  const [showForm, setShowForm] = useState(false);
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold">My Addresses</h1>
        <Button variant="secondary" size="sm" onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4" /> Add Address
        </Button>
      </div>
      <div className="text-center py-16 rounded-xl bg-card border border-border">
        <MapPin className="h-14 w-14 text-foreground-subtle mx-auto mb-4" />
        <h2 className="font-heading text-xl font-bold mb-2">No addresses saved</h2>
        <p className="text-foreground-muted">Add delivery addresses for faster checkout.</p>
      </div>
    </div>
  );
}