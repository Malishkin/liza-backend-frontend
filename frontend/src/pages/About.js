import React, { useState, useEffect } from "react";
import axios from "../axiosConfig";
import { Helmet } from "react-helmet";
import "./About.css";

const About = () => {
  const [aboutContent, setAboutContent] = useState("");
  const [aboutImage, setAboutImage] = useState("");

  useEffect(() => {
    const fetchAboutContent = async () => {
      try {
        const response = await axios.get("/api/about");
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
      <Helmet>
        <title>About Us | El Messeg</title>
        <meta name="description" content="Learn more about El Messeg." />
        <meta name="keywords" content="about, El Messeg, information" />
      </Helmet>
      <div className="about-text">
        {aboutContent.split("\n").map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
      </div>
      <div className="about-image">
        {aboutImage && (
          <img src={`${axios.defaults.baseURL}${aboutImage}`} alt="El Messeg" />
        )}
      </div>
    </div>
  );
};

export default About;
