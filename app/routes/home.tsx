import {
  ArrowRight,
  ArrowUpRight,
  Clock,
  Layers,
  PencilRuler,
} from "lucide-react";
import Navbar from "../../components/Navbar";
import type { Route } from "./+types/home";
import Button from "../../components/ui/Button";
import Upload from "../../components/Upload";
import { useNavigate, useOutletContext } from "react-router";
import { useEffect, useRef, useState } from "react";
import { createProject, getProjects } from "../../lib/puter.action";
import HeroShowcase from "../../components/ui/HeroShowcase";
import Footer from "../../components/Footer";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function Home() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<DesignItem[]>([]);
  const isCreatingProjectRef = useRef(false);
  const { isSignedIn, signIn } = useOutletContext<AuthContext>();

  const handleAuthClick = async () => {
    try {
      await signIn();
    } catch (e) {
      console.error(e);
    }
  };

  const [visibleIds, setVisibleIds] = useState<Set<string>>(new Set());
  const cardRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const handleUploadComplete = async (base64Image: string) => {
    try {
      if (isCreatingProjectRef.current) return false;
      isCreatingProjectRef.current = true;
      const newId = Date.now().toString();
      const name = `Residence ${newId}`;

      const newItem = {
        id: newId,
        name,
        sourceImage: base64Image,
        renderedImage: undefined,
        timestamp: Date.now(),
      };

      const saved = await createProject({
        item: newItem,
        visibility: "private",
      });

      if (!saved) {
        console.error("Failed to create project");
        return false;
      }

      setProjects((prev) => [saved, ...prev]);

      navigate(`/visualizer/${newId}`, {
        state: {
          initialImage: saved.sourceImage,
          initialRendered: saved.renderedImage || null,
          name,
        },
      });

      return true;
    } finally {
      isCreatingProjectRef.current = false;
    }
  };

  const scrollToUpload = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    document.getElementById("upload")?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
    window.history.pushState(null, "", "#upload");
  };

  useEffect(() => {
    if (!isSignedIn) return;
    const fetchProjects = async () => {
      const items = await getProjects();
      setProjects(items);
    };
    fetchProjects();
  }, [isSignedIn]);

  useEffect(() => {
    const scrollToHash = () => {
      const hash = window.location.hash;
      if (hash === "#projects") {
        document
          .getElementById("projects")
          ?.scrollIntoView({ behavior: "smooth" });
      } else if (hash === "#upload") {
        document.getElementById("upload")?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
    };
    const t = setTimeout(scrollToHash, 100);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute("data-project-id");
            if (id) {
              setVisibleIds((prev) => {
                if (prev.has(id)) return prev;
                const next = new Set(prev);
                next.add(id);
                return next;
              });
            }
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" },
    );

    cardRefs.current.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [projects]);

  return (
    <div className="home">
      <Navbar />

      <section className="hero">
        <div className="announce">
          <div className="dot">
            <div className="pulse"></div>
          </div>
          <p>Now in Early Access — Limited Spots</p>
        </div>

        <h1
          style={{
            fontSize: "clamp(2.25rem, 5.5vw, 5.5rem)",
            lineHeight: 1.05,
          }}
        >
          Design at the speed of thought,{" "}
          <span style={{ color: "var(--teal)" }}>visualize in 3D.</span>
        </h1>
        <p className="subtitle">
          Upload a plan. Get a fully modeled 3D space back — no modelling
          experience needed.
        </p>
        <div className="actions">
          <a href="#upload" className="cta" onClick={scrollToUpload}>
            Start Building <ArrowRight className="icon" />
          </a>
          {/* <Button variant="outline" size="lg" className="demo">
            Watch Demo
          </Button> */}
        </div>

        <HeroShowcase />

        <div id="upload" className="upload-shell">
          <div className="grid-overlay" />
          <div className="grid-overlay-fine" />
          <div className="grid-vignette" />
          <div className="scan-line" />
          <div className="upload-card">
            <div className="upload-head">
              <div className="upload-icon">
                <PencilRuler className="icon" />
              </div>
              <h3>Upload your floor plan</h3>
              <p>Supports JPG, PNG, formats up to 50MB</p>
            </div>

            {!isSignedIn && (
              <div
                style={{
                  background: "var(--teal-muted)",
                  border:
                    "1px solid color-mix(in srgb, var(--teal) 40%, transparent)",
                  borderRadius: "10px",
                  padding: "0.6rem 0.875rem",
                  gap: "0.4rem",
                  marginBottom: "1rem",
                  display: "flex",
                  alignItems: "flex-start",
                }}
              >
                <span
                  style={{
                    fontSize: "0.75rem",
                    marginTop: "1px",
                    flexShrink: 0,
                    fontFamily: "monospace",
                    color: "var(--teal)",
                    letterSpacing: "0.05em",
                  }}
                >
                  //
                </span>
                <p
                  style={{
                    fontSize: "0.72rem",
                    color: "var(--fg-muted)",
                    margin: 0,
                    fontFamily: "monospace",
                    letterSpacing: "0.02em",
                    lineHeight: 1.6,
                  }}
                >
                  <span style={{ color: "var(--teal)", fontWeight: 600 }}>
                    Sign in required
                  </span>{" "}
                  — create a free Puter account to upload floor plans and
                  generate 3D spaces.
                </p>
              </div>
            )}

            <Upload onComplete={handleUploadComplete} />
          </div>
        </div>
      </section>

      <section className="projects" id="projects">
        <div className="section-inner">
          <div className="section-head">
            <div className="copy">
              <h2>{isSignedIn ? "Projects" : "What ArchNest can do"}</h2>
              <p>
                {isSignedIn
                  ? "Your latest work, all in one place"
                  : "From a simple floor plan to a fully rendered 3D space"}
              </p>
            </div>
          </div>

          {/* ── Logged out: feature showcase ── */}
          {!isSignedIn && (
            <div className="feature-showcase">
              <div className="feature-grid">
                <div className="feature-card">
                  <div className="feature-icon">
                    <svg viewBox="0 0 44 44" fill="none">
                      <rect
                        x="6"
                        y="6"
                        width="32"
                        height="32"
                        rx="2"
                        stroke="var(--teal)"
                        strokeWidth="1.5"
                      />
                      <line
                        x1="22"
                        y1="6"
                        x2="22"
                        y2="38"
                        stroke="var(--teal)"
                        strokeWidth="1"
                        opacity="0.5"
                      />
                      <line
                        x1="6"
                        y1="22"
                        x2="38"
                        y2="22"
                        stroke="var(--teal)"
                        strokeWidth="1"
                        opacity="0.5"
                      />
                      <path
                        d="M12 38 A10 10 0 0 0 22 28"
                        fill="none"
                        stroke="var(--teal)"
                        strokeWidth="1.2"
                      />
                    </svg>
                  </div>
                  <div className="feature-body">
                    <h3>Upload any floor plan</h3>
                    <p>JPG, PNG · up to 50MB</p>
                  </div>
                </div>
                <div className="feature-card">
                  <div className="feature-icon">
                    <svg viewBox="0 0 44 44" fill="none">
                      <polygon
                        points="22,6 36,14 36,30 22,38 8,30 8,14"
                        fill="rgba(13,148,136,0.1)"
                        stroke="var(--teal)"
                        strokeWidth="1.5"
                      />
                      <polygon
                        points="22,6 36,14 22,22 8,14"
                        fill="rgba(13,148,136,0.2)"
                        stroke="var(--teal)"
                        strokeWidth="1"
                      />
                      <line
                        x1="22"
                        y1="22"
                        x2="22"
                        y2="38"
                        stroke="var(--teal)"
                        strokeWidth="1"
                        opacity="0.5"
                      />
                    </svg>
                  </div>
                  <div className="feature-body">
                    <h3>AI generates in 3D</h3>
                    <p>Instant · no modelling needed</p>
                  </div>
                </div>
                <div className="feature-card">
                  <div className="feature-icon">
                    <svg viewBox="0 0 44 44" fill="none">
                      <rect
                        x="6"
                        y="10"
                        width="32"
                        height="24"
                        rx="2"
                        stroke="var(--teal)"
                        strokeWidth="1.5"
                      />
                      <path
                        d="M14 34 L14 38 M22 34 L22 38 M30 34 L30 38"
                        stroke="var(--teal)"
                        strokeWidth="1.2"
                        strokeLinecap="round"
                      />
                      <circle
                        cx="22"
                        cy="22"
                        r="6"
                        fill="rgba(13,148,136,0.15)"
                        stroke="var(--teal)"
                        strokeWidth="1.2"
                      />
                      <circle cx="22" cy="22" r="2" fill="var(--teal)" />
                    </svg>
                  </div>
                  <div className="feature-body">
                    <h3>Export & share</h3>
                    <p>Download · present · iterate</p>
                  </div>
                </div>
              </div>
              <div className="feature-cta">
                <span className="feature-eyebrow">// free to start</span>
                <h3>Turn your floor plan into 3D today</h3>
                <p>No credit card required</p>
                <div className="feature-cta-actions">
                  <a
                    href="#upload"
                    className="cta-btn"
                    onClick={scrollToUpload}
                  >
                    Get Started Free
                  </a>
                  <button className="outline-btn" onClick={handleAuthClick}>
                    Sign In
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── Logged in, no projects: empty state ── */}
          {isSignedIn && projects.length === 0 && (
            <div className="projects-empty">
              <svg className="empty-svg" viewBox="0 0 280 180" fill="none">
                <rect
                  x="20"
                  y="20"
                  width="110"
                  height="80"
                  fill="var(--teal-muted)"
                  stroke="none"
                />
                <rect
                  x="140"
                  y="20"
                  width="120"
                  height="50"
                  fill="var(--teal-muted)"
                  stroke="none"
                />
                <rect
                  x="20"
                  y="110"
                  width="100"
                  height="50"
                  fill="var(--teal-muted)"
                  stroke="none"
                />
                <rect
                  x="130"
                  y="80"
                  width="130"
                  height="80"
                  fill="var(--teal-muted)"
                  stroke="none"
                />
                <path
                  d="M20 20 H260 V160 H20 Z M140 20 V100 M20 100 H260 M120 100 V160 M130 80 H260"
                  stroke="var(--teal)"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                  strokeDasharray="900"
                  strokeDashoffset="900"
                  style={{ animation: "hero-plan-draw 2.2s ease forwards" }}
                />
                <circle cx="120" cy="100" r="3" fill="var(--teal)" />
                <circle cx="195" cy="140" r="3" fill="var(--teal)" />
              </svg>
              <h3>Your first project is waiting</h3>
              <p>
                Upload a 2D floor plan and watch ArchNest render it into a full
                3D space
              </p>
              <a href="#upload" className="cta-btn" onClick={scrollToUpload}>
                ↑ Upload a plan
              </a>
            </div>
          )}

          {/* ── Logged in, has projects ── */}
          {isSignedIn && projects.length > 0 && (
            <div className="projects-grid">
              {projects.map(
                (
                  { id, name, renderedImage, sourceImage, timestamp },
                  index,
                ) => (
                  <div
                    key={id}
                    data-project-id={id}
                    ref={(el) => {
                      if (el) cardRefs.current.set(id, el);
                      else cardRefs.current.delete(id);
                    }}
                    className={`project-card group${visibleIds.has(id) ? " in-view" : ""}`}
                    style={{ transitionDelay: `${(index % 3) * 90}ms` }}
                    onClick={() => navigate(`/visualizer/${id}`)}
                  >
                    <div className="preview">
                      <img src={renderedImage || sourceImage} alt="Project" />
                      <div className="preview-overlay">
                        <span className="preview-label">// open project</span>
                      </div>
                    </div>
                    <div className="card-body">
                      <div>
                        <h3>{name}</h3>
                        <div className="meta">
                          <Clock size={12} />
                          <span>
                            {new Date(timestamp).toLocaleDateString()}
                          </span>
                          <span>By D3v8ll</span>
                        </div>
                      </div>
                      <div className="arrow">
                        <ArrowUpRight size={18} />
                      </div>
                    </div>
                  </div>
                ),
              )}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
