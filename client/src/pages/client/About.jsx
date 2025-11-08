const About = () => {
  return (
    <section className="container mx-auto px-4 py-16 space-y-12">
      <div className="max-w-3xl space-y-6">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary/70">
          Our Story
        </p>
        <h1 className="text-4xl font-bold text-base-content">
          Crafting weddings filled with heart, heritage, and impeccable detail.
        </h1>
        <p className="text-base text-base-content/70 leading-relaxed">
          HJ Weddings is a family-led team of planners, stylists, and logistics
          experts dedicated to curating celebrations that feel deeply personal.
          From the first "yes" to your reception's last dance, we choreograph
          every moment so you can soak in the joy of your day.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        <div className="rounded-2xl bg-base-200 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-base-content">
            Experienced Visionaries
          </h3>
          <p className="mt-3 text-sm text-base-content/70">
            Over a decade of orchestrating weddings across the Philippines,
            blending cultural traditions with fresh, modern styling.
          </p>
        </div>
        <div className="rounded-2xl bg-base-200 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-base-content">
            Thoughtful Partnerships
          </h3>
          <p className="mt-3 text-sm text-base-content/70">
            We work with handpicked florists, caterers, stylists, and
            entertainers aligned with your taste and budget.
          </p>
        </div>
        <div className="rounded-2xl bg-base-200 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-base-content">
            Client-First Care
          </h3>
          <p className="mt-3 text-sm text-base-content/70">
            Expect transparent planning, rapid updates, and heartfelt support
            from your dedicated coordinator.
          </p>
        </div>
      </div>

      <div className="rounded-3xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-10 md:p-12">
        <h2 className="text-2xl font-semibold text-base-content">
          "The HJ Weddings team delivered a celebration that felt uniquely ours
          — every detail was intentional, elegant, and stress-free."
        </h2>
        <p className="mt-4 text-sm uppercase tracking-[0.2em] text-base-content/60">
          — Mira & Julian, married July 2024
        </p>
      </div>
    </section>
  );
};

export default About;
