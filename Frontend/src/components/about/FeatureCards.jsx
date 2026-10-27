import { Code, MessagesSquare, PencilLine, Search, SlidersHorizontal, Sparkles } from "lucide-react";
import "./Cards.css";

const FEATURES = [
  { icon: MessagesSquare, tone: "tone-teal", title: "שיחות שמורות", text: "כל שיחה נשמרת, אפשר לחזור אליה ולהמשיך בדיוק מאיפה שעצרתם." },
  { icon: Search, tone: "tone-sky", title: "חיפוש לפי כותרת", text: "מוצאים שיחה ישנה במהירות, גם כשיש הרבה שיחות." },
  { icon: PencilLine, tone: "tone-lavender", title: "עריכה ויצירה מחדש", text: "עורכים את ההודעה האחרונה או מבקשים תשובה חדשה בלחיצה." },
  { icon: SlidersHorizontal, tone: "tone-teal", title: "סגנון תשובה", text: "קצר, מפורט או פשוט: בוחרים איך ה-AI יענה." },
  { icon: Code, tone: "tone-sky", title: "קוד ועיצוב", text: "תשובות מעוצבות עם כותרות, רשימות ובלוקי קוד עם כפתור העתקה." },
  { icon: Sparkles, tone: "tone-lavender", title: "כותרות אוטומטיות", text: "כל שיחה חדשה מקבלת כותרת קצרה, כדי שיהיה קל לדפדף." },
];

export default function FeatureCards() {
  return (
    <section>
      <h2 className="section-title">מה אפשר לעשות כאן</h2>
      <div className="cards-grid">
        {FEATURES.map(({ icon: Icon, tone, title, text }) => (
          <article key={title} className="info-card">
            <span className={`card-icon ${tone}`}>
              <Icon size={22} />
            </span>
            <h3>{title}</h3>
            <p>{text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
