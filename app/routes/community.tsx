import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

export function meta() {
  return [
    { title: "Community — ArchNest" },
    {
      name: "description",
      content:
        "The ArchNest community space is on its way — real projects, stats, and stories from people building with ArchNest.",
    },
  ];
}

// Faded blueprint sketch used as the decorative visual for the
// coming-soon state. No fabricated stats or sample projects — this page
// will fill in with real community content once there's real data.
const BlueprintSketch = () => (
  <svg viewBox="0 0 200 140" fill="none">
    <rect
      x="10"
      y="10"
      width="180"
      height="120"
      stroke="var(--teal)"
      strokeWidth="1.2"
      fill="none"
    />
    <line
      x1="90"
      y1="10"
      x2="90"
      y2="80"
      stroke="var(--teal)"
      strokeWidth="1"
      opacity="0.5"
    />
    <line
      x1="10"
      y1="80"
      x2="130"
      y2="80"
      stroke="var(--teal)"
      strokeWidth="1"
      opacity="0.5"
    />
    <line
      x1="130"
      y1="80"
      x2="130"
      y2="130"
      stroke="var(--teal)"
      strokeWidth="1"
      opacity="0.5"
    />
    <path
      d="M20 80 A16 16 0 0 0 36 64"
      stroke="var(--teal)"
      strokeWidth="1"
      fill="none"
    />
    <circle cx="90" cy="80" r="2" fill="var(--teal)" />
    <circle cx="130" cy="80" r="2" fill="var(--teal)" />
  </svg>
);

export default function Community() {
  return (
    <div className="community-page" id="community">
      <Navbar />

      <section className="community-hero">
        <span className="eyebrow">// community</span>
        <h1>A space for what people build with ArchNest.</h1>
        <p className="subtitle">
          We're just getting started. Once people begin sharing what they build,
          this page fills up with real projects, real numbers, and real stories.
        </p>
      </section>

      <section className="community-coming-soon">
        <div className="coming-soon-visual">
          <BlueprintSketch />
        </div>
        <span className="coming-soon-badge">Coming soon</span>
        <h2>The gallery is warming up</h2>
        <p>
          There's nothing to show here yet — but here's what this page will hold
          once the community grows.
        </p>
        <ul className="coming-soon-list">
          <li>Project gallery</li>
          <li>Usage stats</li>
          <li>Member spotlights</li>
        </ul>
      </section>

      <Footer />
    </div>
  );
}
