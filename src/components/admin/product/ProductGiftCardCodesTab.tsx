'use client';

import { useEffect, useState, useCallback } from 'react';
import { Upload, Trash2, Settings2, RefreshCw } from 'lucide-react';
import { adminGiftCardCodesApi, type GiftCardCode, type GiftCardCodeStat, type GiftCardSupplierConfig } from '@/lib/api/adminApi';
import { useAdminToast } from '@/hooks/useAdminToast';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import type { ProductVariant } from '@/types';

interface ProductGiftCardCodesTabProps {
  productId: string;
  variants: ProductVariant[];
}

function emptySupplierForm(): GiftCardSupplierConfig {
  return { enabled: false, apiUrl: '', apiKey: '', method: 'POST', bodyTemplate: '', codePath: 'codes' };
}

export function ProductGiftCardCodesTab({ productId, variants }: ProductGiftCardCodesTabProps) {
  const { show } = useAdminToast();
  const [stats, setStats] = useState<GiftCardCodeStat[]>([]);
  const [selectedVariantId, setSelectedVariantId] = useState<string>('');
  const [codes, setCodes] = useState<GiftCardCode[]>([]);
  const [bulkText, setBulkText] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isLoadingCodes, setIsLoadingCodes] = useState(false);
  const [deleting, setDeleting] = useState<GiftCardCode | null>(null);
  const [showSupplierConfig, setShowSupplierConfig] = useState(false);
  const [supplierForm, setSupplierForm] = useState<GiftCardSupplierConfig>(emptySupplierForm());
  const [isSavingSupplier, setIsSavingSupplier] = useState(false);

  const noVariants = variants.length === 0;

  const loadStats = useCallback(() => {
    adminGiftCardCodesApi.stats(productId).then((res) => setStats(res.data.data ?? [])).catch(() => setStats([]));
  }, [productId]);

  const loadCodes = useCallback((variantId: string) => {
    if (!variantId) { setCodes([]); return; }
    setIsLoadingCodes(true);
    adminGiftCardCodesApi.list(productId, variantId)
      .then((res) => setCodes(res.data.data ?? []))
      .catch(() => setCodes([]))
      .finally(() => setIsLoadingCodes(false));
  }, [productId]);

  useEffect(() => { loadStats(); }, [loadStats]);
  useEffect(() => {
    if (!selectedVariantId && variants.length > 0) setSelectedVariantId(variants[0].id);
  }, [variants, selectedVariantId]);
  useEffect(() => { loadCodes(selectedVariantId); }, [selectedVariantId, loadCodes]);

  useEffect(() => {
    const variant = variants.find((v) => v.id === selectedVariantId) as (ProductVariant & { giftCardSupplierConfig?: GiftCardSupplierConfig }) | undefined;
    setSupplierForm(variant?.giftCardSupplierConfig ?? emptySupplierForm());
  }, [selectedVariantId, variants]);

  const statFor = (variantId: string) => stats.find((s) => s.variantId === variantId) ?? { available: 0, sold: 0, disabled: 0 };

  const handleUpload = async () => {
    const codesList = bulkText.split('\n').map((c) => c.trim()).filter(Boolean);
    if (codesList.length === 0) {
      show('Paste at least one code', 'error');
      return;
    }
    if (!selectedVariantId) {
      show('Select a denomination/variant first', 'error');
      return;
    }
    setIsUploading(true);
    try {
      await adminGiftCardCodesApi.bulkUpload(productId, codesList, selectedVariantId);
      show(`${codesList.length} code(s) uploaded`, 'success');
      setBulkText('');
      loadStats();
      loadCodes(selectedVariantId);
    } catch {
      show('Failed to upload codes', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    try {
      await adminGiftCardCodesApi.remove(deleting.id);
      setCodes((prev) => prev.filter((c) => c.id !== deleting.id));
      loadStats();
      show('Code removed', 'success');
    } catch {
      show('Failed to remove code — it may already be sold', 'error');
    } finally {
      setDeleting(null);
    }
  };

  const saveSupplierConfig = async () => {
    if (!selectedVariantId) return;
    setIsSavingSupplier(true);
    try {
      await adminGiftCardCodesApi.configureSupplier(selectedVariantId, supplierForm);
      show('Supplier settings saved', 'success');
      setShowSupplierConfig(false);
    } catch {
      show('Failed to save supplier settings', 'error');
    } finally {
      setIsSavingSupplier(false);
    }
  };

  if (noVariants) {
    return (
      <div className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-foreground-muted">
        Add at least one variant (e.g. AED 50 / 100 / 250 denomination) in the <strong>Variants</strong> tab first —
        code inventory is tracked per denomination.
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <p className="text-sm text-foreground-muted">
        Upload your bulk-purchased redemption codes here (e.g. actual PlayStation/Xbox/Steam codes). One code is automatically
        assigned and emailed to the customer per unit purchased. Optionally connect a supplier API to auto-restock when local
        stock runs out.
      </p>

      <div className="flex flex-wrap gap-2">
        {variants.map((v) => {
          const s = statFor(v.id);
          const low = s.available < 5;
          return (
            <button
              key={v.id}
              onClick={() => setSelectedVariantId(v.id)}
              className={`px-3 py-2 rounded-lg border text-sm text-left transition-colors ${selectedVariantId === v.id ? 'border-accent bg-accent/10' : 'border-border hover:border-border-hover'}`}
            >
              <div className="font-mono font-medium">{v.sku}</div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Badge variant={low ? 'error' : 'success'} size="xs">{s.available} in stock</Badge>
                <span className="text-xs text-foreground-subtle">{s.sold} sold</span>
              </div>
            </button>
          );
        })}
      </div>

      {selectedVariantId && (
        <>
          <div className="rounded-lg border border-dashed border-border p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold flex items-center gap-2"><Upload className="h-4 w-4 text-accent" /> Bulk upload codes</h4>
              <button
                type="button"
                onClick={() => setShowSupplierConfig((v) => !v)}
                className="text-xs text-accent hover:underline flex items-center gap-1"
              >
                <Settings2 className="h-3.5 w-3.5" /> Supplier API
              </button>
            </div>
            <textarea
              value={bulkText}
              onChange={(e) => setBulkText(e.target.value)}
              placeholder={'Paste one code per line, e.g.\nXXXX-XXXX-XXXX\nYYYY-YYYY-YYYY'}
              rows={5}
              className="w-full px-3 py-2 rounded-lg bg-background-tertiary border border-border text-sm font-mono focus:outline-none focus:border-accent"
            />
            <Button type="button" variant="secondary" size="sm" onClick={handleUpload} isLoading={isUploading}>
              <Upload className="h-4 w-4" /> Upload Codes
            </Button>

            {showSupplierConfig && (
              <div className="mt-2 pt-3 border-t border-border space-y-3">
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={supplierForm.enabled} onChange={(e) => setSupplierForm((f) => ({ ...f, enabled: e.target.checked }))} className="accent-accent h-4 w-4" />
                  Auto-fetch from supplier API when stock runs out
                </label>
                <input
                  value={supplierForm.apiUrl}
                  onChange={(e) => setSupplierForm((f) => ({ ...f, apiUrl: e.target.value }))}
                  placeholder="Supplier API URL"
                  className="w-full px-2.5 py-2 rounded-lg bg-background-tertiary border border-border text-sm focus:outline-none focus:border-accent"
                />
                <input
                  value={supplierForm.apiKey}
                  onChange={(e) => setSupplierForm((f) => ({ ...f, apiKey: e.target.value }))}
                  placeholder="API key (sent as Bearer token)"
                  className="w-full px-2.5 py-2 rounded-lg bg-background-tertiary border border-border text-sm focus:outline-none focus:border-accent"
                />
                <div className="grid grid-cols-2 gap-3">
                  <select
                    value={supplierForm.method}
                    onChange={(e) => setSupplierForm((f) => ({ ...f, method: e.target.value as 'GET' | 'POST' }))}
                    className="px-2.5 py-2 rounded-lg bg-background-tertiary border border-border text-sm"
                  >
                    <option value="POST">POST</option>
                    <option value="GET">GET</option>
                  </select>
                  <input
                    value={supplierForm.codePath}
                    onChange={(e) => setSupplierForm((f) => ({ ...f, codePath: e.target.value }))}
                    placeholder="Response path to codes, e.g. data.codes"
                    className="px-2.5 py-2 rounded-lg bg-background-tertiary border border-border text-sm focus:outline-none focus:border-accent"
                  />
                </div>
                <input
                  value={supplierForm.bodyTemplate}
                  onChange={(e) => setSupplierForm((f) => ({ ...f, bodyTemplate: e.target.value }))}
                  placeholder='Request body template, e.g. {"sku":"{{sku}}","qty":{{quantity}}}'
                  className="w-full px-2.5 py-2 rounded-lg bg-background-tertiary border border-border text-sm font-mono focus:outline-none focus:border-accent"
                />
                <p className="text-xs text-foreground-subtle">
                  Adjust the URL, headers and response path to match your specific supplier&apos;s API contract before enabling.
                </p>
                <Button type="button" variant="primary" size="sm" onClick={saveSupplierConfig} isLoading={isSavingSupplier}>
                  Save Supplier Settings
                </Button>
              </div>
            )}
          </div>

          <div className="rounded-lg border border-border overflow-hidden">
            <div className="flex items-center justify-between px-3 py-2 bg-background-tertiary border-b border-border">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground-muted">Code inventory</h4>
              <button onClick={() => loadCodes(selectedVariantId)} className="text-foreground-muted hover:text-foreground">
                <RefreshCw className="h-3.5 w-3.5" />
              </button>
            </div>
            {isLoadingCodes ? (
              <div className="p-6 flex justify-center"><div className="h-6 w-6 border-2 border-accent border-t-transparent rounded-full animate-spin" /></div>
            ) : codes.length === 0 ? (
              <p className="p-4 text-sm text-foreground-muted text-center">No codes uploaded for this denomination yet.</p>
            ) : (
              <div className="max-h-72 overflow-y-auto divide-y divide-border">
                {codes.map((c) => (
                  <div key={c.id} className="flex items-center justify-between px-3 py-2 text-sm">
                    <code className="font-mono">{c.status === 'sold' ? `${c.code.slice(0, 4)}••••••••` : c.code}</code>
                    <div className="flex items-center gap-2">
                      <Badge variant={c.status === 'available' ? 'success' : c.status === 'sold' ? 'default' : 'error'} size="xs">{c.status}</Badge>
                      {c.status === 'available' && (
                        <button onClick={() => setDeleting(c)} className="p-1 rounded text-foreground-muted hover:bg-error/10 hover:text-error">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      <ConfirmDialog
        open={!!deleting}
        title="Delete Code"
        message="Remove this unused code from inventory?"
        onConfirm={confirmDelete}
        onCancel={() => setDeleting(null)}
        destructive
      />
    </div>
  );
}
