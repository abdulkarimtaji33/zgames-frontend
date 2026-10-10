'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { RefreshCw, DollarSign, ArrowLeft, Check, X, Pencil } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { DataTable, type Column } from '@/components/admin/DataTable';
import { useAdminToast } from '@/hooks/useAdminToast';
import { adminLikeCardApi, type GiftCardMarginRow } from '@/lib/api/adminApi';

const REGION_LABELS: Record<string, string> = {
  uae: 'UAE',
  ksa: 'Saudi Arabia',
  qatar: 'Qatar',
  kuwait: 'Kuwait',
  oman: 'Oman',
  bahrain: 'Bahrain',
};

function platformOf(name: string): string {
  const [first] = name.split(/—|-/);
  return first.trim();
}

function money(n: number) {
  return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function LikeCardMarginsPage() {
  const toast = useAdminToast((s) => s.show);
  const [rows, setRows] = useState<GiftCardMarginRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [platformFilter, setPlatformFilter] = useState('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [savingId, setSavingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await adminLikeCardApi.marginCatalog();
      setRows(res.data.data);
    } catch {
      toast('Failed to load gift card margins', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    load();
  }, [load]);

  const platforms = useMemo(() => {
    const set = new Set(rows.map((r) => platformOf(r.name)));
    return ['all', ...Array.from(set).sort()];
  }, [rows]);

  const filtered = useMemo(
    () => (platformFilter === 'all' ? rows : rows.filter((r) => platformOf(r.name) === platformFilter)),
    [rows, platformFilter],
  );

  const totals = useMemo(() => {
    const active = filtered.filter((r) => r.isActive);
    const totalMargin = active.reduce((sum, r) => sum + r.marginAmount, 0);
    const avgMarginPercent =
      active.length > 0 ? active.reduce((sum, r) => sum + (r.marginPercent ?? 0), 0) / active.length : 0;
    return { count: filtered.length, activeCount: active.length, totalMargin, avgMarginPercent };
  }, [filtered]);

  const startEdit = (row: GiftCardMarginRow) => {
    setEditingId(row.productId);
    setEditValue(String(row.price));
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditValue('');
  };

  const saveEdit = async (row: GiftCardMarginRow) => {
    const price = Number(editValue);
    if (!Number.isFinite(price) || price <= 0) {
      toast('Enter a valid price greater than 0', 'error');
      return;
    }
    setSavingId(row.productId);
    try {
      const res = await adminLikeCardApi.updateSellingPrice(row.productId, price);
      setRows((prev) => prev.map((r) => (r.productId === row.productId ? res.data.data : r)));
      toast('Price updated', 'success');
      setEditingId(null);
    } catch {
      toast('Failed to update price', 'error');
    } finally {
      setSavingId(null);
    }
  };

  const columns: Column<GiftCardMarginRow>[] = [
    {
      key: 'name',
      label: 'Gift Card',
      sortable: true,
      render: (_v, row) => (
        <div>
          <p className="font-medium">{row.name}</p>
          <p className="text-xs text-foreground-subtle mt-0.5">{row.sku}</p>
        </div>
      ),
    },
    {
      key: 'region',
      label: 'Region',
      sortable: true,
      render: (v) => REGION_LABELS[v as string] ?? (v as string),
    },
    {
      key: 'costPrice',
      label: 'LikeCard cost',
      sortable: true,
      align: 'right',
      render: (v) => <span className="tabular-nums">{money(v as number)}</span>,
    },
    {
      key: 'likecardSellPrice',
      label: 'LikeCard suggests',
      sortable: true,
      align: 'right',
      render: (v) => (
        <span className="tabular-nums text-foreground-muted">
          {v === null ? '—' : money(v as number)}
        </span>
      ),
    },
    {
      key: 'price',
      label: 'Your price',
      sortable: true,
      align: 'right',
      render: (v, row) => {
        if (editingId === row.productId) {
          return (
            <div className="flex items-center justify-end gap-1.5">
              <input
                autoFocus
                type="number"
                step="0.01"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') saveEdit(row);
                  if (e.key === 'Escape') cancelEdit();
                }}
                className="w-24 rounded-md border border-border bg-background px-2 py-1 text-sm text-right tabular-nums focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <button
                onClick={() => saveEdit(row)}
                disabled={savingId === row.productId}
                className="rounded-md p-1 text-success hover:bg-success/10"
                aria-label="Save price"
              >
                <Check className="h-4 w-4" />
              </button>
              <button
                onClick={cancelEdit}
                className="rounded-md p-1 text-foreground-muted hover:bg-background-tertiary"
                aria-label="Cancel"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          );
        }
        return (
          <button
            onClick={() => startEdit(row)}
            className="group flex items-center justify-end gap-1.5 w-full tabular-nums hover:text-accent"
          >
            <span className="font-medium">{money(v as number)}</span>
            <Pencil className="h-3 w-3 opacity-0 group-hover:opacity-100 text-foreground-subtle" />
          </button>
        );
      },
    },
    {
      key: 'marginPercent',
      label: 'Margin',
      sortable: true,
      align: 'right',
      render: (_v, row) => {
        const positive = row.marginAmount > 0;
        const zero = row.marginAmount === 0;
        return (
          <div className="text-right">
            <span
              className={`font-medium tabular-nums ${positive ? 'text-success' : zero ? 'text-foreground-muted' : 'text-error'}`}
            >
              {row.marginPercent === null ? '—' : `${row.marginPercent > 0 ? '+' : ''}${row.marginPercent}%`}
            </span>
            <p className={`text-xs tabular-nums ${positive ? 'text-success' : zero ? 'text-foreground-subtle' : 'text-error'}`}>
              {row.marginAmount > 0 ? '+' : ''}
              {money(row.marginAmount)}
            </p>
          </div>
        );
      },
    },
    {
      key: 'isActive',
      label: 'Status',
      render: (v) => (
        <Badge variant={v ? 'success' : 'default'} size="sm">
          {v ? 'Sellable' : 'Unavailable'}
        </Badge>
      ),
    },
  ];

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <Link
            href="/admin/integrations/likecard"
            className="inline-flex items-center gap-1 text-xs text-foreground-muted hover:text-foreground mb-2"
          >
            <ArrowLeft className="h-3 w-3" /> LikeCard Integration
          </Link>
          <h1 className="font-heading text-2xl font-bold flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-accent" /> Gift Card Margins
          </h1>
          <p className="text-sm text-foreground-muted mt-1">
            What LikeCard charges us, what they suggest reselling at, and what we actually charge — click any price
            to edit it.
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={load} isLoading={isLoading}>
          <RefreshCw className="h-4 w-4" /> Refresh
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-xl bg-card border border-border p-4">
          <p className="text-xs text-foreground-muted">Gift cards listed</p>
          <p className="text-2xl font-bold mt-1 tabular-nums">{totals.count}</p>
        </div>
        <div className="rounded-xl bg-card border border-border p-4">
          <p className="text-xs text-foreground-muted">Currently sellable</p>
          <p className="text-2xl font-bold mt-1 tabular-nums">{totals.activeCount}</p>
        </div>
        <div className="rounded-xl bg-card border border-border p-4">
          <p className="text-xs text-foreground-muted">Avg margin (sellable)</p>
          <p className={`text-2xl font-bold mt-1 tabular-nums ${totals.avgMarginPercent > 0 ? 'text-success' : 'text-foreground-muted'}`}>
            {totals.avgMarginPercent.toFixed(1)}%
          </p>
        </div>
        <div className="rounded-xl bg-card border border-border p-4">
          <p className="text-xs text-foreground-muted">Total margin (sellable, per unit)</p>
          <p className={`text-2xl font-bold mt-1 tabular-nums ${totals.totalMargin > 0 ? 'text-success' : 'text-foreground-muted'}`}>
            {money(totals.totalMargin)}
          </p>
        </div>
      </div>

      <DataTable
        data={filtered}
        columns={columns}
        isLoading={isLoading}
        searchable
        searchPlaceholder="Search gift cards..."
        emptyMessage="No LikeCard gift cards synced yet."
        filters={
          <select
            value={platformFilter}
            onChange={(e) => setPlatformFilter(e.target.value)}
            className="rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {platforms.map((p) => (
              <option key={p} value={p}>
                {p === 'all' ? 'All platforms' : p}
              </option>
            ))}
          </select>
        }
      />
    </div>
  );
}
