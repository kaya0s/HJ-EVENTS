
interface HJLogoProps {
  className?: string;
}

export function HJLogo({ className }: HJLogoProps) {
  return (
    <div className={className}>
      <img
        src="/logo.png"
        alt="HJ Wedding Events Logo"
        className="w-full h-full object-contain"
      />
    </div>
  )
}
