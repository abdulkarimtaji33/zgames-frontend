'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

const FAQ_DATA = [
  {
    category: 'Orders & Delivery',
    items: [
      { q: 'How long does delivery take?', a: 'Standard delivery takes 2–5 business days. Same-day delivery is available in Dubai for orders placed before 2 PM.' },
      { q: 'Do you deliver across the GCC?', a: 'Yes! We deliver to UAE, Saudi Arabia, Qatar, Kuwait, and Bahrain. International shipping is also available.' },
      { q: 'What is the free shipping threshold?', a: 'Orders over AED 150 qualify for free standard shipping within the UAE.' },
      { q: 'Can I track my order?', a: 'Yes. Use our Track Order page with your order number and email to see real-time status.' },
    ],
  },
  {
    category: 'Returns & Refunds',
    items: [
      { q: 'What is your return policy?', a: 'We accept returns within 7 days of delivery for unopened, sealed items in original packaging.' },
      { q: 'How do I request a return?', a: 'Log into your account, go to My Orders, select the order, and click "Return Item". Our team will get in touch within 24 hours.' },
      { q: 'When will I get my refund?', a: 'Refunds are processed within 3–5 business days after we receive the returned item.' },
    ],
  },
  {
    category: 'Products & Stock',
    items: [
      { q: 'Are your products genuine?', a: 'Absolutely. We source all products directly from official distributors and manufacturers. Every product is 100% authentic.' },
      { q: 'What regions are your games?', a: 'We sell UAE, KSA, and International region games. Region is clearly labeled on each product page.' },
      { q: 'Can I pre-order games?', a: 'Yes! Pre-order games before launch to secure yours at the best price. You\'re only charged when the game ships.' },
    ],
  },
  {
    category: 'Payments',
    items: [
      { q: 'What payment methods do you accept?', a: 'We accept Visa, Mastercard, Apple Pay, Tabby (4 installments), Tamara (3 months), and Cash on Delivery.' },
      { q: 'Is my payment information secure?', a: 'Yes. All payments are processed through SSL-encrypted connections. We never store your card details.' },
      { q: 'Can I pay in installments?', a: 'Yes! Use Tabby or Tamara at checkout to split your payment into 4 interest-free installments.' },
    ],
  },
];

export default function FaqPage() {
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});
  const toggle = (key: string) => setOpenItems((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <div className="mx-auto max-w-[1440px] px-4 md:px-6 py-12">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="font-heading text-4xl font-bold mb-3">Frequently Asked Questions</h1>
          <p className="text-foreground-muted">Everything you need to know about ZGames.</p>
        </div>

        <div className="space-y-8">
          {FAQ_DATA.map((section) => (
            <div key={section.category}>
              <h2 className="font-heading text-xl font-bold text-accent mb-4">{section.category}</h2>
              <div className="space-y-2">
                {section.items.map((item, i) => {
                  const key = `${section.category}-${i}`;
                  const isOpen = !!openItems[key];
                  return (
                    <div key={key} className="rounded-xl bg-card border border-border overflow-hidden">
                      <button
                        onClick={() => toggle(key)}
                        className="flex items-center justify-between w-full px-5 py-4 text-left"
                      >
                        <span className="font-medium text-foreground text-sm pr-4">{item.q}</span>
                        <ChevronDown className={cn('h-4 w-4 text-foreground-muted flex-shrink-0 transition-transform', isOpen && 'rotate-180')} />
                      </button>
                      {isOpen && (
                        <div className="px-5 pb-4 text-sm text-foreground-muted leading-relaxed border-t border-border pt-4">
                          {item.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center p-8 rounded-2xl bg-accent/10 border border-accent/20">
          <h3 className="font-heading text-xl font-bold mb-2">Still have questions?</h3>
          <p className="text-foreground-muted mb-4 text-sm">Our support team is here 9am–9pm, 7 days a week.</p>
          <a href="/en/contact" className="inline-flex px-6 py-2.5 rounded-full bg-accent text-white font-semibold text-sm hover:bg-accent-hover transition-colors">
            Contact Support
          </a>
        </div>
      </div>
    </div>
  );
}