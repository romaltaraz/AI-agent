import { User } from "lucide-react";
import { GitHubIcon, LinkedInIcon } from "../icons/BrandIcons";
import "./AboutMeCard.css";

// TODO: replace the placeholders below with your real details.
// While a link is empty, its button shows as "link will be added" and does nothing.
const PROFILE = {
  name: "[השם שלי]",
  bio: "[כאן יבוא תיאור קצר עליי: מי אני, מה אני לומד ומה אני אוהב לבנות.]",
  github: "", // e.g. "https://github.com/your-name"
  linkedin: "", // e.g. "https://www.linkedin.com/in/your-name"
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
