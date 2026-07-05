'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  BookOpen, ChevronDown, Package, Tags, ShoppingBag, Gift, Sliders,
  Mail, Users, Settings, Truck, Star, Zap, Search,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface GuideStep {
  title: string;
  content: string[];
}

interface GuideSection {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  summary: string;
  link?: { href: string; label: string };
  steps: GuideStep[];
}

const SECTIONS: GuideSection[] = [
  {
    id: 'getting-started',
    icon: BookOpen,
    title: 'Getting Started',
    summary: 'The basics of navigating the admin panel.',
    steps: [
      {
        title: 'Sidebar navigation',
        content: [
          'Use the left sidebar to jump between modules (Products, Orders, Categories, Marketing, etc).',
          'Click the collapse arrow at the top of the sidebar to shrink it to icons-only on smaller screens.',
          'Sections with a dropdown arrow (like Marketing, Localization) expand to show sub-pages.',
        ],
      },
      {
        title: 'List pages',
        content: [
          'Most modules open to a searchable, filterable, paginated table.',
          'Use the search box to filter server-side (works even across thousands of records).',
          'Click column headers or use the filter dropdowns above the table to narrow results further.',
          'On mobile, row actions collapse into a "⋯" menu — tap it to see Edit/Delete/etc.',
        ],
      },
    ],
  },
  {
    id: 'products',
    icon: Package,
    title: 'Managing Products',
    summary: 'Create, edit, and organize your product catalog.',
    link: { href: '/admin/products', label: 'Go to Products' },
    steps: [
      {
        title: 'Creating a product',
        content: [
          'Go to Products → New Product.',
          'Fill in name, SKU, price, category, and brand. Choose a Product Type (Simple, Variable, Digital, Gift Card, etc).',
          'Upload a cover image, then save — you can add more images, variants and related products afterward.',
        ],
      },
      {
        title: 'Editing a product (tabs)',
        content: [
          'Details — core info: name, price, description, category, status.',
          'Images — drag to reorder, click a thumbnail to set it as primary, or delete.',
          'Variants — add SKU variations like size/color/denomination, each with its own price.',
          'Related Products — pick Related / Upsell / Cross-sell products shown on the storefront.',
        ],
      },
      {
        title: 'Attributes',
        content: [
          'Attributes (e.g. Color, Size) live under Attributes in the sidebar.',
          'Each attribute has Options (e.g. Red, Blue) — manage these from the attribute\'s edit modal before assigning them to variants.',
        ],
      },
    ],
  },
  {
    id: 'gift-cards',
    icon: Gift,
    title: 'Digital Gift Cards (PSN, Xbox, Steam, etc.)',
    summary: 'Sell third-party redemption codes with automatic delivery.',
    link: { href: '/admin/products', label: 'Go to Products' },
    steps: [
      {
        title: '1. Create the gift card product',
        content: [
          'Products → New Product → set Product Type to "Digital Gift Card".',
          'Add a variant for each denomination you sell (e.g. AED 50, AED 100, AED 250) in the Variants tab — each variant is priced and tracked separately.',
        ],
      },
      {
        title: '2. Upload your redemption codes',
        content: [
          'Open the product, go to the "Redemption Codes" tab (only visible for gift card products).',
          'Select a denomination, paste your bulk-purchased codes (one per line), and click Upload.',
          'The Available / Sold counters update live so you always know when you\'re running low.',
        ],
      },
      {
        title: '3. (Optional) Connect a supplier API',
        content: [
          'In the Redemption Codes tab, click "Supplier API" to configure automatic restocking.',
          'Enter your supplier\'s API URL, key, and the path to the codes in their response — the system will call it automatically whenever local stock runs short.',
        ],
      },
      {
        title: '4. What happens when a customer buys one',
        content: [
          'On successful payment, the system automatically assigns an unused code (or fetches one from the supplier API) and emails it to the customer.',
          'The customer can also view their delivered codes anytime under their account\'s "Gift Cards" page.',
          'If stock runs out and the supplier API is unavailable, the order is flagged — you\'ll get an email + in-app notification, and can manually paste a code on the Order detail page to fulfill it.',
        ],
      },
    ],
  },
  {
    id: 'categories',
    icon: Tags,
    title: 'Categories',
    summary: 'Organize your storefront navigation.',
    link: { href: '/admin/categories', label: 'Go to Categories' },
    steps: [
      {
        title: 'Building the tree',
        content: [
          'Categories support unlimited nesting — create a parent, then add children under it.',
          'Drag and drop siblings to reorder them; use the collapse arrows to manage deep trees.',
          'Each category shows a live product count badge so you can spot empty categories.',
        ],
      },
    ],
  },
  {
    id: 'orders',
    icon: ShoppingBag,
    title: 'Orders',
    summary: 'Track, fulfill and update customer orders.',
    link: { href: '/admin/orders', label: 'Go to Orders' },
    steps: [
      {
        title: 'Order lifecycle',
        content: [
          'Orders move through: Pending → Confirmed → Processing → Shipped → Delivered (or Cancelled/Returned).',
          'Update the status from the order detail page — some transitions trigger automatic customer emails (e.g. Shipped).',
          'Cash on Delivery orders are confirmed and notified immediately; card orders wait for a successful payment webhook.',
        ],
      },
      {
        title: 'Shipments',
        content: [
          'Add a carrier + tracking number from the order detail page to generate a shipment record.',
        ],
      },
    ],
  },
  {
    id: 'notifications',
    icon: Mail,
    title: 'Order & Admin Email Notifications',
    summary: 'Stay informed the moment something happens.',
    link: { href: '/admin/settings', label: 'Go to Settings' },
    steps: [
      {
        title: 'Setup',
        content: [
          'Go to Settings and set the "Admin Notification Email" — this is where new-order alerts and low-stock gift card warnings are sent.',
          'Customers automatically get an order confirmation email; you get a new-order alert email plus an in-app notification (bell icon, top right).',
        ],
      },
    ],
  },
  {
    id: 'attributes-variants',
    icon: Sliders,
    title: 'Attributes & Variants',
    summary: 'Model configurable products like size, color, storage.',
    link: { href: '/admin/attributes', label: 'Go to Attributes' },
    steps: [
      {
        title: 'Setting up an attribute',
        content: [
          'Create the attribute (e.g. "Color") and pick a type — Color types get a swatch picker for options.',
          'Add options (e.g. Red, Blue, Black) inline in the edit modal.',
          'Use these attributes when creating product variants so each variant can be filtered/selected by shoppers.',
        ],
      },
    ],
  },
  {
    id: 'customers',
    icon: Users,
    title: 'Customers & Reviews',
    summary: 'Manage your customer base and moderate feedback.',
    link: { href: '/admin/customers', label: 'Go to Customers' },
    steps: [
      {
        title: 'Customers',
        content: ['View customer profiles, order history, and contact details from the Customers list.'],
      },
      {
        title: 'Reviews',
        content: ['Approve, reject, or reply to product reviews from the Reviews page before they go live on the storefront.'],
      },
    ],
  },
  {
    id: 'marketing',
    icon: Zap,
    title: 'Marketing Tools',
    summary: 'Coupons, flash sales, loyalty, gift cards and affiliates.',
    link: { href: '/admin/marketing/coupons', label: 'Go to Marketing' },
    steps: [
      {
        title: 'Coupons & Flash Sales',
        content: ['Create percentage/fixed discounts and time-boxed flash sales tied to specific products or categories.'],
      },
      {
        title: 'Loyalty & Affiliates',
        content: ['Configure point-earning rules and track affiliate referral performance from their respective pages.'],
      },
    ],
  },
  {
    id: 'inventory',
    icon: Truck,
    title: 'Inventory & Suppliers',
    summary: 'Stock levels, purchase orders and supplier records.',
    link: { href: '/admin/inventory', label: 'Go to Inventory' },
    steps: [
      {
        title: 'Stock tracking',
        content: [
          'Physical product stock is tracked per-warehouse under Inventory.',
          'Use Purchase Orders to record incoming stock from a Supplier — supplier contact records live under Suppliers.',
        ],
      },
    ],
  },
  {
    id: 'search-tips',
    icon: Search,
    title: 'Tips & Shortcuts',
    summary: 'Small things that make daily admin work faster.',
    steps: [
      {
        title: 'Quick tips',
        content: [
          'Most tables support server-side search — type and results refresh automatically, no need to hit Enter.',
          'Boolean filters like "Active only" work reliably even with large catalogs, thanks to strict server-side filtering.',
          'Use the breadcrumb / back arrow at the top of detail pages to return to the list without losing your place.',
        ],
      },
    ],
  },
  {
    id: 'settings',
    icon: Settings,
    title: 'Settings',
    summary: 'Site-wide configuration.',
    link: { href: '/admin/settings', label: 'Go to Settings' },
    steps: [
      {
        title: 'Key settings',
        content: [
          'Admin Notification Email — where order/gift-card alerts are sent.',
          'Other store-wide key/value settings (currency defaults, feature toggles) also live here.',
        ],
      },
    ],
  },
  {
    id: 'reviews-support',
    icon: Star,
    title: 'Support & Returns',
    summary: 'Handle customer service requests.',
    link: { href: '/admin/support', label: 'Go to Support' },
    steps: [
      {
        title: 'Support tickets',
        content: ['Respond to and resolve customer support tickets from the Support page.'],
      },
      {
        title: 'Returns',
        content: ['Approve or reject return requests and track their status from the Returns page.'],
      },
    ],
  },
];

function GuideAccordion({ section }: { section: GuideSection }) {
  const [open, setOpen] = useState(false);
  const Icon = section.icon;
  return (
    <div className="rounded-xl bg-card border border-border overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-3 px-4 md:px-5 py-4 text-left hover:bg-background-tertiary/50 transition-colors"
      >
        <div className="h-9 w-9 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
          <Icon className="h-4.5 w-4.5 text-accent" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-heading font-bold text-sm md:text-base">{section.title}</h3>
          <p className="text-xs text-foreground-muted truncate">{section.summary}</p>
        </div>
        <ChevronDown className={cn('h-4 w-4 text-foreground-muted flex-shrink-0 transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <div className="px-4 md:px-5 pb-5 pt-1 space-y-5 border-t border-border">
          {section.link && (
            <Link href={section.link.href} className="inline-flex items-center gap-1.5 text-xs font-medium text-accent hover:underline mt-3">
              {section.link.label} →
            </Link>
          )}
          {section.steps.map((step, i) => (
            <div key={i}>
              <p className="text-sm font-semibold text-foreground mb-2">{step.title}</p>
              <ul className="space-y-1.5">
                {step.content.map((line, j) => (
                  <li key={j} className="text-sm text-foreground-muted flex gap-2">
                    <span className="text-accent flex-shrink-0">•</span>
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdminGuidePage() {
  return (
    <div className="p-4 md:p-6 max-w-3xl space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-accent" /> Admin Guide
        </h1>
        <p className="text-sm text-foreground-muted mt-1">
          A walkthrough of every module in this admin panel — click a section to expand it.
        </p>
      </div>

      <div className="space-y-3">
        {SECTIONS.map((section) => (
          <GuideAccordion key={section.id} section={section} />
        ))}
      </div>
    </div>
  );
}
