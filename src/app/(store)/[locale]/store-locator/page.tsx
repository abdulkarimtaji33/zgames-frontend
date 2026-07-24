// TODO: these are placeholder phone numbers — replace with real store contact
// numbers before launch. Not something that can be filled in without actual
// business data.
export default function StoreLocatorPage() {
  const stores = [
    { name: 'CGA Games Dubai Mall', address: 'Dubai Mall, Level 2, Near Food Court', city: 'Dubai', phone: '+971 4 XXX XXXX', hours: 'Daily: 10am – 11pm' },
    { name: 'CGA Games Mall of Emirates', address: 'Mall of the Emirates, Level 1', city: 'Dubai', phone: '+971 4 XXX YYYY', hours: 'Daily: 10am – 11pm' },
    { name: 'CGA Games Abu Dhabi', address: 'Yas Mall, Ground Floor', city: 'Abu Dhabi', phone: '+971 2 XXX XXXX', hours: 'Daily: 10am – 10pm' },
  ];

  const directionsUrl = (store: { address: string; city: string }) =>
    `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${store.address}, ${store.city}, UAE`)}`;

  return (
    <div className="mx-auto max-w-[1440px] px-4 md:px-6 py-12">
      <div className="text-center mb-10">
        <h1 className="font-heading text-4xl font-bold mb-3">Find a Store</h1>
        <p className="text-foreground-muted">Visit us at one of our locations across the UAE.</p>
      </div>

      {/* Map placeholder */}
      <div className="rounded-xl bg-surface-2 border border-border h-64 md:h-96 flex items-center justify-center mb-10 shadow-sm">
        <div className="text-center text-foreground-muted">
          <p className="text-4xl mb-3">🗺️</p>
          <p className="font-medium">Interactive Map</p>
          <p className="text-sm">Powered by Google Maps</p>
        </div>
      </div>

      {/* Store cards */}
      {stores.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {stores.map((store) => (
            <div key={store.name} className="rounded-xl bg-card border border-border p-5 shadow-sm transition-shadow hover:shadow-md hover:border-border-hover">
              <h3 className="font-heading text-lg font-bold text-foreground mb-1">{store.name}</h3>
              <p className="text-sm text-foreground-muted mb-3">{store.address}, {store.city}</p>
              <div className="space-y-1 text-sm">
                <p><span className="text-foreground-subtle">📞</span> <span className="text-foreground-muted">{store.phone}</span></p>
                <p><span className="text-foreground-subtle">🕐</span> <span className="text-foreground-muted">{store.hours}</span></p>
              </div>
              <a
                href={directionsUrl(store)}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex text-sm text-accent hover:underline focus-visible:underline"
              >
                Get Directions →
              </a>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 rounded-xl bg-card border border-border">
          <p className="text-4xl mb-3">📍</p>
          <h2 className="font-heading text-xl font-bold mb-2">No stores found nearby</h2>
          <p className="text-foreground-muted">Try a different city, or shop online with GCC-wide delivery.</p>
        </div>
      )}
    </div>
  );
}