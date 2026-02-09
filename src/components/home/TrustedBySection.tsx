'use client';

export function TrustedBySection() {
  const brands = [
    { name: 'Autoescuela Central', initials: 'AC' },
    { name: 'Conduce Bien', initials: 'CB' },
    { name: 'Vía Libre', initials: 'VL' },
    { name: 'Driver Pro', initials: 'DP' },
    { name: 'Auto Drive', initials: 'AD' },
    { name: 'SpeedDrive', initials: 'SD' },
  ];

  return (
    <section
      style={{
        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", sans-serif',
        backgroundColor: '#FFFFFF',
        borderTop: '1px solid #E5E7EB',
        borderBottom: '1px solid #E5E7EB',
      }}
      className="py-20 px-6"
    >
      <p
        className="text-center text-sm font-medium mb-12 tracking-wide uppercase"
        style={{ color: '#6B7280' }}
      >
        +500 autoescuelas en España confían en nosotros
      </p>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-wrap items-center justify-center gap-x-16 gap-y-10">
          {brands.map((brand) => (
            <div
              key={brand.name}
              className="flex items-center gap-3 transition-colors hover:opacity-60"
              style={{ color: '#1A1A1A' }}
            >
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-semibold"
                style={{
                  background: 'linear-gradient(to bottom right, #E5E7EB, #D1D5DB)',
                  color: '#374151',
                }}
              >
                {brand.initials}
              </div>
              <span className="text-lg font-medium">{brand.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
