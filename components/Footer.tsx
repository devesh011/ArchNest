import { useNavigate } from "react-router";
import Logo from "./ui/Logo";

const Footer = () => {
  const navigate = useNavigate();
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-top">
          <div className="footer-brand">
            <div className="footer-brand-row" onClick={() => navigate("/")}>
              <Logo />
              <span className="footer-brand-name">ArchNest</span>
            </div>
            <p className="footer-tagline">
              Turn any 2D floor plan into a fully modeled 3D space, powered by
              AI.
            </p>
          </div>
        </div>

        <div className="footer-bottom">
          <span>
            © {new Date().getFullYear()} ArchNest. All rights reserved.
          </span>
          <span className="footer-mono">scale 1:100 · unit mm</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
