import { APP_NAME } from "../../config";
import heroImage from "../../assets/illustrations/about-hero.svg";
import "./AboutHero.css";

export default function AboutHero() {
  return (
    <section className="about-hero">
      <div>
        <span className="about-badge">פרויקט גמר</span>
        <h1>אודות {APP_NAME}</h1>
        <p>
          אתר צ'אט עם בינה מלאכותית בעברית. השיחות נשמרות, ההקשר נשמר, והתשובות מעוצבות ונעימות לקריאה.
        </p>
      </div>
      {/* Decorative picture (a simple SVG): replace src/assets/illustrations/about-hero.svg */}
      <img src={heroImage} alt="" />
    </section>
  );
}
