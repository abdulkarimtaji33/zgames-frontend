export default function TermsPage() {
  return (
    <div className="mx-auto max-w-[1440px] px-4 md:px-6 py-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="font-heading text-4xl font-bold mb-3">Terms & Conditions</h1>
        <p className="text-sm text-foreground-muted mb-8">Last updated: January 1, 2025</p>
        <div className="prose prose-invert max-w-none space-y-6">
          {[
            { title: '1. Acceptance of Terms', body: 'By accessing and using CGA Games (cgagames.com), you accept and agree to be bound by the terms and provisions of this agreement. If you do not agree to these terms, you may not use our services.' },
            { title: '2. Products and Pricing', body: 'All products displayed on our website are subject to availability. Prices are listed in AED and are inclusive of VAT where applicable. We reserve the right to change prices at any time without prior notice.' },
            { title: '3. Order Policy', body: 'Orders are subject to acceptance and availability. We reserve the right to refuse or cancel any order for any reason. Payment must be received before orders are processed and shipped.' },
            { title: '4. Return Policy', body: 'Items may be returned within 7 days of delivery in original, unopened condition. Opened software, digital codes, and downloadable content are non-refundable. Defective items may be exchanged within 30 days.' },
            { title: '5. Intellectual Property', body: 'All content on this website including logos, text, images, and graphics is the property of CGA Games or its content suppliers. Reproduction without written permission is prohibited.' },
            { title: '6. Limitation of Liability', body: 'CGA Games shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use or inability to use our services.' },
          ].map(({ title, body }) => (
            <div key={title}>
              <h2 className="font-heading text-xl font-bold text-foreground mb-2">{title}</h2>
              <p className="text-foreground-muted leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}