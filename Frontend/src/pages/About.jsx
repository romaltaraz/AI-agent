import { Brain, Code, Database, ExternalLink, Server, User } from "lucide-react";
import { APP_NAME } from "../config";
import "./About.css";

const TECHNOLOGIES = [
  { name: "React", icon: Brain, text: "ממשק המשתמש" },
  { name: "FastAPI", icon: Server, text: "שרת ה-API" },
  { name: "MySQL", icon: Database, text: "שמירת השיחות" },
  { name: "OpenAI", icon: Brain, text: "התשובות החכמות" },
];

export default function About() {
  return (
    <div className="about-page">
      <div className="about-inner">
        <h1>אודות {APP_NAME}</h1>
        <p className="about-lead">
          אתר צ'אט עם בינה מלאכותית בעברית: שיחות נשמרות, ההקשר נשמר, והתשובות מעוצבות.
        </p>

        <section className="about-card about-me">
          <div className="about-photo" aria-label="מקום לתמונה">
            <User size={40} />
          </div>
          <div>
            <h2>קצת עליי</h2>
            {/* TODO: replace the placeholders below with real details */}
            <p>[כאן יבוא תיאור קצר עליי]</p>
            <div className="about-links">
              <a href="#github">
                <Code size={18} /> GitHub (קישור יתווסף)
              </a>
              <a href="#linkedin">
                <ExternalLink size={18} /> LinkedIn (קישור יתווסף)
              </a>
            </div>
          </div>
        </section>

        <h2>טכנולוגיות</h2>
        <div className="about-tech">
          {TECHNOLOGIES.map(({ name, icon: Icon, text }) => (
            <div key={name} className="about-card about-tech-item">
              <Icon size={26} />
              <strong>{name}</strong>
              <span>{text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
