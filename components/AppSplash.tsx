import { useEffect, useState } from "react";
import AnimatedLogo from "./ui/AnimatedLogo";

const ANIMATION_DURATION = 1800;
const HOLD_AFTER = 150;
const FADE_DURATION = 250;

const AppSplash = () => {
  const [mounted, setMounted] = useState(true);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const fadeTimer = setTimeout(
      () => setFading(true),
      ANIMATION_DURATION + HOLD_AFTER,
    );
    const removeTimer = setTimeout(
      () => setMounted(false),
      ANIMATION_DURATION + HOLD_AFTER + FADE_DURATION,
    );
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  if (!mounted) return null;

  return (
    <div className={`app-splash ${fading ? "is-fading" : ""}`}>
      <div className="app-splash-logo">
        <AnimatedLogo />
      </div>
    </div>
  );
};

export default AppSplash;
