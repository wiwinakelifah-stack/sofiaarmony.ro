interface PageHeaderProps {
  title: string;
  subtitle?: string;
  image: string;
  breadcrumb: string;
}

export default function PageHeader({
  title,
  subtitle,
  image,
  breadcrumb,
}: PageHeaderProps) {
  return (
    <section className="relative h-72 md:h-96 flex items-end overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url('${image}')` }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/20" />

      {/* Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 pb-12">
        {/* Breadcrumb */}
        <p className="font-[family-name:var(--font-lato)] text-white/60 text-xs tracking-widest uppercase mb-3">
          <a href="/" className="hover:text-white/90 transition-colors">
            Acasă
          </a>
          <span className="mx-2">›</span>
          {breadcrumb}
        </p>
        <h1 className="font-[family-name:var(--font-playfair)] text-4xl md:text-6xl font-semibold text-white leading-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="font-[family-name:var(--font-lato)] text-white/70 mt-3 text-base max-w-xl leading-relaxed">
            {subtitle}
          </p>
        )}
        <div className="mt-4 w-12 h-0.5 bg-[#c9a96e]" />
      </div>
    </section>
  );
}
