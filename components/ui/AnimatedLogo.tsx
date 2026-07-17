const AnimatedLogo = () => {
  return (
    <>
      <style>{`
        @keyframes archnestDraw2d {
          0%, 8% { stroke-dashoffset: var(--len); opacity: 0; }
          16%, 60% { stroke-dashoffset: 0; opacity: 1; }
          78%, 100% { stroke-dashoffset: 0; opacity: 0; }
        }
        @keyframes archnestDrawArrow {
          0%, 30% { stroke-dashoffset: 30; opacity: 0; }
          40%, 60% { stroke-dashoffset: 0; opacity: 1; }
          78%, 100% { opacity: 0; }
        }
        @keyframes archnestDraw3d {
          0%, 40% { stroke-dashoffset: var(--len); opacity: 0; }
          55%, 75% { stroke-dashoffset: 0; opacity: 1; }
          95%, 100% { stroke-dashoffset: 0; opacity: 1; }
        }
        .archnest-plan-line { stroke-dasharray: var(--len); animation: archnestDraw2d 4s ease-in-out infinite; }
        .archnest-arrow-line { stroke-dasharray: 30; animation: archnestDrawArrow 4s ease-in-out infinite; }
        .archnest-house-line { stroke-dasharray: var(--len); animation: archnestDraw3d 4s ease-in-out infinite; }
      `}</style>
      <svg
        className="logo-animated"
        viewBox="0 0 320 170"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g
          stroke="#2b2926"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect
            className="archnest-plan-line"
            style={{ ["--len" as any]: 370 }}
            x="0"
            y="40"
            width="95"
            height="90"
          />
          <line
            className="archnest-plan-line"
            style={{ ["--len" as any]: 90 }}
            x1="48"
            y1="40"
            x2="48"
            y2="130"
          />
          <line
            className="archnest-plan-line"
            style={{ ["--len" as any]: 48 }}
            x1="0"
            y1="85"
            x2="48"
            y2="85"
          />
          <path
            className="archnest-plan-line"
            style={{ ["--len" as any]: 65 }}
            d="M60 130 L60 105 L80 105 L80 130"
          />

          <path
            className="archnest-arrow-line"
            d="M95 85 L130 70"
            strokeDasharray="3 5"
          />

          <path
            className="archnest-house-line"
            style={{ ["--len" as any]: 260 }}
            d="M148 70 L195 50 L242 70 L242 130 L148 130 Z"
          />
          <path
            className="archnest-house-line"
            style={{ ["--len" as any]: 110 }}
            d="M148 70 L148 50 L195 30 L242 50 L242 70"
          />
          <line
            className="archnest-house-line"
            style={{ ["--len" as any]: 20 }}
            x1="195"
            y1="30"
            x2="195"
            y2="50"
          />
          <path
            className="archnest-house-line"
            style={{ ["--len" as any]: 70 }}
            d="M168 130 L168 95 L190 95 L190 130"
          />
          <line
            className="archnest-house-line"
            style={{ ["--len" as any]: 20 }}
            x1="205"
            y1="80"
            x2="225"
            y2="80"
          />
        </g>
      </svg>
    </>
  );
};

export default AnimatedLogo;
