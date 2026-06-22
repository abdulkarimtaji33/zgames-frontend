'use client';

import { GitCompare } from 'lucide-react';
import Link from 'next/link';
import { useCompareStore } from '@/store/compareStore';

export default function ComparePage() {
  const { productIds, removeProduct } = useCompareStore();
  return (
    <div>
      <h1 className="font-heading text-2xl font-bold mb-6">Compare Products ({productIds.length}/4)</h1>
      {productIds.length === 0 ? (
        <div className="text-center py-16 rounded-xl bg-card border border-border">
          <GitCompare className="h-14 w-14 text-foreground-subtle mx-auto mb-4" />
          <h2 className="font-heading text-xl font-bold mb-2">Nothing to compare</h2>
          <p className="text-foreground-muted mb-6">Add products to compare their specs side-by-side.</p>
          <Link href="/en" className="inline-flex px-6 py-2.5 rounded-full bg-accent text-white font-semibold text-sm hover:bg-accent-hover transition-colors">Browse Products</Link>
        </div>
      ) : (
        <div className="rounded-xl bg-card border border-border p-5">
          <p className="text-foreground-muted mb-4">Comparison table coming soon. Products selected: {productIds.join(', ')}</p>
          <button onClick={() => productIds.forEach(removeProduct)} className="text-sm text-error hover:underline">Clear All</button>
        </div>
      )}
    </div>
  );
}