import React, { useState, useEffect } from "react";
import axios from "axios";
import "./About.css";

const About = () => {
  const [aboutContent, setAboutContent] = useState("");
  const [aboutImage, setAboutImage] = useState("");

  useEffect(() => {
    const fetchAboutContent = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/about");
        if (response.data) {
          setAboutContent(response.data.content);
          setAboutImage(response.data.image);
        }
      } catch (error) {
        console.error("Error fetching about content:", error);
      }
    };

    fetchAboutContent();
  }, []);

  return (
    <div className="about-container">
      <div className="about-text">
        <div dangerouslySetInnerHTML={{ __html: aboutContent }} />
        <p>Services Styling Creative Consulting</p>
      </div>
      <div className="about-image">
        {aboutImage && (
          <img src={`http://localhost:5000/${aboutImage}`} alt="El Messeg" />
        )}
      </div>
    </div>
  );
};

export default About;
