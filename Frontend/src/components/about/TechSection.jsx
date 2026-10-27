import { FastApiIcon, MySqlIcon, OpenAiIcon, ReactIcon } from "../icons/BrandIcons";
import "./Cards.css";

const TECHNOLOGIES = [
  { icon: ReactIcon, tone: "tone-sky", name: "React", text: "ממשק המשתמש" },
  { icon: FastApiIcon, tone: "tone-teal", name: "FastAPI", text: "שרת ה-API בפייתון" },
  { icon: MySqlIcon, tone: "tone-lavender", name: "MySQL", text: "שמירת השיחות וההודעות" },
  { icon: OpenAiIcon, tone: "tone-teal", name: "OpenAI", text: "התשובות החכמות" },
];

export default function TechSection() {
  return (
    <section>
      <h2 className="section-title">הטכנולוגיות שמאחורי האתר</h2>
      <div className="cards-grid tech-grid">
        {TECHNOLOGIES.map(({ icon: Icon, tone, name, text }) => (
          <article key={name} className="info-card tech-card">
            <span className={`card-icon card-icon-large ${tone}`}>
              <Icon size={30} />
            </span>
            <h3>{name}</h3>
            <p>{text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
