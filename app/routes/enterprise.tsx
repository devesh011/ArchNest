import { useState, type FormEvent } from "react";
import { ArrowRight, Check, ChevronDown } from "lucide-react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

export function meta() {
  return [
    { title: "Enterprise — ArchNest" },
    {
      name: "description",
      content:
        "What ArchNest is building for teams and organizations — on the roadmap, not live yet. Tell us what you'd need.",
    },
  ];
}

const specs = [
  { label: "SSO / SCIM", value: "On the roadmap" },
  { label: "Uptime target", value: "TBD" },
  { label: "Data residency", value: "TBD" },
  { label: "Support SLA", value: "On the roadmap" },
];

const features = [
  {
    tag: "Access",
    title: "Single sign-on & provisioning",
    body: "Bring your identity provider and sync seats automatically as your team changes. Not built yet — tell us if this is a blocker for you.",
  },
  {
    tag: "Scale",
    title: "Dedicated rendering capacity",
    body: "Reserved throughput so your team's renders don't wait behind anyone else's queue. Planned once we have organizations that need it.",
  },
  {
    tag: "Control",
    title: "Admin & workspace management",
    body: "One workspace, one view of who's doing what. On the roadmap — the shape of it will depend on what early teams actually ask for.",
  },
];

const faqs = [
  {
    q: "Is Enterprise available today?",
    a: "Not yet. ArchNest is in Early Access and everything here is a preview of what we're planning to build — not a live plan you can buy.",
  },
  {
    q: "Can I influence what gets built?",
    a: "Yes — that's the point of this page. Tell us what your team needs below and it directly shapes what we prioritize.",
  },
  {
    q: "When will this be ready?",
    a: "We don't have a date yet. We'd rather build it right for the first few organizations than rush a date we can't hit.",
  },
];

export default function Enterprise() {
  const [form, setForm] = useState({ name: "", email: "", company: "" });
  const [submitted, setSubmitted] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="enterprise-page" id="enterprise">
      <Navbar />

      <section className="enterprise-hero">
        <span className="eyebrow">// enterprise</span>
        <h1>Built for organizations — coming to ArchNest.</h1>
        <p className="subtitle">
          We're designing the org-level version of ArchNest. Nothing below is
          live yet — this is what we're planning, and we'd rather build it
          around real teams than guess.
        </p>
        {/* <div className="hero-actions">
          <a href="#contact" className="cta-btn">
            Tell us what you need <ArrowRight size={16} />
          </a>
        </div> */}
      </section>

      <section className="spec-strip">
        <div className="spec-strip-inner">
          {specs.map((s) => (
            <div className="spec-item" key={s.label}>
              <span className="spec-label">{s.label}</span>
              <span className="spec-value">{s.value}</span>
              <span className="spec-badge">Planned</span>
            </div>
          ))}
        </div>
      </section>

      <section className="enterprise-features">
        <div className="section-inner">
          <div className="gallery-head">
            <span className="eyebrow">// on the roadmap</span>
            <h2>What we're planning to build</h2>
            <p>None of this exists yet — see the FAQ below for why.</p>
          </div>
          <div className="enterprise-feature-grid">
            {features.map((f) => (
              <div className="enterprise-feature-card" key={f.title}>
                <span className="planned-badge">Planned</span>
                <span className="tag">{f.tag}</span>
                <h3>{f.title}</h3>
                <p>{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="enterprise-faq">
        <div className="section-inner">
          {faqs.map((item, i) => (
            <div className="faq-item" key={item.q}>
              <button
                className="faq-question"
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
              >
                {item.q}
                <ChevronDown
                  size={16}
                  className={`chev ${openFaq === i ? "open" : ""}`}
                />
              </button>
              {openFaq === i && <p className="faq-answer">{item.a}</p>}
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}
