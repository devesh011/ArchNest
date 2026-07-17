import { useState, type FormEvent } from "react";
import { Check, ArrowRight, ChevronDown } from "lucide-react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

export function meta() {
  return [
    { title: "Pricing — ArchNest" },
    {
      name: "description",
      content:
        "ArchNest is free during Early Access. See what's included today and what's coming next.",
    },
  ];
}

const currentFeatures = [
  "Upload limited floor plans",
  "AI-powered 3D room generation",
  "Before & after compare slider",
  "PNG & PDF export",
  "Shareable public project links",
];

const futurePlans = [
  {
    name: "Free",
    price: "$0",
    tagline: "For trying ArchNest out",
    features: [
      "A limited number of projects",
      "Standard render speed",
      "PNG export",
    ],
  },
  {
    name: "Pro",
    price: "TBD",
    tagline: "For individuals & freelancers",
    features: [
      "Unlimited projects",
      "Priority rendering",
      "PNG & PDF export",
      "Shareable links",
    ],
    highlighted: true,
  },
  {
    name: "Team",
    price: "TBD",
    tagline: "For studios & agencies",
    features: [
      "Everything in Pro",
      "Multiple seats",
      "Team workspace",
      "Priority support",
    ],
  },
];

const faqs = [
  {
    q: "Will Early Access stay free forever?",
    a: "No — Early Access is free while we build ArchNest out. Paid plans are coming, but we'll give everyone a clear heads-up before anything changes.",
  },
  {
    q: "Will I lose my projects when paid plans launch?",
    a: "No. Anything you've created during Early Access stays yours. We'll walk you through your options before any plan changes take effect.",
  },
  {
    q: "How do I find out when pricing launches?",
    a: "Join the waitlist below and we'll email you before anything changes — no spam, just the essentials.",
  },
];

export default function Pricing() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleWaitlistSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubmitted(true);
  };

  return (
    <div className="pricing-page" id="pricing">
      <Navbar />

      <section className="pricing-hero">
        <span className="eyebrow">// pricing</span>
        <h1>Simple pricing. Coming soon.</h1>
        <p className="subtitle">
          ArchNest is completely free during Early Access. We'll give everyone a
          heads-up well before any paid plans launch.
        </p>
      </section>

      <section className="pricing-highlight">
        <div className="highlight-card">
          <span className="ribbon">Early Access</span>
          <div className="highlight-head">
            <h2>Free</h2>
            <p>Everything ArchNest offers, on us — for now.</p>
          </div>
          <ul className="highlight-features">
            {currentFeatures.map((f) => (
              <li key={f}>
                <Check size={16} /> {f}
              </li>
            ))}
          </ul>
          <a href="/#upload" className="cta-btn">
            Get Started Free <ArrowRight size={16} />
          </a>
        </div>
      </section>

      <section className="pricing-future">
        <div className="section-inner">
          <div className="future-head">
            <span className="eyebrow">// what's next</span>
            <h2>Plans we're building toward</h2>
            <p>
              Nothing here is final — this is a preview of the direction we're
              headed, not a commitment.
            </p>
          </div>
          <div className="plan-grid">
            {futurePlans.map((plan) => (
              <div
                key={plan.name}
                className={`plan-card ${plan.highlighted ? "highlighted" : ""}`}
              >
                <span className="coming-soon">Coming soon</span>
                <h3>{plan.name}</h3>
                <div className="plan-price">{plan.price}</div>
                <p className="plan-tagline">{plan.tagline}</p>
                <ul>
                  {plan.features.map((f) => (
                    <li key={f}>
                      <Check size={14} /> {f}
                    </li>
                  ))}
                </ul>
                <button className="outline-btn" disabled>
                  Coming Soon
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="waitlist">
        <span className="eyebrow">// stay in the loop</span>
        <h2>Get notified before pricing launches</h2>
        {submitted ? (
          <p className="waitlist-success">
            <Check size={16} /> Thanks — we'll email you before anything
            changes.
          </p>
        ) : (
          <form className="waitlist-form" onSubmit={handleWaitlistSubmit}>
            <input
              type="email"
              required
              placeholder="you@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button type="submit" className="cta-btn">
              Notify Me
            </button>
          </form>
        )}
      </section>

      <section className="pricing-faq">
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
