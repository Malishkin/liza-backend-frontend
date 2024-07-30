import React from "react";
import "./About.css";
import aboutImage from "../images/11.png"; // Ensure the path to your image is correct

const About = () => {
  return (
    <div className="about-container">
      <div className="about-text">
        <p>
          El Messeg is a stylist and creative consultant with vast experience in
          the fashion industry spanning over the past decade.
        </p>
        <p>
          As an early adapter of social media, Liza has throughout the years
          obtained a deep understanding of content creation, social engagement,
          and branding strategies throughout the years.
        </p>
        <p>
          Liza’s aesthetic is both personally and professionally recognizable
          for the well-thought-through balance between classic Scandinavian
          minimalism and eye-catching twists. This cross-over enables her to
          have a good understanding of both the Scandinavian and the
          international markets.
        </p>
        <h3>Services</h3>
        <ul>
          <li>Styling</li>
          <li>Creative Consulting</li>
        </ul>
      </div>
      <div className="about-image">
        <img src={aboutImage} alt="El Messeg" />
      </div>
    </div>
  );
};

export default About;
