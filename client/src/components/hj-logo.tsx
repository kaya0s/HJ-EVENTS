
export function HJLogo() {
  return (
    <div className="flex flex-col items-center mb-8">
      <div className="relative w-40 h-40 ">
        {/* Logo image with shadow for light mode */}
        <img
          src="./../../public/logo.png" // Replace with your actual logo path
          alt="HJ Wedding Events Logo"
          className="w-full h-full object-contain shadow-lg dark:shadow-none"
          style={{
            filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1)) drop-shadow(0 1px 3px rgba(0, 0, 0, 0.08))'
          }}
        />
      </div>
      
      {/* HJ Events text - minimal styling */}
     
    </div>
  )
}
