'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Plus, ChevronRight, ChevronDown, Search, GripVertical, Package, Home } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { AdminModal } from '@/components/admin/AdminModal';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';
import { CrudActions } from '@/components/admin/CrudActions';
import { FormField, FormInput, FormSelect, FormTextarea } from '@/components/admin/FormField';
import { ImageUpload } from '@/components/admin/ImageUpload';
import { adminCategoriesApi, adminProductsApi } from '@/lib/api/adminApi';
import { useAdminToast } from '@/hooks/useAdminToast';
import type { Category, Product } from '@/types';

interface CategoryNode extends Category {
  isActive?: boolean;
  parentId?: string;
}

interface CategoryForm {
  name: string;
  description: string;
  parentId: string;
  image: string;
  isActive: boolean;
  isFeatured: boolean;
}

const emptyForm: CategoryForm = {
  name: '',
  description: '',
  parentId: '',
  image: '',
  isActive: true,
  isFeatured: false,
};

function flattenForSelect(categories: CategoryNode[], depth = 0, excludeId?: string): { id: string; label: string }[] {
  const result: { id: string; label: string }[] = [];
  for (const cat of categories) {
    if (cat.id === excludeId) continue;
    result.push({ id: cat.id, label: `${'— '.repeat(depth)}${cat.name}` });
    if (cat.children?.length) {
      result.push(...flattenForSelect(cat.children as CategoryNode[], depth + 1, excludeId));
    }
  }
  return result;
}

/** Returns true if `cat` or any of its descendants match the search query. */
function matchesSearch(cat: CategoryNode, query: string): boolean {
  if (!query) return true;
  if (cat.name.toLowerCase().includes(query)) return true;
  return (cat.children ?? []).some((c) => matchesSearch(c as CategoryNode, query));
}

function CategoryTreeRow({
  cat,
  depth,
  siblings,
  productCounts,
  collapsed,
  onToggleCollapse,
  onEdit,
  onDelete,
  onReorder,
  onToggleActive,
  onToggleFeatured,
  togglingId,
  expandedProducts,
  onToggleProducts,
  productsCache,
  loadingProductsId,
  searchQuery,
}: {
  cat: CategoryNode;
  depth: number;
  siblings: CategoryNode[];
  productCounts: Record<string, number>;
  collapsed: Record<string, boolean>;
  onToggleCollapse: (id: string) => void;
  onEdit: (cat: CategoryNode) => void;
  onDelete: (cat: CategoryNode) => void;
  onReorder: (draggedId: string, targetId: string, siblings: CategoryNode[]) => void;
  onToggleActive: (cat: CategoryNode) => void;
  onToggleFeatured: (cat: CategoryNode) => void;
  togglingId: string | null;
  expandedProducts: Set<string>;
  onToggleProducts: (cat: CategoryNode) => void;
  productsCache: Record<string, Product[]>;
  loadingProductsId: string | null;
  searchQuery: string;
}) {
  const hasChildren = (cat.children ?? []).length > 0;
  const isCollapsed = collapsed[cat.id];
  const visibleChildren = (cat.children ?? []).filter((c) => matchesSearch(c as CategoryNode, searchQuery)) as CategoryNode[];
  const count = productCounts[cat.id] ?? 0;
  const isFeatured = Boolean((cat as CategoryNode & { isFeatured?: boolean }).isFeatured);
  const productsOpen = expandedProducts.has(cat.id);

  return (
    <>
      <div
        draggable
        onDragStart={(e) => e.dataTransfer.setData('text/category-id', cat.id)}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const draggedId = e.dataTransfer.getData('text/category-id');
          if (draggedId && draggedId !== cat.id) onReorder(draggedId, cat.id, siblings);
        }}
        className="group flex flex-wrap items-center justify-between gap-2 px-3 py-3 hover:bg-background-tertiary/50 transition-colors border-t border-border first:border-t-0"
        style={{ paddingLeft: `${12 + depth * 24}px` }}
      >
        <div className="flex items-center gap-2 min-w-0">
          <GripVertical className="h-4 w-4 text-foreground-subtle/50 cursor-grab flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
          {hasChildren ? (
            <button onClick={() => onToggleCollapse(cat.id)} className="p-0.5 rounded hover:bg-background-tertiary flex-shrink-0">
              {isCollapsed ? <ChevronRight className="h-4 w-4 text-foreground-muted" /> : <ChevronDown className="h-4 w-4 text-foreground-muted" />}
            </button>
          ) : (
            <span className="w-5 flex-shrink-0" />
          )}
          {cat.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={cat.image} alt="" className="h-8 w-8 rounded-full object-cover flex-shrink-0 border border-border" />
          ) : (
            <div className="h-8 w-8 rounded-full bg-accent/10 flex items-center justify-center text-accent font-bold text-sm flex-shrink-0">
              {cat.name[0]}
            </div>
          )}
          <div className="min-w-0">
            <p className="font-medium text-sm truncate">{cat.name}</p>
            <p className="text-xs text-foreground-muted">/{cat.slug}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => onToggleProducts(cat)}
            title="View products in this category"
            className={`hidden sm:flex items-center gap-1 text-xs rounded-md px-1.5 py-1 transition-colors ${productsOpen ? 'text-accent bg-accent/10' : 'text-foreground-muted hover:text-foreground hover:bg-background-tertiary'}`}
          >
            <Package className="h-3 w-3" /> {count}
            {productsOpen ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
          </button>
          <button
            onClick={() => onToggleActive(cat)}
            disabled={togglingId === cat.id}
            title={cat.isActive !== false ? 'Click to deactivate' : 'Click to activate'}
            className="disabled:opacity-50"
          >
            <Badge variant={cat.isActive !== false ? 'success' : 'error'} size="xs" className="cursor-pointer">
              {cat.isActive !== false ? 'Active' : 'Inactive'}
            </Badge>
          </button>
          <button
            onClick={() => onToggleFeatured(cat)}
            disabled={togglingId === cat.id}
            title={isFeatured ? 'Remove from homepage' : 'Show on homepage'}
            className="p-1.5 rounded-md hover:bg-accent/10 transition-colors disabled:opacity-50"
          >
            <Home className={`h-4 w-4 ${isFeatured ? 'fill-accent/20 text-accent' : 'text-foreground-subtle'}`} />
          </button>
          <CrudActions onEdit={() => onEdit(cat)} onDelete={() => onDelete(cat)} />
        </div>
        {productsOpen && (
          <div className="w-full mt-2 rounded-lg border border-border bg-background-tertiary/40 p-2" style={{ marginLeft: `${12 + depth * 24}px` }}>
            {loadingProductsId === cat.id ? (
              <p className="text-xs text-foreground-muted px-2 py-2">Loading products...</p>
            ) : (productsCache[cat.id]?.length ?? 0) === 0 ? (
              <p className="text-xs text-foreground-muted px-2 py-2">No products in this category yet.</p>
            ) : (
              <div className="divide-y divide-border">
                {productsCache[cat.id].map((p) => (
                  <Link
                    key={p.id}
                    href={`/admin/products/${p.id}`}
                    className="flex items-center justify-between gap-3 px-2 py-2 text-sm hover:bg-background-tertiary rounded-md transition-colors"
                  >
                    <span className="truncate">{p.name}</span>
                    <span className="flex items-center gap-2 flex-shrink-0 text-xs text-foreground-muted">
                      AED {Number(p.price).toFixed(2)}
                      <Badge variant={p.isActive ? 'success' : 'error'} size="xs">{p.isActive ? 'Active' : 'Inactive'}</Badge>
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      {!isCollapsed && visibleChildren.map((child) => (
        <CategoryTreeRow
          key={child.id}
          cat={child}
          depth={depth + 1}
          siblings={visibleChildren}
          productCounts={productCounts}
          collapsed={collapsed}
          onToggleCollapse={onToggleCollapse}
          onEdit={onEdit}
          onDelete={onDelete}
          onReorder={onReorder}
          onToggleActive={onToggleActive}
          onToggleFeatured={onToggleFeatured}
          togglingId={togglingId}
          expandedProducts={expandedProducts}
          onToggleProducts={onToggleProducts}
          productsCache={productsCache}
          loadingProductsId={loadingProductsId}
          searchQuery={searchQuery}
        />
      ))}
    </>
  );
}

export default function AdminCategoriesPage() {
  const { show } = useAdminToast();
  const [categories, setCategories] = useState<CategoryNode[]>([]);
  const [productCounts, setProductCounts] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [editing, setEditing] = useState<CategoryNode | null>(null);
  const [deleting, setDeleting] = useState<CategoryNode | null>(null);
  const [form, setForm] = useState<CategoryForm>(emptyForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [expandedProducts, setExpandedProducts] = useState<Set<string>>(new Set());
  const [productsCache, setProductsCache] = useState<Record<string, Product[]>>({});
  const [loadingProductsId, setLoadingProductsId] = useState<string | null>(null);

  const loadTree = useCallback(async () => {
    setIsLoading(true);
    try {
      const [treeRes, countsRes] = await Promise.all([
        adminCategoriesApi.tree(),
        adminCategoriesApi.productCounts().catch(() => ({ data: { data: {} } })),
      ]);
      setCategories((treeRes.data.data ?? []) as CategoryNode[]);
      setProductCounts(countsRes.data.data ?? {});
    } catch {
      setCategories([]);
      show('Failed to load categories', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [show]);

  useEffect(() => {
    loadTree();
  }, [loadTree]);

  const toggleCollapse = (id: string) => setCollapsed((c) => ({ ...c, [id]: !c[id] }));

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (cat: CategoryNode) => {
    setEditing(cat);
    setForm({
      name: cat.name,
      description: cat.description ?? '',
      parentId: cat.parentId ?? (cat as CategoryNode & { parent?: { id: string } }).parent?.id ?? '',
      image: cat.image ?? '',
      isActive: cat.isActive !== false,
      isFeatured: Boolean((cat as CategoryNode & { isFeatured?: boolean }).isFeatured),
    });
    setModalOpen(true);
  };

  const openDelete = (cat: CategoryNode) => {
    setDeleting(cat);
    setConfirmOpen(true);
  };

  const applyLocalUpdate = (id: string, patch: Partial<CategoryNode>) => {
    const apply = (nodes: CategoryNode[]): CategoryNode[] =>
      nodes.map((n) => (n.id === id ? { ...n, ...patch } : { ...n, children: n.children ? apply(n.children as CategoryNode[]) : n.children }));
    setCategories((prev) => apply(prev));
  };

  const handleToggleActive = async (cat: CategoryNode) => {
    const next = !(cat.isActive !== false);
    setTogglingId(cat.id);
    applyLocalUpdate(cat.id, { isActive: next });
    try {
      await adminCategoriesApi.update(cat.id, { isActive: next });
      show(next ? 'Category activated' : 'Category deactivated', 'success');
    } catch {
      applyLocalUpdate(cat.id, { isActive: cat.isActive });
      show('Failed to update category status', 'error');
    } finally {
      setTogglingId(null);
    }
  };

  const handleToggleFeatured = async (cat: CategoryNode) => {
    const current = Boolean((cat as CategoryNode & { isFeatured?: boolean }).isFeatured);
    const next = !current;
    setTogglingId(cat.id);
    applyLocalUpdate(cat.id, { isFeatured: next } as Partial<CategoryNode>);
    try {
      await adminCategoriesApi.update(cat.id, { isFeatured: next });
      show(next ? 'Added to homepage' : 'Removed from homepage', 'success');
    } catch {
      applyLocalUpdate(cat.id, { isFeatured: current } as Partial<CategoryNode>);
      show('Failed to update homepage visibility', 'error');
    } finally {
      setTogglingId(null);
    }
  };

  const handleToggleProducts = async (cat: CategoryNode) => {
    setExpandedProducts((prev) => {
      const next = new Set(prev);
      if (next.has(cat.id)) next.delete(cat.id);
      else next.add(cat.id);
      return next;
    });
    if (expandedProducts.has(cat.id) || productsCache[cat.id]) return;
    setLoadingProductsId(cat.id);
    try {
      const res = await adminProductsApi.findAll({ categoryId: cat.id, limit: 50 });
      const data = res.data.data;
      const items = Array.isArray(data) ? data : data?.items ?? [];
      setProductsCache((prev) => ({ ...prev, [cat.id]: items }));
    } catch {
      show('Failed to load products for this category', 'error');
    } finally {
      setLoadingProductsId(null);
    }
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      show('Name is required', 'error');
      return;
    }
    setIsSubmitting(true);
    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        parentId: form.parentId || undefined,
        image: form.image || undefined,
        isActive: form.isActive,
        isFeatured: form.isFeatured,
      };
      if (editing) {
        await adminCategoriesApi.update(editing.id, payload);
        show('Category updated', 'success');
      } else {
        await adminCategoriesApi.create(payload);
        show('Category created', 'success');
      }
      setModalOpen(false);
      loadTree();
    } catch {
      show(editing ? 'Failed to update category' : 'Failed to create category', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    setIsDeleting(true);
    try {
      await adminCategoriesApi.remove(deleting.id);
      show('Category deleted', 'success');
      setConfirmOpen(false);
      setDeleting(null);
      loadTree();
    } catch {
      show('Failed to delete category', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleReorder = async (draggedId: string, targetId: string, siblings: CategoryNode[]) => {
    const ids = siblings.map((s) => s.id);
    const fromIdx = ids.indexOf(draggedId);
    const toIdx = ids.indexOf(targetId);
    if (fromIdx === -1 || toIdx === -1) return;
    const reordered = [...siblings];
    const [moved] = reordered.splice(fromIdx, 1);
    reordered.splice(toIdx, 0, moved);

    // Optimistic update
    setCategories((prev) => {
      const applyOrder = (nodes: CategoryNode[]): CategoryNode[] =>
        nodes.map((n) => ({ ...n, children: n.children ? applyOrder(n.children as CategoryNode[]) : n.children }));
      const isTopLevel = prev.some((c) => c.id === draggedId);
      if (isTopLevel) return reordered;
      return applyOrder(prev.map((n) => (n.children?.some((c) => c.id === draggedId) ? { ...n, children: reordered } : n)));
    });

    try {
      await Promise.all(reordered.map((cat, index) => adminCategoriesApi.update(cat.id, { sortOrder: index })));
      show('Order updated', 'success');
    } catch {
      show('Failed to save new order', 'error');
      loadTree();
    }
  };

  const parentOptions = useMemo(() => flattenForSelect(categories, 0, editing?.id), [categories, editing]);
  const filteredCategories = useMemo(
    () => categories.filter((c) => matchesSearch(c, search.trim().toLowerCase())),
    [categories, search],
  );

  return (
    <div className="p-4 md:p-6 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-bold">Categories</h1>
          <p className="text-sm text-foreground-muted mt-0.5">Drag rows to reorder siblings. Click a row&apos;s arrow to collapse its children.</p>
        </div>
        <Button variant="primary" size="sm" onClick={openCreate}>
          <Plus className="h-4 w-4" /> Add Category
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-muted" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search categories..."
          className="w-full pl-9 pr-4 py-2 rounded-lg bg-background-tertiary border border-border text-sm text-foreground placeholder:text-foreground-subtle focus:outline-none focus:border-accent"
        />
      </div>

      <div className="rounded-xl bg-card border border-border overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="flex justify-center py-16">
            <div className="h-8 w-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16 px-6 text-center">
            <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center text-accent">
              <Package className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">
                {search ? 'No categories match your search.' : 'No categories yet.'}
              </p>
              <p className="text-sm text-foreground-muted mt-0.5">
                {search ? 'Try a different search term.' : 'Add your first category to start organizing products.'}
              </p>
            </div>
            {!search && (
              <Button variant="primary" size="sm" onClick={openCreate}>
                <Plus className="h-4 w-4" /> Add Category
              </Button>
            )}
          </div>
        ) : (
          filteredCategories.map((cat) => (
            <CategoryTreeRow
              key={cat.id}
              cat={cat}
              depth={0}
              siblings={filteredCategories}
              productCounts={productCounts}
              collapsed={collapsed}
              onToggleCollapse={toggleCollapse}
              onEdit={openEdit}
              onDelete={openDelete}
              onReorder={handleReorder}
              onToggleActive={handleToggleActive}
              onToggleFeatured={handleToggleFeatured}
              togglingId={togglingId}
              expandedProducts={expandedProducts}
              onToggleProducts={handleToggleProducts}
              productsCache={productsCache}
              loadingProductsId={loadingProductsId}
              searchQuery={search.trim().toLowerCase()}
            />
          ))
        )}
      </div>

      <AdminModal
        open={modalOpen}
        title={editing ? 'Edit Category' : 'Add Category'}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      >
        <div className="space-y-4">
          <FormField label="Name">
            <FormInput
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Category name"
            />
          </FormField>
          <FormField label="Image">
            <ImageUpload folder="categories" value={form.image} onChange={(url) => setForm((f) => ({ ...f, image: url }))} label="Upload category image" />
          </FormField>
          <FormField label="Description">
            <FormTextarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="Optional description"
            />
          </FormField>
          <FormField label="Parent Category">
            <FormSelect
              value={form.parentId}
              onChange={(e) => setForm((f) => ({ ...f, parentId: e.target.value }))}
            >
              <option value="">None (root)</option>
              {parentOptions.map((opt) => (
                <option key={opt.id} value={opt.id}>{opt.label}</option>
              ))}
            </FormSelect>
          </FormField>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
              className="accent-accent h-4 w-4"
            />
            <span className="text-sm text-foreground">Active</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.isFeatured}
              onChange={(e) => setForm((f) => ({ ...f, isFeatured: e.target.checked }))}
              className="accent-accent h-4 w-4"
            />
            <span className="text-sm text-foreground">Show on homepage (Shop by Category)</span>
          </label>
        </div>
      </AdminModal>

      <ConfirmDialog
        open={confirmOpen}
        title="Delete Category"
        message={`Are you sure you want to delete "${deleting?.name}"? This action cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => { setConfirmOpen(false); setDeleting(null); }}
        isLoading={isDeleting}
        destructive
      />
    </div>
  );
}
