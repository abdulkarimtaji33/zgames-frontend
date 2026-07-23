'use client';

import { useCallback, useEffect, useState } from 'react';
import { AlertTriangle, ArrowLeftRight, TrendingDown, SlidersHorizontal, Boxes, Hash } from 'lucide-react';
import { DataTable } from '@/components/admin/DataTable';
import { AdminModal } from '@/components/admin/AdminModal';
import { AdminPagination } from '@/components/admin/AdminPagination';
import { FormField, FormInput, FormSelect, FormTextarea } from '@/components/admin/FormField';
import { StatCard } from '@/components/admin/StatCard';
import { Button } from '@/components/ui/Button';
import { usePaginatedList } from '@/hooks/usePaginatedList';
import { useAdminToast } from '@/hooks/useAdminToast';
import { adminInventoryApi, adminWarehousesApi } from '@/lib/api/adminApi';
import type { PaginatedResponse } from '@/types';

interface InventoryRow {
  id: string;
  productId: string;
  warehouseId: string;
  quantity: number;
  reservedQuantity?: number;
  reorderPoint?: number;
  product?: { id: string; name: string; sku?: string };
  warehouse?: { id: string; name: string };
}

interface WarehouseOption {
  id: string;
  name: string;
}

const emptyAdjust = { productId: '', warehouseId: '', quantity: '', reason: '' };
const emptyTransfer = { productId: '', fromWarehouseId: '', toWarehouseId: '', quantity: '', notes: '' };

export default function AdminInventoryPage() {
  const toast = useAdminToast((s) => s.show);
  const [lowStockItems, setLowStockItems] = useState<InventoryRow[]>([]);
  const [warehouses, setWarehouses] = useState<WarehouseOption[]>([]);
  const [adjustOpen, setAdjustOpen] = useState(false);
  const [transferOpen, setTransferOpen] = useState(false);
  const [adjustForm, setAdjustForm] = useState(emptyAdjust);
  const [transferForm, setTransferForm] = useState(emptyTransfer);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetcher = useCallback(
    (params: Record<string, unknown>) =>
      adminInventoryApi.findAll(params) as unknown as Promise<{ data: { data: PaginatedResponse<InventoryRow> } }>,
    [],
  );

  const { items, page, setPage, total, totalPages, isLoading, reload } =
    usePaginatedList<InventoryRow>({ fetcher, limit: 20 });

  const loadLowStock = useCallback(async () => {
    try {
      const res = await adminInventoryApi.lowStock(10);
      const data = res.data?.data ?? res.data ?? [];
      setLowStockItems(Array.isArray(data) ? (data as InventoryRow[]) : []);
    } catch {
      setLowStockItems([]);
    }
  }, []);

  useEffect(() => {
    loadLowStock();
    adminWarehousesApi
      .findAll()
      .then((res) => {
        const list = (res.data.data ?? []) as unknown as WarehouseOption[];
        setWarehouses(list);
      })
      .catch(() => setWarehouses([]));
  }, [loadLowStock]);

  const outOfStock = items.filter((i) => i.quantity === 0).length;
  const totalUnits = items.reduce((s, i) => s + i.quantity, 0);

  const handleAdjust = async () => {
    const qty = Number(adjustForm.quantity);
    if (!adjustForm.productId || !adjustForm.warehouseId || !adjustForm.quantity || Number.isNaN(qty) || qty === 0) {
      toast('Product, warehouse, and non-zero quantity are required', 'error');
      return;
    }
    setIsSubmitting(true);
    try {
      await adminInventoryApi.adjust({
        productId: adjustForm.productId,
        warehouseId: adjustForm.warehouseId,
        quantity: Math.abs(qty),
        type: qty > 0 ? 'adjustment' : 'damage',
        notes: adjustForm.reason || undefined,
      });
      toast('Stock adjusted successfully', 'success');
      setAdjustOpen(false);
      setAdjustForm(emptyAdjust);
      reload();
      loadLowStock();
    } catch {
      toast('Failed to adjust stock', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTransfer = async () => {
    const qty = Number(transferForm.quantity);
    if (
      !transferForm.productId ||
      !transferForm.fromWarehouseId ||
      !transferForm.toWarehouseId ||
      !transferForm.quantity ||
      Number.isNaN(qty) ||
      qty <= 0
    ) {
      toast('All transfer fields are required', 'error');
      return;
    }
    if (transferForm.fromWarehouseId === transferForm.toWarehouseId) {
      toast('Source and destination warehouses must differ', 'error');
      return;
    }
    setIsSubmitting(true);
    try {
      await adminInventoryApi.transfer({
        productId: transferForm.productId,
        fromWarehouseId: transferForm.fromWarehouseId,
        toWarehouseId: transferForm.toWarehouseId,
        quantity: qty,
        notes: transferForm.notes || undefined,
      });
      toast('Stock transferred successfully', 'success');
      setTransferOpen(false);
      setTransferForm(emptyTransfer);
      reload();
      loadLowStock();
    } catch {
      toast('Failed to transfer stock', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="font-heading text-2xl font-bold">Inventory</h1>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={() => setAdjustOpen(true)}>
            <SlidersHorizontal className="h-4 w-4" /> Adjust Stock
          </Button>
          <Button variant="primary" size="sm" onClick={() => setTransferOpen(true)}>
            <ArrowLeftRight className="h-4 w-4" /> Transfer
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total SKUs" value={String(total)} color="text-info" icon={<Boxes className="h-4 w-4" />} />
        <StatCard
          title="Low Stock Items"
          value={String(lowStockItems.length)}
          change={lowStockItems.length ? 'needs reorder' : undefined}
          icon={<AlertTriangle className="h-4 w-4" />}
          color="text-warning"
        />
        <StatCard
          title="Out of Stock"
          value={String(outOfStock)}
          icon={<TrendingDown className="h-4 w-4" />}
          color="text-error"
        />
        <StatCard title="Total Units" value={String(totalUnits)} color="text-success" icon={<Hash className="h-4 w-4" />} />
      </div>

      {lowStockItems.length > 0 && (
        <div className="rounded-xl bg-warning/5 border border-warning/20 p-4">
          <p className="text-sm font-medium text-warning flex items-center gap-2 mb-2">
            <AlertTriangle className="h-4 w-4" /> {lowStockItems.length} items below reorder threshold
          </p>
          <div className="flex flex-wrap gap-2">
            {lowStockItems.map((i) => (
              <span
                key={i.id}
                className="text-xs bg-warning/10 text-warning border border-warning/20 px-2 py-0.5 rounded"
              >
                {i.product?.name ?? i.productId.slice(0, 8)} ({i.quantity} left)
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-xl bg-card border border-border shadow-sm overflow-hidden">
        <DataTable
          data={items}
          isLoading={isLoading}
          searchable
          columns={[
            {
              key: 'product',
              label: 'Product',
              render: (v, row) => (
                <div>
                  <p className="font-medium text-sm">{(v as InventoryRow['product'])?.name ?? 'Unknown'}</p>
                  <p className="text-xs text-foreground-muted font-mono">
                    {(v as InventoryRow['product'])?.sku ?? row.productId.slice(0, 8)}
                  </p>
                </div>
              ),
            },
            {
              key: 'warehouse',
              label: 'Warehouse',
              render: (v) => (v as InventoryRow['warehouse'])?.name ?? '—',
            },
            {
              key: 'quantity',
              label: 'In Stock',
              sortable: true,
              align: 'right',
              render: (v, row) => (
                <span
                  className={`font-bold ${
                    Number(v) <= (row.reorderPoint ?? 10) ? 'text-error' : 'text-success'
                  }`}
                >
                  {String(v)}
                </span>
              ),
            },
            {
              key: 'reservedQuantity',
              label: 'Reserved',
              align: 'right',
              render: (v) => <span className="text-foreground-muted">{String(v ?? 0)}</span>,
            },
            {
              key: 'reorderPoint',
              label: 'Threshold',
              align: 'right',
              render: (v) => String(v ?? 10),
            },
          ]}
          emptyMessage="No inventory records found."
        />
        <AdminPagination page={page} totalPages={totalPages} total={total} onPageChange={setPage} />
      </div>

      <AdminModal
        open={adjustOpen}
        title="Adjust Stock"
        submitLabel="Adjust"
        isSubmitting={isSubmitting}
        onClose={() => {
          setAdjustOpen(false);
          setAdjustForm(emptyAdjust);
        }}
        onSubmit={handleAdjust}
      >
        <div className="space-y-4">
          <FormField label="Product ID">
            <FormInput
              value={adjustForm.productId}
              onChange={(e) => setAdjustForm({ ...adjustForm, productId: e.target.value })}
              placeholder="UUID"
            />
          </FormField>
          <FormField label="Warehouse">
            <FormSelect
              value={adjustForm.warehouseId}
              onChange={(e) => setAdjustForm({ ...adjustForm, warehouseId: e.target.value })}
            >
              <option value="">Select warehouse</option>
              {warehouses.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name}
                </option>
              ))}
            </FormSelect>
          </FormField>
          <FormField label="Quantity" hint="Use negative values to decrease stock">
            <FormInput
              type="number"
              value={adjustForm.quantity}
              onChange={(e) => setAdjustForm({ ...adjustForm, quantity: e.target.value })}
              placeholder="e.g. 10 or -5"
            />
          </FormField>
          <FormField label="Reason">
            <FormTextarea
              value={adjustForm.reason}
              onChange={(e) => setAdjustForm({ ...adjustForm, reason: e.target.value })}
              placeholder="Reason for adjustment"
            />
          </FormField>
        </div>
      </AdminModal>

      <AdminModal
        open={transferOpen}
        title="Transfer Stock"
        submitLabel="Transfer"
        isSubmitting={isSubmitting}
        onClose={() => {
          setTransferOpen(false);
          setTransferForm(emptyTransfer);
        }}
        onSubmit={handleTransfer}
      >
        <div className="space-y-4">
          <FormField label="Product ID">
            <FormInput
              value={transferForm.productId}
              onChange={(e) => setTransferForm({ ...transferForm, productId: e.target.value })}
              placeholder="UUID"
            />
          </FormField>
          <FormField label="From Warehouse">
            <FormSelect
              value={transferForm.fromWarehouseId}
              onChange={(e) => setTransferForm({ ...transferForm, fromWarehouseId: e.target.value })}
            >
              <option value="">Select source</option>
              {warehouses.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name}
                </option>
              ))}
            </FormSelect>
          </FormField>
          <FormField label="To Warehouse">
            <FormSelect
              value={transferForm.toWarehouseId}
              onChange={(e) => setTransferForm({ ...transferForm, toWarehouseId: e.target.value })}
            >
              <option value="">Select destination</option>
              {warehouses.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name}
                </option>
              ))}
            </FormSelect>
          </FormField>
          <FormField label="Quantity">
            <FormInput
              type="number"
              min={1}
              value={transferForm.quantity}
              onChange={(e) => setTransferForm({ ...transferForm, quantity: e.target.value })}
            />
          </FormField>
          <FormField label="Notes">
            <FormTextarea
              value={transferForm.notes}
              onChange={(e) => setTransferForm({ ...transferForm, notes: e.target.value })}
              placeholder="Optional notes"
            />
          </FormField>
        </div>
      </AdminModal>
    </div>
  );
}
