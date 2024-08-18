import React, { useState, useEffect } from "react";
import axios from "../axiosConfig";
import "./Work.css";

const Work = () => {
  const [workData, setWorkData] = useState([]);

  useEffect(() => {
    fetchWorkData();
  }, []);

  const fetchWorkData = async () => {
    try {
      const response = await axios.get("/api/items");
      setWorkData(response.data);
    } catch (error) {
      console.error("Error fetching work data:", error);
    }
  };

  const handleImageLoad = (event) => {
    event.target.parentNode.classList.add("loaded");
  };

  return (
    <div className="work-container">
      <div className="work-gallery">
        {workData.map((categoryData, index) => (
          <div className="work-category" key={index}>
            {categoryData.images.map((image, idx) => (
              <div className="work-item" key={idx}>
                <img
                  src={`${axios.defaults.baseURL}${image}`}
                  alt={`Work ${idx + 1}`}
                  onLoad={handleImageLoad}
                />
              </div>
            ))}
            {categoryData.shortImage && categoryData.category && (
              <div className="category-title">{categoryData.category}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Work;
