import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Work.css";

const Work = () => {
  const [workData, setWorkData] = useState([]);

  useEffect(() => {
    fetchWorkData();
  }, []);

  const fetchWorkData = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/items");
      setWorkData(response.data);
    } catch (error) {
      console.error("Error fetching work data:", error);
    }
  };

  return (
    <div className="work-container">
      <div className="work-section">
        {workData.map((categoryData, index) => (
          <div className="work-category" key={index}>
            <div className="work-gallery">
              {categoryData.images.map((image, idx) => (
                <div className="work-item" key={idx}>
                  <img
                    src={`http://localhost:5000/${image}`}
                    alt={`Work ${idx + 1}`}
                  />
                  {image === categoryData.shortImage && (
                    <h2 className="category-title">{categoryData.category}</h2>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Work;
