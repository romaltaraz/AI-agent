import AboutHero from "../components/about/AboutHero";
import AboutMeCard from "../components/about/AboutMeCard";
import FeatureCards from "../components/about/FeatureCards";
import TechSection from "../components/about/TechSection";
import HowItWorks from "../components/about/HowItWorks";
import Disclaimer from "../components/Disclaimer";
import "./About.css";

export default function About() {
  return (
    <div className="about-page">
      <div className="about-inner">
        <AboutHero />
        <AboutMeCard />
        <FeatureCards />
        <TechSection />
        <HowItWorks />
        <Disclaimer />
      </div>
    </div>
  );
}
