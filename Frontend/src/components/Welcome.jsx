import { Sparkles } from "lucide-react";
import { APP_NAME } from "../config";
import "./Welcome.css";

const EXAMPLE_PROMPTS = [
  "הסבר לי במילים פשוטות מה זה API",
  "תן לי רעיון לארוחת ערב מהירה וטעימה",
  "איך אפשר ללמוד לתכנת בצורה יעילה?",
  "כתוב לי מייל קצר לבקשת דחייה במועד הגשה",
];

export default function Welcome({ onPick, disabled }) {
  return (
    <div className="welcome">
      <div className="welcome-icon">
        <Sparkles size={34} />
      </div>
      <h1>ברוכים הבאים ל{APP_NAME}</h1>
      <p>שאלו כל שאלה, או בחרו אחת מההצעות:</p>
      <div className="welcome-prompts">
        {EXAMPLE_PROMPTS.map((prompt) => (
          <button key={prompt} disabled={disabled} onClick={() => onPick(prompt)}>
            {prompt}
          </button>
        ))}
      </div>
    </div>
  );
}
