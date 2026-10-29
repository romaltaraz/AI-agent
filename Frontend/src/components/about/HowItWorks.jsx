import { ArrowDown, ArrowLeft, ArrowUpDown } from "lucide-react";
import { FastApiIcon, MySqlIcon, OpenAiIcon, ReactIcon } from "../icons/BrandIcons";
import howItWorksImage from "../../assets/illustrations/how-it-works.svg";
import "./HowItWorks.css";

function Node({ icon: Icon, tone, name, text }) {
  return (
    <div className="flow-node">
      <span className={`flow-icon ${tone}`}>
        <Icon size={26} />
      </span>
      <strong>{name}</strong>
      <span>{text}</span>
    </div>
  );
}

// The arrow points left on a wide screen (the page reads right to left)
// and down on a phone, where the boxes are stacked.
function Arrow({ className = "" }) {
  return (
    <span className={`flow-arrow ${className}`} aria-hidden="true">
      <ArrowLeft className="arrow-side" size={26} />
      <ArrowDown className="arrow-down" size={26} />
    </span>
  );
}

export default function HowItWorks() {
  return (
    <section className="how">
      <div className="how-intro">
        <div>
          <h2 className="section-title">איך זה עובד</h2>
          <p>
            כשאתם שולחים הודעה, ה-React שולח אותה לשרת FastAPI. השרת שומר אותה ב-MySQL, מבקש תשובה מ-OpenAI,
            שומר גם אותה ומחזיר אותה אליכם. מפתח ה-API נשאר בשרת בלבד.
          </p>
        </div>
        {/* Decorative picture (a simple SVG): replace src/assets/illustrations/how-it-works.svg */}
        <img src={howItWorksImage} alt="" />
      </div>

      <div
        className="flow"
        role="group"
        aria-label="תרשים: React שולח ל-FastAPI, FastAPI מדבר עם OpenAI ושומר ב-MySQL"
      >
        <div className="flow-react">
          <Node icon={ReactIcon} tone="tone-sky" name="React" text="הדפדפן" />
        </div>
        <Arrow className="flow-arrow-1" />
        <div className="flow-api">
          <Node icon={FastApiIcon} tone="tone-teal" name="FastAPI" text="השרת" />
        </div>
        <Arrow className="flow-arrow-2" />
        <div className="flow-ai">
          <Node icon={OpenAiIcon} tone="tone-teal" name="OpenAI" text="ה-AI" />
        </div>
        <div className="flow-db">
          <span className="flow-arrow" aria-hidden="true">
            <ArrowUpDown size={26} />
          </span>
          <Node icon={MySqlIcon} tone="tone-lavender" name="MySQL" text="מסד הנתונים" />
          <small>FastAPI ↔ MySQL: שמירה וקריאה של השיחות</small>
        </div>
      </div>
    </section>
  );
}
