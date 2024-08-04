import React, { useState, useEffect } from "react";
import axios from "../axiosConfig"; // Убедитесь, что путь правильный
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

  return (
    <div className="work-container">
      <div className="work-section">
        {workData.map((categoryData, index) => (
          <div className="work-category" key={index}>
            <div className="work-gallery">
              {categoryData.images.map((image, idx) => (
                <div className="work-item" key={idx}>
                  <img
                    src={`${axios.defaults.baseURL}/${image}`}
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
