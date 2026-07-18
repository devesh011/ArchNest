import React, { useEffect, useRef, useState } from "react";
import Button from "./ui/Button";
import { useNavigate, useOutletContext } from "react-router";
import Logo from "./ui/Logo";
import { Sun, Moon, Menu, X, ChartBar, ChevronDown } from "lucide-react";
import UsageWidget from "../components/ui/UsageWidget";
import { getAppStorageUsage, getMonthlyUsage } from "../lib/puter.action";
import { Link } from "react-router";

const Navbar = () => {
  const navigate = useNavigate();
  const { isSignedIn, userName, signIn, signOut } =
    useOutletContext<AuthContext>();

  const [dark, setDark] = useState(
    () =>
      typeof window !== "undefined" &&
      localStorage.getItem("archnest-theme") === "dark",
  );
  const [menuOpen, setMenuOpen] = useState(false);

  const [usageOpen, setUsageOpen] = useState(false);
  const usageMenuRef = useRef<HTMLDivElement>(null);

  const [usageExpanded, setUsageExpanded] = useState(false);
  const [usage, setUsage] = useState<any>(null);

  const handleAuthClick = async () => {
    if (isSignedIn) {
      try {
        await signOut();
      } catch (e) {
        console.error(e);
      }
      return;
    }
    try {
      await signIn();
    } catch (e) {
      console.error(e);
    }
  };

  const goToUpload = (e: React.MouseEvent) => {
    e.preventDefault();
    if (location.pathname === "/") {
      document.getElementById("upload")?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
      window.history.pushState(null, "", "#upload");
    } else {
      navigate("/#upload");
    }
  };

  const goToProjects = (e: React.MouseEvent) => {
    e.preventDefault();
    if (location.pathname === "/") {
      document
        .getElementById("projects")
        ?.scrollIntoView({ behavior: "smooth" });
      window.history.pushState(null, "", "#projects");
    } else {
      navigate("/#projects");
    }
  };
  const [storage, setStorage] = useState<{
    bytes: number;
    fileCount: number;
  } | null>(null);

  const refreshStorage = async () => {
    const s = await getAppStorageUsage();
    setStorage(s);
  };

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("archnest-theme", dark ? "dark" : "light");
  }, [dark]);

  const toggleDark = () => setDark((d) => !d);

  useEffect(() => {
    if (!isSignedIn) return;
    refreshStorage();
  }, [isSignedIn]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        usageMenuRef.current &&
        !usageMenuRef.current.contains(e.target as Node)
      ) {
        setUsageOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!isSignedIn) return;
    const load = async () => {
      const m = await getMonthlyUsage();
      setUsage(m);
    };
    load();
  }, [isSignedIn]);

  return (
    <header className={`navbar ${menuOpen ? "menu-open" : ""}`}>
      <nav className="inner">
        <div className="left">
          <div className="brand" onClick={() => navigate("/")}>
            <Logo />
            <span className="brand-name">ArchNest</span>
          </div>
          <ul className="links">
            {isSignedIn && (
              <Link to="/projects" onClick={goToProjects}>
                Projects
              </Link>
            )}
            <Link to="/product">Product</Link>
            <Link to="/pricing">Pricing</Link>
            <Link to="/community">Community</Link>
            <Link to="/enterprise">Enterprise</Link>
          </ul>
        </div>
        <div className="actions">
          {isSignedIn ? (
            <>
              <div
                className="usage-menu"
                ref={usageMenuRef}
                style={{ position: "relative" }}
              >
                <span
                  className="greeting"
                  onClick={() => setUsageOpen((o) => !o)}
                  style={{ cursor: "pointer" }}
                >
                  {userName ? `Hi, ${userName}` : "Signed in"}
                </span>
                {usageOpen && (
                  <div
                    style={{
                      position: "absolute",
                      top: "calc(100% + 8px)",
                      right: 0,
                      zIndex: 50,
                    }}
                  >
                    <UsageWidget />
                  </div>
                )}
              </div>
              <Button size="sm" onClick={handleAuthClick} className="btn">
                Log Out
              </Button>
            </>
          ) : (
            <>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleAuthClick}
                className="login"
              >
                Log In
              </Button>
              <a href="#upload" className="cta" onClick={goToUpload}>
                Get Started
              </a>
            </>
          )}
          <button
            onClick={toggleDark}
            className="dark-toggle"
            aria-label="Toggle dark mode"
          >
            {dark ? <Sun size={14} /> : <Moon size={14} />}
          </button>
          <button
            className="hamburger"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </nav>

      {menuOpen && (
        <div className="mobile-menu">
          {isSignedIn && (
            <Link
              to="/projects"
              onClick={(e) => {
                goToProjects(e);
                setMenuOpen(false);
              }}
            >
              Projects
            </Link>
          )}
          <Link to="/product" onClick={() => setMenuOpen(false)}>
            Product
          </Link>
          <Link to="/pricing" onClick={() => setMenuOpen(false)}>
            Pricing
          </Link>
          <Link to="/community" onClick={() => setMenuOpen(false)}>
            Community
          </Link>
          <Link to="/enterprise" onClick={() => setMenuOpen(false)}>
            Enterprise
          </Link>
          <div className="mobile-auth">
            <span className="mobile-greeting">
              {isSignedIn ? (userName ? `Hi, ${userName}` : "Signed in") : ""}
            </span>
            {isSignedIn ? (
              <Button
                size="sm"
                onClick={() => {
                  handleAuthClick();
                  setMenuOpen(false);
                }}
                className="btn"
                style={{ borderRadius: "999px", display: "inline-flex" }}
              >
                Log Out
              </Button>
            ) : (
              <div style={{ display: "flex", gap: "0.5rem", width: "100%" }}>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    handleAuthClick();
                    setMenuOpen(false);
                  }}
                  style={{ borderRadius: "999px" }}
                >
                  Log In
                </Button>
                <a
                  href="#upload"
                  onClick={(e) => {
                    goToUpload(e);
                    setMenuOpen(false);
                  }}
                  style={{
                    background: "var(--teal)",
                    color: "#fff",
                    padding: "0.35rem 1rem",
                    borderRadius: "999px",
                    fontSize: "0.78rem",
                    fontWeight: 600,
                    textDecoration: "none",
                    display: "inline-flex",
                    alignItems: "center",
                  }}
                >
                  Get Started
                </a>
              </div>
            )}
          </div>
          {isSignedIn && usage && storage && (
            <div className="mobile-usage">
              <div
                className="mobile-usage-row"
                onClick={() => setUsageExpanded((e) => !e)}
              >
                <div className="mobile-usage-label">
                  <ChartBar size={15} color="var(--teal)" />
                  <span>Usage</span>
                  <span className="mobile-usage-hint">
                    {(storage.bytes / 1024 / 1024).toFixed(2)} MB
                  </span>
                </div>
                <ChevronDown
                  size={14}
                  style={{
                    transform: usageExpanded
                      ? "rotate(180deg)"
                      : "rotate(0deg)",
                    transition: "transform 150ms",
                  }}
                />
              </div>

              {usageExpanded && (
                <div className="mobile-usage-detail">
                  <div className="usage-bar-row">
                    <span>Storage (ArchNest)</span>
                    <span>
                      {(storage.bytes / 1024 / 1024).toFixed(2)} MB ·{" "}
                      {storage.fileCount} files
                    </span>
                  </div>

                  <div className="usage-bar-row" style={{ marginTop: "10px" }}>
                    <span>Resources</span>
                    <span>
                      ${(usage.usage.total / 1e8).toFixed(2)} of $
                      {(usage.allowanceInfo.monthUsageAllowance / 1e8).toFixed(
                        2,
                      )}
                    </span>
                  </div>
                  <div className="usage-bar">
                    <div
                      className="usage-bar-fill"
                      style={{
                        width: `${Math.min(100, (usage.usage.total / usage.allowanceInfo.monthUsageAllowance) * 100)}%`,
                        background: "#EF9F27",
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
