import { Shield, Award, Users, MapPin } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-[1440px] px-4 md:px-6 py-12">
      <div className="max-w-4xl mx-auto">
        {/* Hero */}
        <div className="text-center mb-16">
          <p className="text-accent font-medium text-sm uppercase tracking-widest mb-3">About ZGames</p>
          <h1 className="font-heading text-5xl font-bold mb-5">The GCC's Premier Gaming Destination</h1>
          <p className="text-foreground-muted text-lg leading-relaxed max-w-2xl mx-auto">
            Founded in Dubai, ZGames was built by gamers, for gamers. We bring you authentic gaming products at the best prices, with fast delivery across the Gulf.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {[
            { value: '100K+', label: 'Happy Customers' },
            { value: '50K+', label: 'Products' },
            { value: '5', label: 'GCC Countries' },
            { value: '2019', label: 'Founded' },
          ].map(({ value, label }) => (
            <div key={label} className="text-center p-6 rounded-2xl bg-card border border-border">
              <p className="font-heading text-4xl font-bold text-accent mb-1">{value}</p>
              <p className="text-sm text-foreground-muted">{label}</p>
            </div>
          ))}
        </div>

        {/* Values */}
        <div className="mb-16">
          <h2 className="font-heading text-3xl font-bold text-center mb-10">Why ZGames?</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { icon: Shield, title: '100% Authentic', desc: 'Every product sourced directly from official distributors. No counterfeits, ever.', color: 'text-blue-400' },
              { icon: Award, title: 'Best Prices', desc: 'We price-match and run regular flash deals to ensure you always get value.', color: 'text-yellow-400' },
              { icon: Users, title: 'Expert Team', desc: 'Our staff are passionate gamers who know products inside and out.', color: 'text-green-400' },
              { icon: MapPin, title: 'Local Presence', desc: 'Physical stores in Dubai + fast GCC-wide delivery from our warehouses.', color: 'text-accent' },
            ].map(({ icon: Icon, title, desc, color }) => (
              <div key={title} className="flex gap-4 p-5 rounded-xl bg-card border border-border">
                <div className={`h-10 w-10 rounded-full bg-background-tertiary flex items-center justify-center flex-shrink-0 ${color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">{title}</h3>
                  <p className="text-sm text-foreground-muted">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}