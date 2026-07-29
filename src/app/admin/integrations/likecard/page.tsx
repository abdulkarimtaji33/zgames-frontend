'use client';

import { useCallback, useEffect, useState } from 'react';
import { RefreshCw, Wallet, PlugZap, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { FormField, FormInput } from '@/components/admin/FormField';
import { useAdminToast } from '@/hooks/useAdminToast';
import {
  adminLikeCardApi,
  type LikeCardBalance,
  type LikeCardSyncResult,
  type LikeCardSyncStatus,
} from '@/lib/api/adminApi';

export default function AdminLikeCardIntegrationPage() {
  const toast = useAdminToast((s) => s.show);

  const [status, setStatus] = useState<{ configured: boolean; circuitOpen: boolean } | null>(null);
  const [balance, setBalance] = useState<LikeCardBalance | null>(null);
  const [syncStatus, setSyncStatus] = useState<LikeCardSyncStatus | null>(null);
  const [lastSync, setLastSync] = useState<LikeCardSyncResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [markupPercent, setMarkupPercent] = useState('');

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const [statusRes, syncStatusRes] = await Promise.all([
        adminLikeCardApi.status(),
        adminLikeCardApi.syncStatus(),
      ]);
      setStatus(statusRes.data.data);
      setSyncStatus(syncStatusRes.data.data);
      if (statusRes.data.data.configured) {
        const balanceRes = await adminLikeCardApi.balance();
        setBalance(balanceRes.data.data);
      }
    } catch {
      toast('Failed to load LikeCard integration status', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    load();
  }, [load]);

  const handleRefreshBalance = async () => {
    try {
      const res = await adminLikeCardApi.balance();
      setBalance(res.data.data);
      toast('Balance refreshed', 'success');
    } catch {
      toast('Failed to refresh balance', 'error');
    }
  };

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const res = await adminLikeCardApi.syncPlaystation(markupPercent ? Number(markupPercent) : undefined);
      setLastSync(res.data.data);
      toast(`Sync complete: ${res.data.data.productsCreated} created, ${res.data.data.productsUpdated} updated`, 'success');
      await load();
    } catch {
      toast('PlayStation catalog sync failed', 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 flex justify-center">
        <div className="h-8 w-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold flex items-center gap-2">
            <PlugZap className="h-5 w-5 text-accent" /> LikeCard Integration
          </h1>
          <p className="text-sm text-foreground-muted mt-1">
            Wholesale digital-goods supplier — staff-only. Never surfaced to customers.
          </p>
        </div>
        <Badge variant={status?.configured ? 'success' : 'warning'} size="sm">
          {status?.configured ? 'Configured' : 'Not Configured'}
        </Badge>
      </div>

      {!status?.configured && (
        <div className="rounded-xl border border-warning/30 bg-warning/10 p-4 flex gap-3">
          <AlertTriangle className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-warning">LikeCard credentials are not configured yet</p>
            <p className="text-foreground-muted mt-1">
              Set LIKECARD_DEVICE_ID, LIKECARD_EMAIL and LIKECARD_SECURITY_CODE in the backend .env once the
              account owner has revealed credentials from portal.likecard.com. This is expected until then —
              not an error.
            </p>
          </div>
        </div>
      )}

      {status?.circuitOpen && (
        <div className="rounded-xl border border-error/30 bg-error/10 p-4 flex gap-3">
          <AlertTriangle className="h-5 w-5 text-error flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-error">Order creation is paused</p>
            <p className="text-foreground-muted mt-1">
              create_order timed out repeatedly. A health check is polling LikeCard every 60s; new orders will
              resume automatically once it responds normally again.
            </p>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        <section className="rounded-xl bg-card border border-border p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-heading font-bold flex items-center gap-2">
              <Wallet className="h-4 w-4 text-accent" /> Wallet Balance
            </h2>
            <Button variant="ghost" size="sm" onClick={handleRefreshBalance} disabled={!status?.configured}>
              <RefreshCw className="h-3.5 w-3.5" />
            </Button>
          </div>
          {balance?.configured ? (
            <p className="text-3xl font-bold text-accent">
              {balance.balance !== undefined ? Number(balance.balance).toFixed(2) : '—'} <span className="text-sm font-normal text-foreground-muted">{balance.currency ?? ''}</span>
            </p>
          ) : (
            <p className="text-sm text-foreground-muted">Not available — credentials not configured.</p>
          )}
        </section>

        <section className="rounded-xl bg-card border border-border p-5 space-y-4">
          <h2 className="font-heading font-bold">Catalog Link Status</h2>
          {syncStatus ? (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-foreground-muted">Variants linked to LikeCard</span>
                <span className="font-medium">{syncStatus.linkedVariants} / {syncStatus.totalVariants}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-foreground-muted">Digital products not yet mapped</span>
                <span className="font-medium">{syncStatus.unlinkedProducts.length}</span>
              </div>
            </div>
          ) : (
            <p className="text-sm text-foreground-muted">No data yet.</p>
          )}
        </section>
      </div>

      <section className="rounded-xl bg-card border border-border p-5 space-y-4">
        <h2 className="font-heading font-bold">PlayStation Catalog Sync</h2>
        <p className="text-sm text-foreground-muted">
          Pulls PlayStation regional categories/products from LikeCard and upserts local products with a flat
          markup on top of LikeCard&apos;s cost price. Product names/descriptions shown to customers are written
          fresh — LikeCard&apos;s own branding is never used.
        </p>
        <div className="flex items-end gap-3">
          <FormField label="Markup % override (optional)" className="max-w-[220px]">
            <FormInput
              type="number"
              value={markupPercent}
              onChange={(e) => setMarkupPercent(e.target.value)}
              placeholder="Uses LIKECARD_MARKUP_PERCENT"
            />
          </FormField>
          <Button variant="primary" size="sm" onClick={handleSync} isLoading={isSyncing} disabled={!status?.configured}>
            <RefreshCw className="h-4 w-4" /> Sync PlayStation Catalog
          </Button>
        </div>

        {lastSync && (
          <div className="mt-4 rounded-lg border border-border bg-background-tertiary p-4 space-y-2 text-sm">
            <p className="flex items-center gap-1.5 font-medium text-success">
              <CheckCircle2 className="h-4 w-4" /> Last sync: {lastSync.productsCreated} created, {lastSync.productsUpdated} updated
            </p>
            {lastSync.regionsFound.length > 0 && (
              <p className="text-foreground-muted">
                Regions synced: {lastSync.regionsFound.map((r) => r.region.toUpperCase()).join(', ')}
              </p>
            )}
            {lastSync.skippedNoRegionMatch.length > 0 && (
              <p className="text-warning">
                Skipped (no region match): {lastSync.skippedNoRegionMatch.join(', ')}
              </p>
            )}
          </div>
        )}

        {syncStatus && syncStatus.unlinkedProducts.length > 0 && (
          <div className="mt-4">
            <p className="text-sm font-medium mb-2">Unmapped digital products</p>
            <div className="rounded-lg border border-border divide-y divide-border max-h-64 overflow-y-auto">
              {syncStatus.unlinkedProducts.map((p) => (
                <div key={p.variantId} className="px-3 py-2 text-sm flex justify-between">
                  <span>{p.name}</span>
                  <span className="text-foreground-subtle text-xs">{p.variantId.slice(0, 8)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
