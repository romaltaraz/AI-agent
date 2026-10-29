import { User } from "lucide-react";
import { GitHubIcon, LinkedInIcon } from "../icons/BrandIcons";
import "./AboutMeCard.css";

// The details shown on the About Me card. To change them, edit this object.
// If a link is left empty, its button shows as "link will be added" and does nothing.
const PROFILE = {
  name: "רום אלטרץ",
  bio: "סטודנטית להנדסת תעשייה וניהול באוניברסיטת בן־גוריון, עם רקע בפיתוח Full Stack ובבינה מלאכותית יוצרת. הפרויקט הזה משלב בין הידע שרכשתי במהלך הלימודים לבין הרצון שלי לבנות אפליקציות שימושיות ונוחות למשתמש.",
  github: "https://github.com/romaltaraz",
  linkedin: "https://www.linkedin.com/in/rom-altaraz-700533176/",
};

function ProfileLink({ url, label, icon: Icon }) {
  if (!url) {
    return (
      <span className="profile-link profile-link-empty" title="הקישור יתווסף בהמשך">
        <Icon size={18} /> {label} <small>(קישור יתווסף)</small>
      </span>
    );
  }
  return (
    <a className="profile-link" href={url} target="_blank" rel="noopener noreferrer">
      <Icon size={18} /> {label}
    </a>
  );
}

export default function AboutMeCard() {
  return (
    <section className="about-me-card">
      <div className="photo-placeholder" aria-label="מקום לתמונה שלי">
        <User size={44} />
        <span>מקום לתמונה</span>
      </div>
      <div className="about-me-text">
        <h2>קצת עליי</h2>
        <p className="profile-name">{PROFILE.name}</p>
        <p className="profile-bio">{PROFILE.bio}</p>
        <div className="profile-links">
          <ProfileLink url={PROFILE.github} label="GitHub" icon={GitHubIcon} />
          <ProfileLink url={PROFILE.linkedin} label="LinkedIn" icon={LinkedInIcon} />
        </div>
      </div>
    </section>
  );
}
