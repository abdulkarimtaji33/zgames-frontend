'use client';

import { useState } from 'react';
import { Mail, Phone, MapPin, MessageCircle, CheckCircle2 } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useForm } from 'react-hook-form';

interface ContactForm {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ContactForm>();

  const onSubmit = async () => {
    await new Promise((r) => setTimeout(r, 1000));
    setSubmitted(true);
  };

  return (
    <div className="mx-auto max-w-[1440px] px-4 md:px-6 py-12">
      <div className="text-center mb-12">
        <h1 className="font-heading text-4xl font-bold mb-3">Contact Us</h1>
        <p className="text-foreground-muted">We are here to help, 7 days a week.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
        {/* Contact info */}
        <div className="space-y-5">
          {[
            { icon: Phone, title: 'Phone', value: '+971 4 XXX XXXX', sub: 'Sun–Thu: 9am–6pm', color: 'text-viz-1' },
            { icon: Mail, title: 'Email', value: 'support@cgagames.com', sub: 'Response within 24hrs', color: 'text-viz-2' },
            { icon: MessageCircle, title: 'WhatsApp', value: '+971 50 XXX XXXX', sub: 'Available 9am–9pm', color: 'text-success' },
            { icon: MapPin, title: 'Store', value: 'Dubai Mall, Level 2', sub: 'Daily: 10am–11pm', color: 'text-accent' },
          ].map(({ icon: Icon, title, value, sub, color }) => (
            <div key={title} className="flex items-start gap-4 p-4 rounded-xl bg-card border border-border shadow-sm transition-shadow hover:shadow-md">
              <div className={`h-10 w-10 rounded-full bg-surface-2 flex items-center justify-center flex-shrink-0 ${color}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium text-foreground">{title}</p>
                <p className="text-sm text-foreground-muted">{value}</p>
                <p className="text-xs text-foreground-subtle">{sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Contact form */}
        <div className="lg:col-span-2 rounded-xl bg-card border border-border p-6 shadow-sm">
          {submitted ? (
            <div className="flex flex-col items-center justify-center h-full py-12 text-center">
              <CheckCircle2 className="h-14 w-14 text-success mb-4" />
              <h3 className="font-heading text-xl font-bold mb-2">Message Sent!</h3>
              <p className="text-foreground-muted">We will get back to you within 24 hours.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <h2 className="font-heading text-xl font-bold mb-4">Send a Message</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="Your Name" placeholder="John Doe" error={errors.name?.message}
                  {...register('name', { required: 'Required' })} />
                <Input label="Email" type="email" placeholder="you@example.com" error={errors.email?.message}
                  {...register('email', { required: 'Required' })} />
              </div>
              <Input label="Subject" placeholder="How can we help?" error={errors.subject?.message}
                {...register('subject', { required: 'Required' })} />
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">Message</label>
                <textarea
                  rows={5}
                  placeholder="Describe your issue or question..."
                  className="w-full rounded-lg border border-border bg-background-secondary px-3 py-2.5 text-sm text-foreground placeholder:text-foreground-subtle focus:outline-none focus:border-accent focus:ring-2 focus:ring-ring/40 transition-[border-color,box-shadow] duration-[var(--duration-fast)] ease-[var(--ease-standard)] resize-none"
                  {...register('message', { required: 'Required' })}
                />
                {errors.message && <p className="mt-1 text-xs text-error">{errors.message.message}</p>}
              </div>
              <Button type="submit" variant="primary" size="lg" className="w-full" isLoading={isSubmitting}>
                Send Message
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}