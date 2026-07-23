import Link from 'next/link';
import { CheckCircle2, Package, ArrowRight } from 'lucide-react';

export default function OrderSuccessPage() {
  return (
    <div className="mx-auto max-w-[1440px] px-4 md:px-6 py-20 text-center">
      <div className="max-w-lg mx-auto">
        <div className="h-20 w-20 rounded-full bg-success/10 border border-success/20 flex items-center justify-center mx-auto mb-6 animate-fade-in">
          <CheckCircle2 className="h-10 w-10 text-success" />
        </div>
        <h1 className="font-heading text-4xl font-bold mb-3 animate-slide-up">Order Placed!</h1>
        <p className="text-foreground-muted text-lg mb-2 animate-slide-up">Thank you for your purchase.</p>
        <p className="text-sm text-foreground-muted mb-8 animate-slide-up">A confirmation email has been sent to you. You can track your order in your account.</p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12 animate-slide-up">
          <Link href="/orders" className="flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-accent text-white font-semibold hover:bg-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background transition-colors">
            <Package className="h-4 w-4" /> Track My Order
          </Link>
          <Link href="/en" className="flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-background-tertiary border border-border text-foreground font-semibold hover:border-border-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background transition-colors">
            Continue Shopping <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}