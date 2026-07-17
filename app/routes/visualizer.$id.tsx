import { useEffect, useRef, useState } from "react";
import {
  useLocation,
  useNavigate,
  useOutletContext,
  useParams,
} from "react-router";
import Logo from "../../components/ui/Logo";
import { generate3DView } from "../../lib/ai.action";
import {
  Box,
  Download,
  RefreshCcw,
  RefreshCw,
  Share2,
  X,
  Sun,
  Moon,
  ChevronDown,
  FileText,
  Image as ImageIcon,
  AlertCircle,
  Trash2,
} from "lucide-react";
import Button from "../../components/ui/Button";
import {
  createProject,
  getProjectById,
  getPublicProjectById,
  shareProject,
  regenerateShareLink,
  deleteProject,
} from "../../lib/puter.action";
import { getSubdomainFromHostedUrl } from "../../lib/utils";
import {
  ReactCompareSlider,
  ReactCompareSliderImage,
} from "react-compare-slider";
import { jsPDF } from "jspdf";

type ShareModalStep = "confirm" | "manage" | "regenerate-confirm";

const VisualizerId = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { userId } = useOutletContext<AuthContext>();
  const hasInitialGenerated = useRef(false);

  const [project, setProject] = useState<DesignItem | null>(null);
  const [isProjectLoading, setIsProjectLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [dark, setDark] = useState(false);
  const [sharedLinkFailed, setSharedLinkFailed] = useState(false);
  const [loadedViaPublic, setLoadedViaPublic] = useState(false);

  const isOwner =
    !!project &&
    !!userId &&
    (project.ownerId === userId || (!project.ownerId && !loadedViaPublic));

  // Export menu
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const exportMenuRef = useRef<HTMLDivElement>(null);

  // ── Share: single button + single modal that walks through
  // confirm -> manage (link + copy + regenerate) -> regenerate-confirm.
  // No more separate "Regenerate Link" button sitting next to "Share" —
  // that's what made this confusing before.
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [shareModalStep, setShareModalStep] =
    useState<ShareModalStep>("confirm");
  const [isSharing, setIsSharing] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  // Delete
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const toggleDark = () => {
    document.documentElement.classList.toggle("dark");
    setDark((d) => !d);
  };

  const handleBack = () => navigate("/");

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        exportMenuRef.current &&
        !exportMenuRef.current.contains(e.target as Node)
      ) {
        setExportMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleExportPng = () => {
    if (!currentImage) return;

    const link = document.createElement("a");
    link.href = currentImage;
    link.download = `archnest-${id || "design"}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setExportMenuOpen(false);
  };

  const handleExportPdf = async () => {
    if (!currentImage) return;
    setIsExportingPdf(true);

    try {
      const img = new Image();
      img.crossOrigin = "anonymous";

      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () =>
          reject(new Error("Failed to load image for PDF export"));
        img.src = currentImage;
      });

      const width = img.naturalWidth || img.width;
      const height = img.naturalHeight || img.height;

      if (!width || !height) {
        throw new Error("Could not read image dimensions");
      }

      const orientation = width >= height ? "landscape" : "portrait";
      const doc = new jsPDF({
        orientation,
        unit: "px",
        format: [width, height],
      });

      doc.addImage(currentImage, "PNG", 0, 0, width, height);
      doc.save(`archnest-${id || "design"}.pdf`);
    } catch (e) {
      console.error("Failed to export PDF", e);
    } finally {
      setIsExportingPdf(false);
      setExportMenuOpen(false);
    }
  };

  // Derive the current shareable link straight from the project record
  // whenever we need it — never store it as separate state that could
  // drift out of sync with project.publicUrl/shareToken.
  const currentShareLink =
    project?.isPublic && project.id
      ? (() => {
          const subdomain = getSubdomainFromHostedUrl(project.publicUrl);
          const token = project.shareToken;
          if (!subdomain || !token) return null;
          return `${window.location.origin}/visualizer/${project.id}?s=${subdomain}&t=${token}`;
        })()
      : null;

  const handleShareButtonClick = () => {
    setShareModalStep(project?.isPublic ? "manage" : "confirm");
    setShareModalOpen(true);
  };

  const closeShareModal = () => {
    if (isSharing || isRegenerating) return;
    setShareModalOpen(false);
  };

  const confirmShareAction = async () => {
    if (!project?.id) return;
    setIsSharing(true);

    try {
      const result = await shareProject({ id: project.id });

      if (result.ok && result.project) {
        setProject(result.project);
        setShareModalStep("manage");
      } else {
        console.error("Failed to share project:", result.error);
      }
    } finally {
      setIsSharing(false);
    }
  };

  const confirmRegenerateAction = async () => {
    if (!project?.id) return;
    setIsRegenerating(true);

    try {
      const result = await regenerateShareLink({ id: project.id });

      if (result.ok && result.project) {
        setProject(result.project);
        setShareModalStep("manage");
      } else {
        console.error("Failed to regenerate share link:", result.error);
      }
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleCopyLink = async () => {
    if (!currentShareLink) return;
    try {
      await navigator.clipboard.writeText(currentShareLink);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch (e) {
      console.error("Failed to copy link", e);
    }
  };

  const handleDeleteClick = () => setShowDeleteConfirm(true);

  const confirmDeleteAction = async () => {
    if (!project?.id) return;
    setIsDeleting(true);

    try {
      const result = await deleteProject({ id: project.id });
      if (result.ok) {
        navigate("/");
      } else {
        console.error("Failed to delete project:", result.error);
        setIsDeleting(false);
        setShowDeleteConfirm(false);
      }
    } catch (e) {
      console.error("Failed to delete project:", e);
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const runGeneration = async (item: DesignItem) => {
    if (!id || !item.sourceImage) return;
    try {
      setIsProcessing(true);
      const result = await generate3DView({ sourceImage: item.sourceImage });

      if (result.renderedImage) {
        setCurrentImage(result.renderedImage);

        const updatedItem = {
          ...item,
          renderedImage: result.renderedImage,
          renderedPath: result.renderedPath,
          timestamp: Date.now(),
          ownerId: item.ownerId ?? userId ?? null,
          isPublic: item.isPublic ?? false,
        };

        const saved = await createProject({
          item: updatedItem,
          visibility: "private",
        });

        if (saved) {
          setProject(saved);
          setCurrentImage(saved.renderedImage || result.renderedImage);
        }
      }
    } catch (error) {
      console.error("Generation failed: ", error);
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const loadProject = async () => {
      if (!id) {
        setIsProjectLoading(false);
        return;
      }

      setIsProjectLoading(true);
      setSharedLinkFailed(false);
      setLoadedViaPublic(false);

      let fetchedProject = await getProjectById({ id });
      let fromPublic = false;

      if (!fetchedProject) {
        const params = new URLSearchParams(window.location.search);
        const subdomain = params.get("s");
        const token = params.get("t");

        if (subdomain && token) {
          fetchedProject = await getPublicProjectById({
            id,
            subdomain,
            token,
          });
          fromPublic = !!fetchedProject;
        }

        if (!fetchedProject && isMounted) {
          setSharedLinkFailed(true);
        }
      }

      if (!isMounted) return;

      setProject(fetchedProject);
      setLoadedViaPublic(fromPublic);
      setCurrentImage(fetchedProject?.renderedImage || null);
      setIsProjectLoading(false);
      hasInitialGenerated.current = false;
    };

    loadProject();

    return () => {
      isMounted = false;
    };
  }, [id]);

  useEffect(() => {
    if (
      isProjectLoading ||
      hasInitialGenerated.current ||
      !project?.sourceImage
    )
      return;

    if (project.renderedImage) {
      setCurrentImage(project.renderedImage);
      hasInitialGenerated.current = true;
      return;
    }

    hasInitialGenerated.current = true;
    void runGeneration(project);
  }, [project, isProjectLoading]);

  return (
    <div className="visualizer">
      <header className="navbar">
        <nav className="inner">
          <div className="left">
            <div className="brand" onClick={() => navigate("/")}>
              <Logo />
              <span className="brand-name">ArchNest</span>
            </div>
          </div>
          <div className="actions">
            <button
              onClick={toggleDark}
              className="dark-toggle"
              aria-label="Toggle dark mode"
            >
              {dark ? <Sun size={14} /> : <Moon size={14} />}
            </button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className="exit"
            >
              <X className="icon" />
              <span className="exit-label">Exit Editor</span>
            </Button>
          </div>
        </nav>
      </header>

      {sharedLinkFailed ? (
        <section className="content">
          <div className="panel panel--compact">
            <div className="link-unavailable">
              <div className="icon-badge">
                <AlertCircle />
              </div>
              <h3>This link is no longer available</h3>
              <p>This project either doesn't exist or hasn't been shared.</p>
              <button className="btn btn--primary btn--md" onClick={handleBack}>
                Back to ArchNest
              </button>
            </div>
          </div>
        </section>
      ) : (
        <section className="content">
          <div className="panel">
            <div className="panel-header">
              <div className="panel-meta">
                <p>Project</p>
                <h2>{project?.name || `Residence ${id}`}</h2>
                <p className="note">
                  {isOwner ? "Created by You" : "Shared project"}
                  {project?.isPublic && (
                    <span className="shared-tag">// shared</span>
                  )}
                </p>
              </div>
              <div className="panel-actions">
                <div className="export-menu" ref={exportMenuRef}>
                  <Button
                    size="sm"
                    onClick={() => setExportMenuOpen((o) => !o)}
                    className="export"
                    disabled={!currentImage}
                    aria-label="Export"
                  >
                    <Download className="w-4 h-4" />{" "}
                    <span className="btn-label">Export</span>
                    <ChevronDown className="w-3.5 h-3.5" />
                  </Button>
                  {exportMenuOpen && (
                    <div className="export-dropdown">
                      <button onClick={handleExportPng}>
                        <ImageIcon className="w-4 h-4" /> PNG
                      </button>
                      <button
                        onClick={handleExportPdf}
                        disabled={isExportingPdf}
                      >
                        <FileText className="w-4 h-4" />
                        {isExportingPdf ? "Preparing PDF…" : "PDF"}
                      </button>
                    </div>
                  )}
                </div>
                {isOwner && (
                  <Button
                    size="sm"
                    onClick={handleShareButtonClick}
                    className={`share ${project?.isPublic ? "is-shared" : ""}`}
                    disabled={!project?.id || isSharing}
                    aria-label={project?.isPublic ? "Shared" : "Share"}
                  >
                    <Share2 className="w-4 h-4" />
                    <span className="btn-label">
                      {project?.isPublic ? "Shared" : "Share"}
                    </span>
                  </Button>
                )}
                {isOwner && (
                  <button
                    className="delete-btn"
                    onClick={handleDeleteClick}
                    disabled={!project?.id || isDeleting}
                    aria-label="Delete"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      height: "2.25rem",
                      padding: "0 0.9rem",
                      borderRadius: "8px",
                      border: "1px solid var(--border-strong)",
                      background: "transparent",
                      color: "#dc2626",
                      fontSize: "0.85rem",
                      fontWeight: 500,
                      cursor:
                        project?.id && !isDeleting ? "pointer" : "not-allowed",
                      opacity: !project?.id || isDeleting ? 0.5 : 1,
                      transition:
                        "background 200ms ease, border-color 200ms ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "rgba(220,38,38,0.08)";
                      e.currentTarget.style.borderColor = "#dc2626";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "transparent";
                      e.currentTarget.style.borderColor =
                        "var(--border-strong)";
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                    <span className="btn-label">Delete</span>
                  </button>
                )}
              </div>
            </div>

            <div
              className={`render-area ${isProcessing ? "is-processing" : ""}`}
            >
              {currentImage ? (
                <img
                  src={currentImage}
                  alt="AI Render"
                  className="render-img"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                    display: "block",
                  }}
                />
              ) : (
                <div className="render-placeholder">
                  {project?.sourceImage && (
                    <img
                      src={project?.sourceImage}
                      alt="Original"
                      className="render-fallback"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "contain",
                        display: "block",
                      }}
                    />
                  )}
                </div>
              )}

              {isProcessing && (
                <div className="render-overlay">
                  <div className="rendering-card">
                    <RefreshCcw className="spinner" />
                    <span className="title">Rendering...</span>
                    <span className="subtitle">
                      Generating your 3D visualization
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="panel compare">
            <div className="panel-header">
              <div className="panel-meta">
                <p>Comparison</p>
                <h3>Before and After</h3>
              </div>
              <div className="hint">Drag to compare</div>
            </div>

            <div className="compare-stage">
              {project?.sourceImage && currentImage ? (
                <ReactCompareSlider
                  defaultValue={50}
                  itemOne={
                    <ReactCompareSliderImage
                      src={project?.sourceImage}
                      alt="before"
                      className="compare-img"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "contain",
                      }}
                    />
                  }
                  itemTwo={
                    <ReactCompareSliderImage
                      src={currentImage || project?.renderedImage}
                      alt="after"
                      className="compare-img"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "contain",
                      }}
                    />
                  }
                />
              ) : (
                <div className="compare-fallback">
                  {project?.sourceImage && (
                    <img
                      src={project.sourceImage}
                      alt="Before"
                      className="compare-img"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "contain",
                      }}
                    />
                  )}
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ── Single share modal, three steps ── */}
      {shareModalOpen && (
        <div className="auth-modal" onClick={closeShareModal}>
          <div className="panel" onClick={(e) => e.stopPropagation()}>
            {shareModalStep === "confirm" && (
              <>
                <div className="icon">
                  <Share2 className="alert" />
                </div>
                <h3>Share this project?</h3>
                <p>
                  Anyone with the link will be able to view this project. You
                  can regenerate the link later to kill an old one, or delete
                  the project entirely — but there's currently no way to make a
                  shared project fully private again.
                </p>
                <div className="actions">
                  <button
                    className="btn btn--primary btn--full confirm"
                    onClick={confirmShareAction}
                    disabled={isSharing}
                  >
                    {isSharing ? "Please wait…" : "Share"}
                  </button>
                  <span className="cancel" onClick={closeShareModal}>
                    Cancel
                  </span>
                </div>
              </>
            )}

            {shareModalStep === "manage" && (
              <>
                <div className="icon">
                  <Share2 className="alert" />
                </div>
                <h3>This project is shared</h3>
                <p>Anyone with the link below can view it.</p>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    background: "var(--bg-surface)",
                    border: "1px solid var(--border-strong)",
                    borderRadius: "8px",
                    padding: "0.6rem 0.75rem",
                    marginBottom: "1rem",
                  }}
                >
                  <input
                    readOnly
                    value={currentShareLink || ""}
                    style={{
                      flex: 1,
                      background: "transparent",
                      border: "none",
                      outline: "none",
                      fontSize: "0.8rem",
                      color: "var(--fg-muted)",
                      fontFamily: "monospace",
                    }}
                    onFocus={(e) => e.target.select()}
                  />
                </div>
                <div className="actions">
                  <button
                    className="btn btn--primary btn--full confirm"
                    onClick={handleCopyLink}
                  >
                    {linkCopied ? "Copied!" : "Copy Link"}
                  </button>
                  <button
                    className="btn btn--outline btn--full"
                    onClick={() => setShareModalStep("regenerate-confirm")}
                    style={{ marginTop: "0.5rem" }}
                  >
                    <RefreshCw
                      className="w-4 h-4"
                      style={{ marginRight: "0.5rem" }}
                    />
                    Regenerate Link
                  </button>
                  <span className="cancel" onClick={closeShareModal}>
                    Close
                  </span>
                </div>
              </>
            )}

            {shareModalStep === "regenerate-confirm" && (
              <>
                <div className="icon">
                  <RefreshCw className="alert" />
                </div>
                <h3>Regenerate share link?</h3>
                <p>
                  A brand new link will be generated immediately. The old link
                  will stop working too, though it may take a few minutes to
                  fully expire due to caching on the hosting layer — this isn't
                  something the app can control.
                </p>
                <div className="actions">
                  <button
                    className="btn btn--primary btn--full confirm"
                    onClick={confirmRegenerateAction}
                    disabled={isRegenerating}
                  >
                    {isRegenerating ? "Please wait…" : "Regenerate Link"}
                  </button>
                  <span
                    className="cancel"
                    onClick={() =>
                      !isRegenerating && setShareModalStep("manage")
                    }
                  >
                    Back
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div
          className="auth-modal"
          onClick={() => !isDeleting && setShowDeleteConfirm(false)}
        >
          <div className="panel" onClick={(e) => e.stopPropagation()}>
            <div className="icon" style={{ background: "rgba(220,38,38,0.1)" }}>
              <Trash2 className="alert" style={{ color: "#dc2626" }} />
            </div>
            <h3>Delete this project?</h3>
            <p>
              This will permanently delete "{project?.name || `Residence ${id}`}
              " and its images. This cannot be undone.
            </p>
            <div className="actions">
              <button
                className="btn btn--full confirm"
                onClick={confirmDeleteAction}
                disabled={isDeleting}
                style={{ background: "#dc2626", color: "#fff" }}
              >
                {isDeleting ? "Deleting…" : "Delete Project"}
              </button>
              <span
                className="cancel"
                onClick={() => !isDeleting && setShowDeleteConfirm(false)}
              >
                Cancel
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VisualizerId;
