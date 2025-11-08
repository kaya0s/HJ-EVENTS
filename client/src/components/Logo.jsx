import logo from "../assets/images/logo.png";

const Logo = ({ compact = false, className = "" }) => {
  if (compact) {
    return (
      <img
        src={logo}
        alt="HJ Weddings Logo"
        className={`h-10 w-10 object-contain ${className}`.trim()}
      />
    );
  }

  return (
    <div
      className={`w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center ${className}`.trim()}
    >
      <img
        src={logo}
        alt="HJ Weddings Logo"
        className="w-12 h-12 object-contain"
      />
    </div>
  );
};

export default Logo;
