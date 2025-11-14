import { Mail, Phone, MapPin, Heart } from "lucide-react";

const Contact = () => {
  return (
    <section className="container mx-auto px-4 py-16 grid gap-12 lg:grid-cols-[2fr,1fr]">
      <div className="space-y-10">
        <div className="space-y-4">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary/70">
            Say hello
          </p>
          <h1 className="text-4xl font-bold text-base-content">
            Let’s start planning the celebration of a lifetime.
          </h1>
        </div>
      </div>

      <aside className="space-y-8 rounded-3xl bg-base-200 p-8 shadow-sm">
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Visit our studio</h2>
          <p className="flex items-start gap-3 text-sm text-base-content/70">
            <MapPin className="mt-1 h-4 w-4 text-primary" />
            67 San Jose, Malaybalay City, Bukidnon
          </p>
        </div>
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Call us</h2>
          <p className="flex items-start gap-3 text-sm text-base-content/70">
            <Phone className="mt-1 h-4 w-4 text-primary" />
            <a
              href="tel:+639178765432"
              className="hover:text-primary transition"
            >
              +63 917 876 5432
            </a>
          </p>
        </div>
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Email</h2>
          <p className="flex items-start gap-3 text-sm text-base-content/70">
            <Mail className="mt-1 h-4 w-4 text-primary" />
            <a
              href="mailto:events@hjweddings.com"
              className="hover:text-primary transition"
            >
              events@hjweddings.com
            </a>
          </p>
        </div>
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Planning hours</h2>
          <ul className="space-y-1 text-sm text-base-content/70">
            <li>Tuesday – Friday: 10:00 AM – 6:00 PM</li>
            <li>Saturday consultations by appointment</li>
            <li>Closed on Sundays & Mondays</li>
          </ul>
        </div>
      </aside>
    </section>
  );
};

export default Contact;
