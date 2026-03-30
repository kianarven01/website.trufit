"use client";

import AboutHero from "./AboutHero";
import ChapterOne from "./ChapterOne";
import ChapterTwo from "./ChapterTwo";
import ChapterThree from "./ChapterThree";
import AccreditationsPartners from "./AccreditationsPartners";
import VisionMissionValues from "./VisionMissionValues";
import AboutCTA from "./AboutCTA";

import "./about.css";

export default function AboutPage() {
  return (
    <div id="about-page">
      <AboutHero />
      <ChapterOne />
      <ChapterTwo />
      <ChapterThree />
      <AccreditationsPartners />
      <VisionMissionValues />
      <AboutCTA />
    </div>
  );
}
