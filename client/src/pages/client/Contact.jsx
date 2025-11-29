import { Mail, Phone, MapPin, Instagram, Facebook } from "lucide-react";
import { useEffect, useState } from "react";

// Detect DaisyUI theme live
function useDaisyTheme() {
  const [theme, setTheme] = useState(
    document.documentElement.getAttribute("data-theme")
  );

  useEffect(() => {
    const target = document.documentElement;

    const obs = new MutationObserver(() => {
      const newTheme = target.getAttribute("data-theme");
      setTheme(newTheme);
    });

    obs.observe(target, { attributes: true, attributeFilter: ["data-theme"] });

    return () => obs.disconnect();
  }, []);

  return theme;
}

const Contact = () => {
  const theme = useDaisyTheme();

  // Replace these with your own map URLs if needed
  const lightMap =
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3949.9898625794954!2d125.12706912427988!3d8.102513396543713!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x32ff01c35c7fae59%3A0x9b3fbb15fcd96554!2sHJ%20Wedding%20%26%20Events%20Gownshop!5e0!3m2!1sen!2sph!4v1764405628242!5m2!1sen!2sph";

  const darkMap =
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3949.9898625794954!2d125.12706912427988!3d8.102513396543713!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x32ff01c35c7fae59%3A0x9b3fbb15fcd96554!2sHJ%20Wedding%20%26%20Events%20Gownshop!5e0!3m2!1sen!2sph!4v1764405628242!5m2!1sen!2sph&t=k";

  return (
    <section className="bg-linear-to-b from-base-100/80 via-base-200/40 to-base-100/80 min-h-screen w-full px-4 pt-6 pb-16 space-y-12 flex flex-col items-center justify-center">
      <div className="max-w-4xl w-full space-y-6 text-center">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold text-base-content">Contact Us</h1>
        </div>
      </div>

      <aside className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-8 rounded-3xl bg-base-200 p-8 md:p-12 shadow-sm">
        
        {/* Left: Contact Info */}
        <div className="space-y-8">
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
              <a href="tel:+639178765432" className="hover:text-primary transition">
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
            <h2 className="text-lg font-semibold">Socials</h2>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-6 text-sm text-base-content/70">
              <a
                href="https://instagram.com/hjweddings"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 hover:text-primary transition"
              >
                <Instagram className="mt-1 text-primary" size={20} />
                @hjweddings
              </a>
              <a
                href="https://www.facebook.com/profile.php?id=100064771667953"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 hover:text-primary transition"
              >
                <Facebook className="mt-1 text-primary" size={20} />
                facebook.com/hjweddings
              </a>
            </div>
          </div>

          <div className="space-y-3">
            <h2 className="text-lg font-semibold">Planning hours</h2>
            <ul className="space-y-1 text-sm text-base-content/70">
              <li>Tuesday – Friday: 10:00 AM – 6:00 PM</li>
              <li>Saturday consultations by appointment</li>
              <li>Closed on Sundays & Mondays</li>
            </ul>
          </div>
        </div>

        {/* Right: Google Map */}
        <div className="w-full h-full">
          <iframe
            src={theme === "dark" ? darkMap : lightMap}
            className="w-full h-[350px] md:h-full rounded-xl border-0"
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>
        </div>

      </aside>
    </section>
  );
};

export default Contact;
