import { Braces, GraduationCap, Mail, UtensilsCrossed } from "lucide-react";
import { APP_NAME } from "../config";
import welcomeImage from "../assets/illustrations/welcome.svg";
import "./Welcome.css";

const EXAMPLE_PROMPTS = [
  { icon: Braces, tone: "tone-teal", text: "הסבר לי במילים פשוטות מה זה API" },
  { icon: UtensilsCrossed, tone: "tone-sky", text: "תן לי רעיון לארוחת ערב מהירה וטעימה" },
  { icon: GraduationCap, tone: "tone-lavender", text: "איך אפשר ללמוד לתכנת בצורה יעילה?" },
  { icon: Mail, tone: "tone-teal", text: "כתוב לי מייל קצר לבקשת דחייה במועד הגשה" },
];

export default function Welcome({ onPick, disabled }) {
  return (
    <div className="welcome">
      {/* Decorative picture (an unDraw illustration): replace src/assets/illustrations/welcome.svg */}
      <img className="welcome-illustration" src={welcomeImage} alt="" />
      <h1>ברוכים הבאים ל{APP_NAME}</h1>
      <p>שאלו כל שאלה, או התחילו מאחת ההצעות:</p>
      <div className="welcome-prompts">
        {EXAMPLE_PROMPTS.map(({ icon: Icon, tone, text }) => (
          <button key={text} className="prompt-card" disabled={disabled} onClick={() => onPick(text)}>
            <span className={`prompt-icon ${tone}`}>
              <Icon size={20} />
            </span>
            <span className="prompt-text">{text}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
