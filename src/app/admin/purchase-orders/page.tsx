'use client';

import { useCallback, useEffect, useState } from 'react';
import { Plus, PackageCheck, Eye } from 'lucide-react';
import { DataTable } from '@/components/admin/DataTable';
import { AdminModal } from '@/components/admin/AdminModal';
import { AdminPagination } from '@/components/admin/AdminPagination';
import { FormField, FormInput, FormSelect } from '@/components/admin/FormField';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { usePaginatedList } from '@/hooks/usePaginatedList';
import { useAdminToast } from '@/hooks/useAdminToast';
import {
  adminPurchaseOrdersApi,
  adminSuppliersApi,
  adminWarehousesApi,
} from '@/lib/api/adminApi';
import type { PaginatedResponse } from '@/types';

interface PORow {
  id: string;
  orderNumber?: string;
  status: string;
  total?: number;
  supplier?: { id: string; name: string };
  warehouse?: { id: string; name: string };
  createdAt: string;
}

interface POItem {
  id: string;
  productId: string;
  quantity: number;
  unitCost: number;
  receivedQuantity?: number;
}

interface PODetail extends PORow {
  notes?: string;
  items?: POItem[];
}

interface SelectOption {
  id: string;
  name: string;
}

interface CreateItemRow {
  productId: string;
  quantity: string;
  unitCost: string;
}

const STATUS_VARIANT: Record<string, 'default' | 'success' | 'warning' | 'error' | 'info'> = {
  draft: 'warning',
  sent: 'info',
  confirmed: 'info',
  receiving: 'info',
  received: 'success',
  cancelled: 'error',
};

const STATUS_ACTIONS: { label: string; status: string }[] = [
  { label: 'Pending', status: 'draft' },
  { label: 'Ordered', status: 'sent' },
  { label: 'Confirmed', status: 'confirmed' },
  { label: 'Received', status: 'received' },
  { label: 'Cancelled', status: 'cancelled' },
];

export default function AdminPurchaseOrdersPage() {
  const toast = useAdminToast((s) => s.show);
  const [suppliers, setSuppliers] = useState<SelectOption[]>([]);
  const [warehouses, setWarehouses] = useState<SelectOption[]>([]);
  const [viewOpen, setViewOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [receiveOpen, setReceiveOpen] = useState(false);
  const [selected, setSelected] = useState<PODetail | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  const [createForm, setCreateForm] = useState({
    supplierId: '',
    warehouseId: '',
    notes: '',
  });
  const [createItems, setCreateItems] = useState<CreateItemRow[]>([
    { productId: '', quantity: '1', unitCost: '0' },
  ]);
  const [receiveQty, setReceiveQty] = useState<Record<string, string>>({});

  const fetcher = useCallback(
    (params: Record<string, unknown>) =>
      adminPurchaseOrdersApi.findAll(params) as unknown as Promise<{ data: { data: PaginatedResponse<PORow> } }>,
    [],
  );

  const { items, page, setPage, total, totalPages, isLoading, reload } =
    usePaginatedList<PORow>({ fetcher, limit: 20 });

  useEffect(() => {
    adminSuppliersApi
      .findAll({ limit: 100 })
      .then((res) => setSuppliers((res.data.data.items ?? []) as unknown as SelectOption[]))
      .catch(() => setSuppliers([]));
    adminWarehousesApi
      .findAll()
      .then((res) => setWarehouses((res.data.data ?? []) as unknown as SelectOption[]))
      .catch(() => setWarehouses([]));
  }, []);

  const loadDetail = async (id: string) => {
    setIsLoadingDetail(true);
    try {
      const res = await adminPurchaseOrdersApi.findOne(id);
      const detail = res.data.data as PODetail;
      setSelected(detail);
      const qtyMap: Record<string, string> = {};
      (detail.items ?? []).forEach((item) => {
        qtyMap[item.id] = String(item.quantity - (item.receivedQuantity ?? 0));
      });
      setReceiveQty(qtyMap);
      return detail;
    } catch {
      toast('Failed to load purchase order', 'error');
      return null;
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const openView = async (row: PORow) => {
    const detail = await loadDetail(row.id);
    if (detail) setViewOpen(true);
  };

  const handleCreate = async () => {
    if (!createForm.supplierId || !createForm.warehouseId) {
      toast('Supplier and warehouse are required', 'error');
      return;
    }
    const itemsPayload = createItems
      .filter((i) => i.productId.trim())
      .map((i) => ({
        productId: i.productId.trim(),
        quantity: Number(i.quantity),
        unitCost: Number(i.unitCost),
      }));
    if (itemsPayload.length === 0 || itemsPayload.some((i) => !i.quantity || i.quantity < 1)) {
      toast('At least one valid item is required', 'error');
      return;
    }
    setIsSubmitting(true);
    try {
      await adminPurchaseOrdersApi.create({
        supplierId: createForm.supplierId,
        warehouseId: createForm.warehouseId,
        notes: createForm.notes || undefined,
        items: itemsPayload,
      });
      toast('Purchase order created', 'success');
      setCreateOpen(false);
      setCreateForm({ supplierId: '', warehouseId: '', notes: '' });
      setCreateItems([{ productId: '', quantity: '1', unitCost: '0' }]);
      reload();
    } catch {
      toast('Failed to create purchase order', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusUpdate = async (status: string) => {
    if (!selected) return;
    setIsSubmitting(true);
    try {
      await adminPurchaseOrdersApi.updateStatus(selected.id, status);
      toast(`Status updated to ${status}`, 'success');
      const detail = await loadDetail(selected.id);
      if (detail) reload();
    } catch {
      toast('Failed to update status', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReceive = async () => {
    if (!selected) return;
    const receivedItems: Record<string, number> = {};
    for (const [itemId, qtyStr] of Object.entries(receiveQty)) {
      const qty = Number(qtyStr);
      if (qty > 0) receivedItems[itemId] = qty;
    }
    if (Object.keys(receivedItems).length === 0) {
      toast('Enter at least one received quantity', 'error');
      return;
    }
    setIsSubmitting(true);
    try {
      await adminPurchaseOrdersApi.receive(selected.id, { receivedItems });
      toast('Items received and inventory updated', 'success');
      setReceiveOpen(false);
      const detail = await loadDetail(selected.id);
      if (detail) reload();
    } catch {
      toast('Failed to receive items', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const canReceive =
    selected && ['confirmed', 'receiving'].includes(selected.status);

  return (
    <div className="p-4 md:p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold">Purchase Orders</h1>
        <Button variant="primary" size="sm" onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4" /> Create PO
        </Button>
      </div>

      <div className="rounded-xl bg-card border border-border overflow-hidden">
        <DataTable
          data={items}
          isLoading={isLoading}
          searchable
          columns={[
            {
              key: 'orderNumber',
              label: 'PO #',
              render: (v, row) => String(v ?? row.id.slice(0, 8)),
            },
            {
              key: 'supplier',
              label: 'Supplier',
              render: (v) => (v as PORow['supplier'])?.name ?? '—',
            },
            {
              key: 'total',
              label: 'Total',
              render: (v) => (v ? `AED ${Number(v).toFixed(2)}` : '—'),
            },
            {
              key: 'status',
              label: 'Status',
              render: (v) => (
                <Badge variant={STATUS_VARIANT[String(v)] ?? 'default'} size="xs">
                  {String(v)}
                </Badge>
              ),
            },
            {
              key: 'createdAt',
              label: 'Date',
              render: (v) => new Date(String(v)).toLocaleDateString(),
            },
          ]}
          actions={(row) => (
            <button
              onClick={() => openView(row)}
              className="p-1.5 rounded hover:bg-background-tertiary text-foreground-muted hover:text-foreground transition-colors"
              title="View"
            >
              <Eye className="h-3.5 w-3.5" />
            </button>
          )}
          emptyMessage="No purchase orders found."
        />
        <AdminPagination page={page} totalPages={totalPages} total={total} onPageChange={setPage} />
      </div>

      <AdminModal
        open={createOpen}
        title="Create Purchase Order"
        submitLabel="Create"
        wide
        isSubmitting={isSubmitting}
        onClose={() => {
          setCreateOpen(false);
          setCreateForm({ supplierId: '', warehouseId: '', notes: '' });
          setCreateItems([{ productId: '', quantity: '1', unitCost: '0' }]);
        }}
        onSubmit={handleCreate}
      >
        <div className="space-y-4">
          <FormField label="Supplier">
            <FormSelect
              value={createForm.supplierId}
              onChange={(e) => setCreateForm({ ...createForm, supplierId: e.target.value })}
            >
              <option value="">Select supplier</option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </FormSelect>
          </FormField>
          <FormField label="Warehouse">
            <FormSelect
              value={createForm.warehouseId}
              onChange={(e) => setCreateForm({ ...createForm, warehouseId: e.target.value })}
            >
              <option value="">Select warehouse</option>
              {warehouses.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name}
                </option>
              ))}
            </FormSelect>
          </FormField>
          <FormField label="Notes">
            <FormInput
              value={createForm.notes}
              onChange={(e) => setCreateForm({ ...createForm, notes: e.target.value })}
              placeholder="Optional notes"
            />
          </FormField>
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium">Items</label>
              <Button
                variant="ghost"
                size="xs"
                onClick={() =>
                  setCreateItems([...createItems, { productId: '', quantity: '1', unitCost: '0' }])
                }
              >
                + Add Item
              </Button>
            </div>
            <div className="space-y-2">
              {createItems.map((item, idx) => (
                <div key={idx} className="grid grid-cols-3 gap-2">
                  <FormInput
                    value={item.productId}
                    onChange={(e) => {
                      const next = [...createItems];
                      next[idx] = { ...next[idx], productId: e.target.value };
                      setCreateItems(next);
                    }}
                    placeholder="Product ID"
                  />
                  <FormInput
                    type="number"
                    min={1}
                    value={item.quantity}
                    onChange={(e) => {
                      const next = [...createItems];
                      next[idx] = { ...next[idx], quantity: e.target.value };
                      setCreateItems(next);
                    }}
                    placeholder="Qty"
                  />
                  <FormInput
                    type="number"
                    min={0}
                    step="0.01"
                    value={item.unitCost}
                    onChange={(e) => {
                      const next = [...createItems];
                      next[idx] = { ...next[idx], unitCost: e.target.value };
                      setCreateItems(next);
                    }}
                    placeholder="Unit cost"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </AdminModal>

      <AdminModal
        open={viewOpen}
        title={selected ? `PO ${selected.orderNumber ?? selected.id.slice(0, 8)}` : 'Purchase Order'}
        wide
        onClose={() => {
          setViewOpen(false);
          setSelected(null);
        }}
      >
        {isLoadingDetail || !selected ? (
          <div className="flex justify-center py-8">
            <div className="h-8 w-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={STATUS_VARIANT[selected.status] ?? 'default'} size="sm">
                {selected.status}
              </Badge>
              <span className="text-sm text-foreground-muted">
                {selected.supplier?.name ?? '—'} · {selected.warehouse?.name ?? '—'}
              </span>
              {selected.total != null && (
                <span className="text-sm font-bold text-accent ml-auto">
                  AED {Number(selected.total).toFixed(2)}
                </span>
              )}
            </div>

            {selected.notes && (
              <p className="text-sm text-foreground-muted border-l-2 border-border pl-3">
                {selected.notes}
              </p>
            )}

            <div>
              <h3 className="text-sm font-semibold mb-2">Items</h3>
              <div className="rounded-lg border border-border divide-y divide-border">
                {(selected.items ?? []).map((item) => (
                  <div key={item.id} className="px-3 py-2 flex justify-between text-sm">
                    <div>
                      <p className="font-mono text-xs">{item.productId.slice(0, 8)}...</p>
                      <p className="text-foreground-muted">
                        Qty: {item.quantity} · Received: {item.receivedQuantity ?? 0}
                      </p>
                    </div>
                    <span>AED {(item.quantity * item.unitCost).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold mb-2">Update Status</h3>
              <div className="flex flex-wrap gap-2">
                {STATUS_ACTIONS.map(({ label, status }) => (
                  <Button
                    key={status}
                    variant={selected.status === status ? 'primary' : 'secondary'}
                    size="xs"
                    disabled={isSubmitting || selected.status === status}
                    onClick={() => handleStatusUpdate(status)}
                  >
                    {label}
                  </Button>
                ))}
              </div>
            </div>

            {canReceive && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => setReceiveOpen(true)}
              >
                <PackageCheck className="h-4 w-4" /> Receive Items
              </Button>
            )}
          </div>
        )}
      </AdminModal>

      <AdminModal
        open={receiveOpen}
        title="Receive Items"
        submitLabel="Confirm Receive"
        isSubmitting={isSubmitting}
        onClose={() => setReceiveOpen(false)}
        onSubmit={handleReceive}
      >
        <div className="space-y-3">
          {(selected?.items ?? []).map((item) => (
            <div key={item.id} className="flex items-center gap-3">
              <div className="flex-1 text-sm">
                <p className="font-mono text-xs">{item.productId.slice(0, 8)}...</p>
                <p className="text-foreground-muted">
                  Ordered: {item.quantity} · Already received: {item.receivedQuantity ?? 0}
                </p>
              </div>
              <FormInput
                type="number"
                min={0}
                max={item.quantity - (item.receivedQuantity ?? 0)}
                className="w-24"
                value={receiveQty[item.id] ?? ''}
                onChange={(e) =>
                  setReceiveQty({ ...receiveQty, [item.id]: e.target.value })
                }
              />
            </div>
          ))}
        </div>
      </AdminModal>
    </div>
  );
}
