import React, { useState } from "react";

const FacebookIcon = (props) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    width={28}
    height={28}
    {...props}
  >
    <path d="M17 2h-3a5 5 0 0 0-5 5v3H6v3h3v9h3v-9h3l1-3h-4V7a2 2 0 0 1 2-2h2V2z" />
  </svg>
);
const InstagramIcon = (props) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    width={28}
    height={28}
    {...props}
  >
    <circle cx="12" cy="12" r="4" />
    <rect
      x="2"
      y="2"
      width="20"
      height="20"
      rx="5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    />
    <circle cx="18" cy="6" r="1.5" />
  </svg>
);
const GitHubIcon = (props) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    width={28}
    height={28}
    {...props}
  >
    <path d="M12 2C6.5 2 2 6.6 2 12.2c0 4.5 2.9 8.3 7 9.7.5.1.7-.2.7-.5v-1.8c-2.8.6-3.4-1.1-3.4-1.1-.4-.9-1-1.2-1-1.2-.8-.6.1-.6.1-.6.9.1 1.3.9 1.3.9.8 1.3 2.1.9 2.7.7.1-.6.3-.9.5-1-2.2-.3-4.4-1.1-4.4-4.7 0-1 .4-1.9 1-2.6-.1-.2-.4-1 .1-2 0 0 .8-.2 2.7 1 1-.3 2-.4 3-.4s2 .1 3 .4c1.9-1.2 2.7-1 2.7-1 .6 1 .2 1.8.1 2 .6.7 1 1.6 1 2.6 0 3.6-2.2 4.4-4.4 4.7.3.3.5.7.5 1.3v2c0 .3.2.6.7.5 4.1-1.3 7-5.2 7-9.7C22 6.6 17.5 2 12 2z" />
  </svg>
);

const DEVELOPERS = [
  {
    name: "Kayaos Kun",
    role: "Full Stack Developer",
    img: "https://scontent.fcgy3-1.fna.fbcdn.net/v/t39.30808-6/592133841_1317031613503907_2651938012542083132_n.jpg?stp=cp6_dst-jpg_tt6&_nc_cat=106&ccb=1-7&_nc_sid=6ee11a&_nc_eui2=AeEGeZ5QAZKn9fyl_YZivvIFTJrxMav9tZxMmvExq_21nLuiB7VO4SD4lt-Fi9jp-fZU4BJ3KaR9ZFuhYW7ebf_6&_nc_ohc=XXjIRZQ_rxMQ7kNvwHEl-g_&_nc_oc=AdmY04KVphH4jI3u0ZM5EsPwexL0XujfmfDyXhoN43YerTwFfVCf_by01wxflDwX5OA&_nc_zt=23&_nc_ht=scontent.fcgy3-1.fna&_nc_gid=qp-k5nL2PXzzNPJHz1lV_Q&oh=00_AfkGThsV5IYnXXi-ARivbJaMo2tD8bXFRS3GyXd06KFCWw&oe=69348296",
    social: {
      facebook: "https://www.facebook.com/kaya0s/",
      instagram: "https://www.instagram.com/yaosthegreat/",
      github: "https://github.com/kaya0s",
    },
    email: "kayaoskun@example.com",
    phone: "+63 917 456 4321",
    bio: "Specializes in high-impact, beautiful web apps and backend APIs. Enjoys React, Node, & Figma.",
  },
  {
    name: "Josua Cagampang",
    role: "UX/UI Designer",
    img: "",
    social: {
      facebook: "https://facebook.com/boblee",
      instagram: "https://instagram.com/boblee",
      github: "https://github.com/boblee",
    },
    email: "josua.cagampang@example.com",
    phone: "+63 917 555 1234",
    bio: "UX/UI designer passionate about intuitive, pixel-perfect interfaces. Loves clean and effective design.",
  },
  {
    name: "Antonette Salise",
    role: "Quality Assurance Tester",
    img: "",
    social: {
      facebook: "https://facebook.com/clarazhang",
      instagram: "https://instagram.com/clarazhang",
      github: "https://github.com/clarazhang",
    },
    email: "antonette.salise@example.com",
    phone: "+63 917 234 5678",
    bio: "Committed to software quality and thorough testing. Ensures every detail works as it should.",
  },
  {
    name: "Jassel Cadeliña",
    role: "Documentation Specialist",
    img: "",
    social: {
      facebook: "https://facebook.com/davidbrown",
      instagram: "https://instagram.com/davidbrown",
      github: "https://github.com/davidbrown",
    },
    email: "jassel.cadelina@example.com",
    phone: "+63 917 654 0987",
    bio: "Makes tech make sense. Focused on clear, concise docs for devs and users alike.",
  },
];

const NAVBAR_HEIGHT_REM = 4;
const minHeight = `calc(100vh - ${NAVBAR_HEIGHT_REM}rem)`;

const getInitials = (name) => {
  if (!name) return "";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
};

const Overlay = ({ dev, onClose }) => {
  // Prevent interaction with background, allow ESC/Click outside to close
  React.useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [onClose]);
  // For click outside: use a ref
  const contentRef = React.useRef();

  const handleClickOutside = (e) => {
    if (contentRef.current && !contentRef.current.contains(e.target)) {
      onClose();
    }
  };

  React.useEffect(() => {
    window.addEventListener("mousedown", handleClickOutside);
    return () => window.removeEventListener("mousedown", handleClickOutside);
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm transition-all">
      <div
        ref={contentRef}
        className="bg-base-100 rounded-3xl max-w-2xl w-full mx-4 shadow-2xl flex flex-col items-center relative p-10 animate-fadeIn"
        style={{ border: "2px solid rgba(120, 93, 210, 0.2)" }}
      >
        <button
          className="absolute top-4 right-4 rounded-full bg-primary/10 hover:bg-primary/20 p-2 text-primary focus:outline-none"
          onClick={onClose}
          aria-label="Close"
        >
          <svg
            viewBox="0 0 24 24"
            width={28}
            height={28}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
        <div className="flex flex-col items-center gap-5 w-full">
          <div className="relative mb-4">
            {dev.img ? (
              <img
                src={dev.img}
                alt={dev.name}
                className="w-44 h-44 rounded-full object-cover border-4 border-primary/60 shadow-xl bg-base-200"
                loading="lazy"
              />
            ) : (
              <div className="w-44 h-44 flex items-center justify-center rounded-full bg-gradient-to-tr from-primary via-white to-secondary text-6xl font-bold text-primary-content border-4 border-primary/40 shadow-xl select-none">
                {getInitials(dev.name)}
              </div>
            )}
            <span className="absolute bottom-3 right-3 w-7 h-7 rounded-full bg-primary shadow-md flex items-center justify-center ring-4 ring-base-200">
              <span className="animate-pulse block w-2 h-2 bg-white rounded-full" />
            </span>
          </div>
          <span className="font-extrabold text-3xl text-primary text-center mb-1 tracking-wide">
            {dev.name}
          </span>
          <span className="text-lg text-base-content/80 text-center font-semibold mb-1">
            {dev.role}
          </span>
          <p className="text-base text-base-content/70 text-center max-w-lg mb-3">
            {dev.bio}
          </p>
          <div className="flex flex-col gap-2 w-full max-w-sm mt-2 mb-3">
            {dev.email && (
              <div className="flex items-center gap-3">
                <span className="font-semibold text-base text-primary">
                  Email:
                </span>
                <a
                  href={`mailto:${dev.email}`}
                  className="text-base-content underline hover:text-primary transition"
                >
                  {dev.email}
                </a>
              </div>
            )}
            {dev.phone && (
              <div className="flex items-center gap-3">
                <span className="font-semibold text-base text-primary">
                  Phone:
                </span>
                <a
                  href={`tel:${dev.phone.replace(/\s/g, "")}`}
                  className="text-base-content underline hover:text-primary transition"
                >
                  {dev.phone}
                </a>
              </div>
            )}
          </div>
          <div className="flex gap-6 mt-3">
            <a
              href={dev.social.facebook}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center rounded-full bg-base-200 hover:bg-primary/10 p-3 transition-colors text-primary hover:scale-110 shadow hover:shadow-md"
              aria-label="Facebook"
            >
              <FacebookIcon />
            </a>
            <a
              href={dev.social.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center rounded-full bg-base-200 hover:bg-primary/10 p-3 transition-colors text-primary hover:scale-110 shadow hover:shadow-md"
              aria-label="Instagram"
            >
              <InstagramIcon />
            </a>
            <a
              href={dev.social.github}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center rounded-full bg-base-200 hover:bg-primary/10 p-3 transition-colors text-primary hover:scale-110 shadow hover:shadow-md"
              aria-label="GitHub"
            >
              <GitHubIcon />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

const Developers = () => {
  const [selectedDev, setSelectedDev] = useState(null);

  return (
    <section
      className="w-full flex flex-col items-center bg-base-100 px-0 py-0"
      style={{ minHeight }}
    >
      <div className="flex-1 w-full flex flex-col items-center">
        <h2 className="text-5xl font-extrabold mb-12 mt-20 text-primary text-center tracking-tight">
          Meet the Developers
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-12 w-full max-w-7xl px-6 pb-28">
          {DEVELOPERS.map((dev, idx) => (
            <button
              key={dev.name + idx}
              className="relative group bg-base-200 rounded-3xl shadow-2xl flex flex-col items-center px-7 py-9 transition-all duration-300 hover:scale-105 hover:shadow-[0_8px_30px_rgba(80,70,160,0.15)] overflow-hidden outline-none focus:ring-2 focus:ring-primary"
              style={{
                minWidth: 250,
                maxWidth: 340,
                border: "1px solid rgba(120, 93, 210, 0.1)",
                cursor: "pointer",
              }}
              type="button"
              onClick={() => setSelectedDev(dev)}
              tabIndex={0}
            >
              <div className="relative mb-7">
                {dev.img ? (
                  <img
                    src={dev.img}
                    alt={dev.name}
                    className="w-32 h-32 rounded-full object-cover border-4 border-primary/60 shadow-xl transition group-hover:shadow-2xl bg-base-200"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-32 h-32 flex items-center justify-center rounded-full bg-gradient-to-tr from-primary via-white to-secondary text-4xl font-bold text-primary-content border-4 border-primary/40 shadow-xl select-none">
                    {getInitials(dev.name)}
                  </div>
                )}
                <span className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-primary shadow-md flex items-center justify-center ring-4 ring-base-200 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="animate-pulse block w-1.5 h-1.5 bg-white rounded-full" />
                </span>
              </div>
              <span className="font-extrabold text-2xl text-primary text-center mb-2 tracking-wide">
                {dev.name}
              </span>
              <span className="text-base text-base-content/80 text-center font-medium mb-6">
                {dev.role}
              </span>
              <div className="flex gap-4 mt-auto pointer-events-none">
                <span
                  className="flex items-center justify-center rounded-full bg-base-100 p-2 shadow text-primary"
                  aria-label="Facebook"
                >
                  <FacebookIcon />
                </span>
                <span
                  className="flex items-center justify-center rounded-full bg-base-100 p-2 shadow text-primary"
                  aria-label="Instagram"
                >
                  <InstagramIcon />
                </span>
                <span
                  className="flex items-center justify-center rounded-full bg-base-100 p-2 shadow text-primary"
                  aria-label="GitHub"
                >
                  <GitHubIcon />
                </span>
              </div>
            </button>
          ))}
        </div>
        {selectedDev && (
          <Overlay dev={selectedDev} onClose={() => setSelectedDev(null)} />
        )}
      </div>
    </section>
  );
};

export default Developers;
