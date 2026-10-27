import { NavLink } from "react-router-dom";
import { Info, MessageCircle, Sparkles } from "lucide-react";
import { APP_NAME } from "../config";
import "./NavBar.css";

export default function NavBar() {
  return (
    <header className="navbar">
      <div className="navbar-brand">
        <Sparkles size={22} />
        <span>{APP_NAME}</span>
      </div>
      <nav className="navbar-links">
        <NavLink to="/" end aria-label="בית">
          <MessageCircle size={18} />
          <span>בית</span>
        </NavLink>
        <NavLink to="/about" aria-label="אודות">
          <Info size={18} />
          <span>אודות</span>
        </NavLink>
      </nav>
    </header>
  );
}
