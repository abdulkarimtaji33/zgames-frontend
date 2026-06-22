'use client';
import { Plus } from 'lucide-react';
import { DataTable } from '@/components/admin/DataTable';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

interface GiftCardRow { id: string; code: string; type: string; initialBalance: number; currentBalance: number; isActive: boolean; sentToEmail: string | null; createdAt: string; }

const CARDS: GiftCardRow[] = [
  { id: '1', code: 'ZGFT-XXXX-YYYY', type: 'DIGITAL', initialBalance: 500, currentBalance: 350, isActive: true, sentToEmail: 'ahmed@example.com', createdAt: '2025-01-10' },
  { id: '2', code: 'ZGFT-AAAA-BBBB', type: 'DIGITAL', initialBalance: 200, currentBalance: 200, isActive: true, sentToEmail: null, createdAt: '2025-01-12' },
  { id: '3', code: 'ZGFT-CCCC-DDDD', type: 'DIGITAL', initialBalance: 1000, currentBalance: 0, isActive: false, sentToEmail: 'sarah@example.com', createdAt: '2025-01-05' },
];

export default function AdminGiftCardsPage() {
  return (
    <div className="p-4 md:p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold">Gift Cards</h1>
        <Button variant="primary" size="sm"><Plus className="h-4 w-4" /> Generate Batch</Button>
      </div>
      <DataTable<GiftCardRow>
        data={CARDS}
        searchable
        columns={[
          { key: 'code', label: 'Code', render: (v) => <code className="font-mono text-accent bg-accent/10 px-2 py-0.5 rounded text-sm">{String(v)}</code> },
          { key: 'initialBalance', label: 'Value', render: (v) => `AED ${v}` },
          { key: 'currentBalance', label: 'Remaining', render: (v) => <span className={Number(v) === 0 ? 'text-error' : 'text-success'}>AED {String(v)}</span> },
          { key: 'sentToEmail', label: 'Sent To', render: (_v, row) => row.sentToEmail ? <span className="text-sm text-foreground-muted">{row.sentToEmail}</span> : <span className="text-foreground-subtle text-sm">â€”</span> },
          { key: 'isActive', label: 'Status', render: (v) => <Badge variant={v ? 'success' : 'error'} size="xs">{v ? 'Active' : 'Used'}</Badge> },
          { key: 'createdAt', label: 'Created', render: (v) => <span className="text-xs text-foreground-muted">{String(v)}</span> },
        ]}
      />
    </div>
  );
}