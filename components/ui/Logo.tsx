const Logo = () => {
  return (
    <svg
      className="logo"
      viewBox="0 0 320 170"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ stroke: "currentColor" }}
    >
      <g strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        {/* 2D floor plan */}
        <rect x="0" y="40" width="95" height="90" />
        <line x1="48" y1="40" x2="48" y2="130" />
        <line x1="0" y1="85" x2="48" y2="85" />
        <path d="M60 130 L60 105 L80 105 L80 130" />

        {/* transition arrow */}
        <path d="M95 85 L130 70" strokeDasharray="3 5" />

        {/* 3D flat-roof house */}
        <path d="M148 70 L195 50 L242 70 L242 130 L148 130 Z" />
        <path d="M148 70 L148 50 L195 30 L242 50 L242 70" />
        <line x1="195" y1="30" x2="195" y2="50" />
        <path d="M168 130 L168 95 L190 95 L190 130" />
        <line x1="205" y1="80" x2="225" y2="80" />
      </g>
    </svg>
  );
};

export default Logo;
