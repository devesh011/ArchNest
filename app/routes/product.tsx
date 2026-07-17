import { useState } from "react";
import { ArrowRight, Box, Layers, Share2, Check } from "lucide-react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

export function meta() {
  return [
    { title: "Product — ArchNest" },
    {
      name: "description",
      content:
        "See how ArchNest turns a 2D floor plan into a fully rendered 3D space — upload, render, compare, and share.",
    },
  ];
}

const steps = [
  {
    id: "render",
    label: "AI Render",
    icon: Box,
    title: "AI generates your 3D space",
    description:
      "No manual modelling. ArchNest reads your plan, labels each room, and builds a fully rendered 3D version in minutes.",
  },
  {
    id: "compare",
    label: "Compare",
    icon: Layers,
    title: "See before and after, side by side",
    description:
      "An interactive drag-to-compare slider lets you flip between your original plan and the finished 3D render instantly.",
  },
  {
    id: "share",
    label: "Export & Share",
    icon: Share2,
    title: "Export or share instantly",
    description:
      "Download a PNG or PDF for presentations, or generate a shareable link so anyone can view your project — no account needed.",
  },
];

export default function Product() {
  const [activeStep, setActiveStep] = useState(0);
  const ActiveIcon = steps[activeStep].icon;

  return (
    <div className="product-page" id="product">
      <Navbar />

      <section className="product-hero">
        <span className="eyebrow">// how it works</span>
        <h1>From flat plan to full 3D — in minutes</h1>
        <p className="subtitle">
          See exactly how ArchNest turns a 2D floor plan into a rendered space
          you can compare, export, and share.
        </p>
        <div className="hero-actions">
          <a href="/#upload" className="cta-btn">
            Start Building <ArrowRight size={16} />
          </a>
        </div>
      </section>

      <section className="how-it-works">
        <div className="section-inner">
          <div className="steps-nav">
            {steps.map((step, i) => (
              <button
                key={step.id}
                className={`step-btn ${activeStep === i ? "active" : ""}`}
                onClick={() => setActiveStep(i)}
              >
                <span className="step-index">{i + 1}</span> {step.label}
              </button>
            ))}
          </div>

          <div className="step-panel">
            <div className="step-visual">
              <ActiveIcon size={56} />
            </div>
            <div className="step-text">
              <h3>{steps[activeStep].title}</h3>
              <p>{steps[activeStep].description}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="feature-deepdive">
        <div className="section-inner">
          <div className="feature-cards">
            <div className="feature-card-item">
              <div className="feature-icon-badge">
                <Box size={22} />
              </div>
              <span className="tag">// ai render</span>
              <h3>Room-accurate 3D, no modelling needed</h3>
              <p>
                ArchNest identifies each room — bedrooms, bathrooms, ensuites —
                and builds a proportionally accurate 3D render automatically.
              </p>
              <ul>
                <li>
                  <Check size={14} /> Automatic room labelling
                </li>
                <li>
                  <Check size={14} /> No CAD or modelling skills required
                </li>
              </ul>
            </div>

            <div className="feature-card-item">
              <div className="feature-icon-badge">
                <Layers size={22} />
              </div>
              <span className="tag">// compare</span>
              <h3>See before and after, side by side</h3>
              <p>
                An interactive drag-to-compare slider lets you flip between your
                original plan and the finished 3D render instantly.
              </p>
              <ul>
                <li>
                  <Check size={14} /> Drag-to-compare slider
                </li>
                <li>
                  <Check size={14} /> Toggle any time while editing
                </li>
              </ul>
            </div>

            <div className="feature-card-item">
              <div className="feature-icon-badge">
                <Share2 size={22} />
              </div>
              <span className="tag">// export & share</span>
              <h3>Export or share, your call</h3>
              <p>
                Download a PNG or PDF ready for presentations, or share a public
                link so clients and collaborators can view without an account.
              </p>
              <ul>
                <li>
                  <Check size={14} /> PNG & PDF export
                </li>
                <li>
                  <Check size={14} /> Shareable public links
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* <section className="product-cta">
        <h2>Ready to see your own plan in 3D?</h2>
        <p>No credit card required — free during Early Access.</p>
        <a href="/#upload" className="cta-btn">
          Start Building <ArrowRight size={16} />
        </a>
      </section> */}

      <Footer />
    </div>
  );
}
