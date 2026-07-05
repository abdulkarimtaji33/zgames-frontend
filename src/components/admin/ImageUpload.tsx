'use client';

import { useRef, useState } from 'react';
import { Upload } from 'lucide-react';
import { adminStorageApi } from '@/lib/api/adminApi';
import { useAdminToast } from '@/hooks/useAdminToast';
import { Button } from '@/components/ui/Button';

interface ImageUploadProps {
  folder: 'products' | 'categories' | 'brands' | 'blogs' | 'avatars' | 'documents';
  value?: string;
  onChange: (url: string) => void;
  label?: string;
}

export function ImageUpload({ folder, value, onChange, label = 'Upload image' }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { show } = useAdminToast();
  const [uploading, setUploading] = useState(false);

  const handleFile = async (file: File) => {
    setUploading(true);
    try {
      const res = await adminStorageApi.presignedUpload(folder, file.name, file.type);
      const { uploadUrl, publicUrl } = res.data as { uploadUrl: string; publicUrl: string };
      await fetch(uploadUrl, { method: 'PUT', body: file, headers: { 'Content-Type': file.type } });
      onChange(publicUrl);
      show('Image uploaded', 'success');
    } catch {
      show('Upload failed — enter image URL manually', 'error');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      {value && (
        <div className="relative w-24 h-24 rounded-lg overflow-hidden border border-border bg-background-tertiary">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="" className="w-full h-full object-cover" />
        </div>
      )}
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
      <Button type="button" variant="secondary" size="sm" isLoading={uploading} onClick={() => inputRef.current?.click()}>
        <Upload className="h-4 w-4" /> {label}
      </Button>
    </div>
  );
}
