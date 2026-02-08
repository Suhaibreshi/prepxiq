export default function Logo({ className = "h-8 sm:h-10", textColor = "text-blue-600" }) {
  return (
    <div className={`flex items-center ${className}`}>
      <svg viewBox="0 0 200 50" className="h-full w-auto" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style={{ stopColor: '#2563eb', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: '#1e40af', stopOpacity: 1 }} />
          </linearGradient>
        </defs>

        <text x="10" y="35" fontFamily="Inter, system-ui, sans-serif" fontSize="32" fontWeight="800" fill="url(#logoGradient)">
          PREPX
        </text>

        <text x="120" y="35" fontFamily="Inter, system-ui, sans-serif" fontSize="32" fontWeight="800" fill="url(#logoGradient)">
          IQ
        </text>

        <path d="M 105 15 L 115 25 L 105 35" stroke="url(#logoGradient)" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M 110 15 L 120 25 L 110 35" stroke="url(#logoGradient)" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </div>
  );
}
