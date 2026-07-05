'use client';

import { useRef, useState } from 'react';
import { Star, Trash2, Upload, GripVertical } from 'lucide-react';
import { adminProductsApi, adminStorageApi } from '@/lib/api/adminApi';
import { useAdminToast } from '@/hooks/useAdminToast';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';
import { Button } from '@/components/ui/Button';
import type { ProductImage } from '@/types';

interface ProductImagesTabProps {
  productId: string;
  images: ProductImage[];
  onChange: (images: ProductImage[]) => void;
}

export function ProductImagesTab({ productId, images, onChange }: ProductImagesTabProps) {
  const { show } = useAdminToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState<ProductImage | null>(null);
  const sorted = [...images].sort((a, b) => a.sortOrder - b.sortOrder);

  const handleFiles = async (files: FileList) => {
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const presign = await adminStorageApi.presignedUpload('products', file.name, file.type);
        const { uploadUrl, publicUrl } = presign.data as { uploadUrl: string; publicUrl: string };
        await fetch(uploadUrl, { method: 'PUT', body: file, headers: { 'Content-Type': file.type } });
        const res = await adminProductsApi.addImage(productId, {
          url: publicUrl,
          isFeatured: images.length === 0,
          sortOrder: images.length,
        }) as { data: ProductImage } | { data: { data: ProductImage } };
        const created = ('data' in res.data ? (res.data as { data: ProductImage }).data : res.data) as ProductImage;
        onChange([...images, created]);
      }
      show('Image(s) uploaded', 'success');
    } catch {
      show('Failed to upload one or more images', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleSetPrimary = async (imageId: string) => {
    try {
      await adminProductsApi.setPrimaryImage(productId, imageId);
      onChange(images.map((img) => ({ ...img, isFeatured: img.id === imageId })));
    } catch {
      show('Failed to set primary image', 'error');
    }
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    try {
      await adminProductsApi.removeImage(productId, deleting.id);
      onChange(images.filter((img) => img.id !== deleting.id));
      show('Image removed', 'success');
    } catch {
      show('Failed to remove image', 'error');
    } finally {
      setDeleting(null);
    }
  };

  const handleReorder = async (draggedId: string, targetId: string) => {
    const ids = sorted.map((i) => i.id);
    const fromIdx = ids.indexOf(draggedId);
    const toIdx = ids.indexOf(targetId);
    if (fromIdx === -1 || toIdx === -1) return;
    const reordered = [...sorted];
    const [moved] = reordered.splice(fromIdx, 1);
    reordered.splice(toIdx, 0, moved);
    onChange(reordered.map((img, i) => ({ ...img, sortOrder: i })));
    try {
      await adminProductsApi.reorderImages(productId, reordered.map((i) => i.id));
    } catch {
      show('Failed to save image order', 'error');
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-foreground-muted">
        Upload product photos, drag to reorder, and mark one as the primary image shown in listings.
      </p>

      {sorted.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {sorted.map((img) => (
            <div
              key={img.id}
              draggable
              onDragStart={(e) => e.dataTransfer.setData('text/image-id', img.id)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const draggedId = e.dataTransfer.getData('text/image-id');
                if (draggedId && draggedId !== img.id) handleReorder(draggedId, img.id);
              }}
              className="group relative rounded-lg overflow-hidden border border-border bg-background-tertiary aspect-square cursor-grab"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.url} alt={img.altText ?? img.alt ?? ''} className="w-full h-full object-cover pointer-events-none" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors" />
              <div className="absolute top-1.5 left-1.5 p-1 rounded bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                <GripVertical className="h-3.5 w-3.5" />
              </div>
              {img.isFeatured && (
                <span className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded-full bg-accent text-white text-[10px] font-bold flex items-center gap-1">
                  <Star className="h-2.5 w-2.5 fill-current" /> Primary
                </span>
              )}
              <div className="absolute bottom-1.5 left-1.5 right-1.5 flex items-center justify-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                {!img.isFeatured && (
                  <button
                    type="button"
                    onClick={() => handleSetPrimary(img.id)}
                    className="p-1.5 rounded-md bg-black/60 text-white hover:bg-accent transition-colors"
                    title="Set as primary"
                  >
                    <Star className="h-3.5 w-3.5" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setDeleting(img)}
                  className="p-1.5 rounded-md bg-black/60 text-white hover:bg-error transition-colors"
                  title="Delete"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => e.target.files && e.target.files.length > 0 && handleFiles(e.target.files)}
      />
      <Button type="button" variant="secondary" size="sm" isLoading={uploading} onClick={() => inputRef.current?.click()}>
        <Upload className="h-4 w-4" /> Upload Image{sorted.length > 0 ? 's' : ''}
      </Button>

      <ConfirmDialog
        open={!!deleting}
        title="Delete Image"
        message="Remove this image from the product?"
        onConfirm={confirmDelete}
        onCancel={() => setDeleting(null)}
        destructive
      />
    </div>
  );
}
