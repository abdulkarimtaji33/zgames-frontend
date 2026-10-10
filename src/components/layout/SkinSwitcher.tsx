'use client';

import { useEffect, useState } from 'react';
import { Check, Palette } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { Dropdown, DropdownItem } from '@/components/ui/Dropdown';
import { SKIN_LABELS, SKINS, useSkin } from '@/lib/theme/skin';

export function SkinSwitcher({ className }: { className?: string }) {
  const { skin, setSkin } = useSkin();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <div className="h-9 w-9 sm:h-8 sm:w-8" aria-hidden />;
  }

  return (
    <Dropdown
      align="right"
      className={className}
      trigger={({ toggle }) => (
        <button
          onClick={toggle}
          className={cn(
            'relative h-9 w-9 sm:h-8 sm:w-8 grid place-items-center rounded-md text-foreground-muted transition-colors',
            'hover:text-foreground hover:bg-surface-1 active:scale-95',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          )}
          aria-label={`Switch theme (current: ${SKIN_LABELS[skin].name})`}
          title={`Switch theme (current: ${SKIN_LABELS[skin].name})`}
        >
          <Palette className="h-4 w-4" />
        </button>
      )}
    >
      <div className="px-3.5 pt-1.5 pb-1 text-xs font-medium uppercase tracking-wide text-foreground-subtle">
        Theme
      </div>
      {SKINS.map((s) => (
        <DropdownItem key={s} onClick={() => setSkin(s)} className="justify-between">
          <span className="flex flex-col items-start">
            <span className="font-medium">{SKIN_LABELS[s].name}</span>
            <span className="text-xs text-foreground-muted">{SKIN_LABELS[s].tagline}</span>
          </span>
          {skin === s && <Check className="h-4 w-4 text-accent shrink-0" />}
        </DropdownItem>
      ))}
    </Dropdown>
  );
}
