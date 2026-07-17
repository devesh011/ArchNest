import { useEffect, useState } from "react";

export default function HeroShowcase() {
  const [phase, setPhase] = useState<0 | 1 | 2>(0); // 0 = plan, 1 = hold, 2 = 3d

  useEffect(() => {
    const run = () => {
      setPhase(0);
      const t1 = setTimeout(() => setPhase(1), 1900);
      const t2 = setTimeout(() => setPhase(2), 2600);
      return [t1, t2];
    };
    let timers = run();
    const loop = setInterval(() => {
      timers.forEach(clearTimeout);
      timers = run();
    }, 6500);
    return () => {
      clearInterval(loop);
      timers.forEach(clearTimeout);
    };
  }, []);

  const isPlan = phase !== 2;

  return (
    <div className="hero-plan">
      <div className="hero-plan-grid" />

      <div className="hero-plan-stage">
        {/* Floor plan layer */}
        <div className="hero-plan-layer" style={{ opacity: isPlan ? 1 : 0 }}>
          <svg
            viewBox="0 0 360 260"
            width="100%"
            height="100%"
            style={{ overflow: "visible" }}
          >
            <rect
              className="hero-plan-fill"
              x="30"
              y="20"
              width="150"
              height="100"
            />
            <rect
              className="hero-plan-fill"
              x="190"
              y="20"
              width="130"
              height="60"
            />
            <rect
              className="hero-plan-fill"
              x="30"
              y="130"
              width="130"
              height="90"
            />
            <rect
              className="hero-plan-fill"
              x="170"
              y="90"
              width="150"
              height="130"
            />
            <path
              className="hero-plan-path"
              d="M30 20 H320 V220 H30 Z M180 20 V120 M30 120 H320 M160 120 V220 M170 90 H320"
            />
            <circle cx="150" cy="120" r="2.5" className="hero-plan-dot" />
            <circle cx="200" cy="170" r="2.5" className="hero-plan-dot" />
          </svg>
        </div>

        {/* Isometric 3D layer */}
        <div className="hero-plan-layer" style={{ opacity: isPlan ? 0 : 1 }}>
          <svg
            viewBox="0 0 360 260"
            width="100%"
            height="100%"
            style={{ overflow: "visible" }}
          >
            <polygon
              points="180,20 320,75 180,130 40,75"
              className="hero-plan-face-top"
            />
            <polygon
              points="40,75 180,130 180,215 40,160"
              className="hero-plan-face-left"
            />
            <polygon
              points="180,130 320,75 320,160 180,215"
              className="hero-plan-face-right"
            />
            <polygon
              points="150,62 218,90 218,118 150,90"
              className="hero-plan-face-accent"
            />
            <polygon
              points="70,104 128,127 128,152 70,129"
              className="hero-plan-face-accent-soft"
            />
          </svg>
        </div>
      </div>

      <span
        className="hero-plan-label"
        style={{ top: "2%", left: 0, opacity: isPlan ? 1 : 0 }}
      >
        48.6&nbsp;m² · 4 rooms
      </span>
      <span
        className="hero-plan-label hero-plan-label--right"
        style={{ bottom: "6%", right: 0, opacity: isPlan ? 0 : 1 }}
      >
        scale 1:100 · unit mm
      </span>
      <span
        className="hero-plan-label"
        style={{ top: "38%", left: 0, opacity: isPlan ? 1 : 0 }}
      >
        input: floor-plan.png
      </span>

      <div className="hero-plan-status">
        <span className="hero-plan-status-dot animate-pulse" />
        <span>
          {isPlan
            ? "reading floor-plan.png…"
            : "3D model ready · rendered in 1.2s"}
        </span>
      </div>
    </div>
  );
}
