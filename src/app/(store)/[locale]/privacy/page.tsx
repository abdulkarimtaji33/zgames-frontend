export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-[1440px] px-4 md:px-6 py-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="font-heading text-4xl font-bold mb-3">Privacy Policy</h1>
        <p className="text-sm text-foreground-muted mb-8">Last updated: January 1, 2025</p>
        <div className="prose prose-invert max-w-none space-y-6">
          {[
            { title: '1. Information We Collect', body: 'We collect information you provide directly, such as when you create an account, place an order, or contact support. This includes your name, email address, phone number, delivery addresses, and payment information.' },
            { title: '2. How We Use Your Information', body: 'Your information is used to process orders, communicate with you about your orders, send promotional emails (with your consent), improve our website, and comply with legal obligations.' },
            { title: '3. Data Sharing', body: 'We do not sell your personal data. We share data with trusted third parties who assist us in operating our website and conducting our business, including payment processors and delivery partners.' },
            { title: '4. Cookies', body: 'Our website uses cookies to enhance your experience, analyze traffic, and personalize content. You can control cookies through your browser settings.' },
            { title: '5. Data Security', body: 'We implement security measures including SSL encryption, secure servers, and regular audits to protect your personal information from unauthorized access.' },
            { title: '6. Your Rights', body: 'You have the right to access, correct, or delete your personal data. Contact us at privacy@zgames.ae to exercise these rights.' },
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