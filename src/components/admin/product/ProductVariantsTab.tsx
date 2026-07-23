'use client';

import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Check, X } from 'lucide-react';
import { adminProductsApi, adminAttributesApi } from '@/lib/api/adminApi';
import { useAdminToast } from '@/hooks/useAdminToast';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import type { ProductVariant } from '@/types';

interface AttributeOption { id: string; value: string; label: string; colorCode?: string | null }
interface AttributeDef { id: string; name: string; type?: string; options?: AttributeOption[] }

interface ProductVariantsTabProps {
  productId: string;
  variants: ProductVariant[];
  onChange: (variants: ProductVariant[]) => void;
}

interface VariantFormState {
  sku: string;
  price: string;
  salePrice: string;
  isActive: boolean;
  optionsByAttribute: Record<string, string>;
}

function emptyVariantForm(): VariantFormState {
  return { sku: '', price: '', salePrice: '', isActive: true, optionsByAttribute: {} };
}

export function ProductVariantsTab({ productId, variants, onChange }: ProductVariantsTabProps) {
  const { show } = useAdminToast();
  const [attributes, setAttributes] = useState<AttributeDef[]>([]);
  const [form, setForm] = useState<VariantFormState>(emptyVariantForm());
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<VariantFormState>(emptyVariantForm());
  const [deleting, setDeleting] = useState<ProductVariant | null>(null);

  useEffect(() => {
    adminAttributesApi.findAll()
      .then((res) => {
        const data = res.data.data;
        const list = Array.isArray(data) ? data : (data as unknown as { items?: AttributeDef[] })?.items ?? [];
        setAttributes(list as unknown as AttributeDef[]);
      })
      .catch(() => setAttributes([]));
  }, []);

  const optionLabel = (attributeId: string, optionId: string) => {
    const attr = attributes.find((a) => a.id === attributeId);
    return attr?.options?.find((o) => o.id === optionId)?.label ?? optionId;
  };

  const buildOptionsPayload = (byAttr: Record<string, string>) =>
    Object.entries(byAttr).filter(([, optionId]) => optionId).map(([attributeId, optionId]) => ({ attributeId, optionId }));

  const handleAdd = async () => {
    if (!form.sku.trim() || !form.price) {
      show('SKU and price are required', 'error');
      return;
    }
    setAdding(true);
    try {
      const payload = {
        sku: form.sku.trim(),
        price: Number(form.price),
        salePrice: form.salePrice ? Number(form.salePrice) : undefined,
        isActive: form.isActive,
        options: buildOptionsPayload(form.optionsByAttribute),
        sortOrder: variants.length,
      };
      const res = await adminProductsApi.addVariant(productId, payload) as { data: ProductVariant } | { data: { data: ProductVariant } };
      const created = ('data' in res.data ? (res.data as { data: ProductVariant }).data : res.data) as ProductVariant;
      onChange([...variants, created]);
      setForm(emptyVariantForm());
      show('Variant added', 'success');
    } catch {
      show('Failed to add variant — SKU may already exist', 'error');
    } finally {
      setAdding(false);
    }
  };

  const startEdit = (v: ProductVariant) => {
    setEditingId(v.id);
    const byAttr: Record<string, string> = {};
    (v.options ?? []).forEach((o) => { byAttr[o.attributeId] = o.optionId; });
    setEditForm({
      sku: v.sku,
      price: String(v.price),
      salePrice: v.salePrice != null ? String(v.salePrice) : '',
      isActive: v.isActive,
      optionsByAttribute: byAttr,
    });
  };

  const saveEdit = async (variantId: string) => {
    try {
      const payload = {
        sku: editForm.sku.trim(),
        price: Number(editForm.price),
        salePrice: editForm.salePrice ? Number(editForm.salePrice) : undefined,
        isActive: editForm.isActive,
        options: buildOptionsPayload(editForm.optionsByAttribute),
      };
      await adminProductsApi.updateVariant(productId, variantId, payload);
      onChange(variants.map((v) => (v.id === variantId ? { ...v, ...payload } : v)));
      setEditingId(null);
      show('Variant updated', 'success');
    } catch {
      show('Failed to update variant', 'error');
    }
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    try {
      await adminProductsApi.removeVariant(productId, deleting.id);
      onChange(variants.filter((v) => v.id !== deleting.id));
      show('Variant removed', 'success');
    } catch {
      show('Failed to remove variant', 'error');
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-foreground-muted">
        Variants let you sell this product in different configurations (size, color, denomination) each with its own SKU, price and status.
        Stock levels are managed on the <a href="/admin/inventory" className="text-accent hover:underline">Inventory</a> page.
      </p>

      {variants.length > 0 && (
        <div className="rounded-lg border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-background-tertiary border-b border-border">
                <tr>
                  <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-foreground-muted">SKU</th>
                  <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-foreground-muted">Options</th>
                  <th className="px-3 py-2.5 text-right text-xs font-semibold uppercase tracking-wider text-foreground-muted">Price</th>
                  <th className="px-3 py-2.5 text-right text-xs font-semibold uppercase tracking-wider text-foreground-muted">Sale</th>
                  <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-foreground-muted">Status</th>
                  <th className="px-3 py-2.5 text-right text-xs font-semibold uppercase tracking-wider text-foreground-muted">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {variants.map((v) => (
                  <tr key={v.id}>
                    {editingId === v.id ? (
                      <>
                        <td className="px-3 py-2"><input value={editForm.sku} onChange={(e) => setEditForm((f) => ({ ...f, sku: e.target.value }))} className="w-28 px-2 py-1 rounded bg-background-tertiary border border-border text-xs font-mono" /></td>
                        <td className="px-3 py-2">
                          <div className="flex flex-wrap gap-1.5">
                            {attributes.map((attr) => (
                              <select
                                key={attr.id}
                                value={editForm.optionsByAttribute[attr.id] ?? ''}
                                onChange={(e) => setEditForm((f) => ({ ...f, optionsByAttribute: { ...f.optionsByAttribute, [attr.id]: e.target.value } }))}
                                className="px-1.5 py-1 rounded bg-background-tertiary border border-border text-xs"
                              >
                                <option value="">{attr.name}: —</option>
                                {(attr.options ?? []).map((o) => <option key={o.id} value={o.id}>{attr.name}: {o.label}</option>)}
                              </select>
                            ))}
                          </div>
                        </td>
                        <td className="px-3 py-2 text-right"><input type="number" value={editForm.price} onChange={(e) => setEditForm((f) => ({ ...f, price: e.target.value }))} className="w-20 px-2 py-1 rounded bg-background-tertiary border border-border text-xs text-right tabular-nums" /></td>
                        <td className="px-3 py-2 text-right"><input type="number" value={editForm.salePrice} onChange={(e) => setEditForm((f) => ({ ...f, salePrice: e.target.value }))} className="w-20 px-2 py-1 rounded bg-background-tertiary border border-border text-xs text-right tabular-nums" placeholder="—" /></td>
                        <td className="px-3 py-2">
                          <input type="checkbox" checked={editForm.isActive} onChange={(e) => setEditForm((f) => ({ ...f, isActive: e.target.checked }))} className="accent-accent h-4 w-4" />
                        </td>
                        <td className="px-3 py-2 text-right whitespace-nowrap">
                          <button onClick={() => saveEdit(v.id)} className="p-1.5 rounded text-success hover:bg-success/10"><Check className="h-4 w-4" /></button>
                          <button onClick={() => setEditingId(null)} className="p-1.5 rounded text-foreground-muted hover:bg-background-tertiary"><X className="h-4 w-4" /></button>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-3 py-2.5 font-medium font-mono text-xs">{v.sku}</td>
                        <td className="px-3 py-2.5">
                          <div className="flex flex-wrap gap-1">
                            {(v.options ?? []).map((o, i) => (
                              <Badge key={i} variant="default" size="xs">{optionLabel(o.attributeId, o.optionId)}</Badge>
                            ))}
                          </div>
                        </td>
                        <td className="px-3 py-2.5 text-right tabular-nums">AED {Number(v.price).toFixed(2)}</td>
                        <td className="px-3 py-2.5 text-right tabular-nums">{v.salePrice != null ? `AED ${Number(v.salePrice).toFixed(2)}` : '—'}</td>
                        <td className="px-3 py-2.5">
                          <Badge variant={v.isActive ? 'success' : 'error'} size="xs">{v.isActive ? 'Active' : 'Inactive'}</Badge>
                        </td>
                        <td className="px-3 py-2.5 text-right whitespace-nowrap">
                          <button onClick={() => startEdit(v)} className="p-1.5 rounded text-foreground-muted hover:bg-background-tertiary hover:text-foreground"><Pencil className="h-3.5 w-3.5" /></button>
                          <button onClick={() => setDeleting(v)} className="p-1.5 rounded text-foreground-muted hover:bg-error/10 hover:text-error"><Trash2 className="h-3.5 w-3.5" /></button>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="rounded-lg border border-dashed border-border p-4 space-y-3">
        <h4 className="text-sm font-semibold">Add a variant</h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <input
            value={form.sku}
            onChange={(e) => setForm((f) => ({ ...f, sku: e.target.value }))}
            placeholder="SKU"
            className="px-2.5 py-2 rounded-lg bg-background-tertiary border border-border text-sm font-mono focus:outline-none focus:border-accent"
          />
          <input
            type="number" min={0} step="0.01"
            value={form.price}
            onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
            placeholder="Price (AED)"
            className="px-2.5 py-2 rounded-lg bg-background-tertiary border border-border text-sm focus:outline-none focus:border-accent"
          />
          <input
            type="number" min={0} step="0.01"
            value={form.salePrice}
            onChange={(e) => setForm((f) => ({ ...f, salePrice: e.target.value }))}
            placeholder="Sale price"
            className="px-2.5 py-2 rounded-lg bg-background-tertiary border border-border text-sm focus:outline-none focus:border-accent"
          />
          <label className="flex items-center gap-2 px-2.5">
            <input type="checkbox" checked={form.isActive} onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))} className="accent-accent h-4 w-4" />
            <span className="text-sm">Active</span>
          </label>
        </div>
        {attributes.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {attributes.map((attr) => (
              <select
                key={attr.id}
                value={form.optionsByAttribute[attr.id] ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, optionsByAttribute: { ...f.optionsByAttribute, [attr.id]: e.target.value } }))}
                className="px-2.5 py-2 rounded-lg bg-background-tertiary border border-border text-sm focus:outline-none focus:border-accent"
              >
                <option value="">{attr.name}: none</option>
                {(attr.options ?? []).map((o) => <option key={o.id} value={o.id}>{attr.name}: {o.label}</option>)}
              </select>
            ))}
          </div>
        )}
        <Button type="button" variant="secondary" size="sm" onClick={handleAdd} isLoading={adding}>
          <Plus className="h-4 w-4" /> Add Variant
        </Button>
      </div>

      <ConfirmDialog
        open={!!deleting}
        title="Delete Variant"
        message={`Remove variant "${deleting?.sku}"?`}
        onConfirm={confirmDelete}
        onCancel={() => setDeleting(null)}
        destructive
      />
    </div>
  );
}
